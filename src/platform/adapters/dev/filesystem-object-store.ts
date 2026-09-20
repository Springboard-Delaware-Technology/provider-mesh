import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { ObjectMetadata, ObjectStore, StoredObject } from '../../ports/index.js';

/**
 * Development `ObjectStore` adapter (Foundation 001 §4.4): a local filesystem under a
 * git-ignored directory (`var/`, §1.7), content-addressed.
 *
 * Content lives once under `objects/<sha256>` whatever its key; each key is a small JSON record
 * under `keys/` naming the content by its SHA-256 and carrying the metadata. Writes are atomic
 * (temporary file, then rename). A read verifies the content against its recorded SHA-256, so a
 * file altered in place is reported rather than returned. No public URL exists, by design.
 *
 * This adapter is not immutable storage and runs under the same operating-system identity as
 * the application: the independent checkpoint store required before the protected-continuity
 * gate is recorded as not established in `ENVIRONMENTS.md` (§6.4; `SEC-AUD-04`).
 */
export class ObjectStoreError extends Error {
  readonly code: 'invalid_key' | 'invalid_label' | 'content_integrity' | 'record_invalid';
  constructor(code: ObjectStoreError['code'], detail: string) {
    super(`object store: ${code} (${detail})`);
    this.name = 'ObjectStoreError';
    this.code = code;
  }
}

interface KeyRecord {
  readonly key: string;
  readonly metadata: ObjectMetadata;
}

const KEY = /^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,511}$/;
const LABEL_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

function validateKey(key: string): string {
  if (!KEY.test(key) || key.includes('..')) throw new ObjectStoreError('invalid_key', 'key');
  return key;
}

function validateLabels(
  labels: Readonly<Record<string, string>> | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(labels ?? {})) {
    if (!LABEL_NAME.test(name)) throw new ObjectStoreError('invalid_label', 'name');
    if (typeof value !== 'string' || value.length > 1024) {
      throw new ObjectStoreError('invalid_label', name);
    }
    out[name] = value;
  }
  return out;
}

function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

async function writeAtomically(target: string, bytes: Uint8Array | string): Promise<void> {
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${randomBytes(6).toString('hex')}.tmp`;
  try {
    await writeFile(temporary, bytes, { mode: 0o600 });
    await rename(temporary, target);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}

function isNotFound(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

function isMetadata(value: unknown): value is ObjectMetadata {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m['contentType'] === 'string' &&
    typeof m['sizeBytes'] === 'number' &&
    typeof m['contentSha256'] === 'string' &&
    /^[0-9a-f]{64}$/.test(m['contentSha256']) &&
    typeof m['storedAt'] === 'string' &&
    typeof m['labels'] === 'object' &&
    m['labels'] !== null
  );
}

export class FilesystemObjectStore implements ObjectStore {
  readonly #root: string;

  constructor(root: string) {
    this.#root = path.resolve(root);
  }

  /** The directory this adapter writes under; recorded, never derived from a request. */
  get root(): string {
    return this.#root;
  }

  #contentPath(sha256: string): string {
    return path.join(this.#root, 'objects', sha256.slice(0, 2), sha256);
  }

  #keyPath(key: string): string {
    // The key is opaque and may contain `/`; its base64url form is a safe single file name.
    return path.join(this.#root, 'keys', `${Buffer.from(key, 'utf8').toString('base64url')}.json`);
  }

  async #readRecord(key: string): Promise<KeyRecord | null> {
    let text: string;
    try {
      text = await readFile(this.#keyPath(validateKey(key)), 'utf8');
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new ObjectStoreError('record_invalid', 'key record is not JSON');
    }
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (parsed as Record<string, unknown>)['key'] !== key ||
      !isMetadata((parsed as Record<string, unknown>)['metadata'])
    ) {
      throw new ObjectStoreError('record_invalid', 'key record shape');
    }
    const record = parsed as KeyRecord;
    return { key, metadata: { ...record.metadata, labels: { ...record.metadata.labels } } };
  }

  async put(
    key: string,
    bytes: Uint8Array,
    options: { readonly contentType: string; readonly labels?: Readonly<Record<string, string>> },
  ): Promise<ObjectMetadata> {
    validateKey(key);
    const labels = validateLabels(options.labels);
    const contentSha256 = sha256Hex(bytes);
    const content = this.#contentPath(contentSha256);
    // Content-addressed: identical bytes are stored once; an existing file is left untouched.
    try {
      await readFile(content);
    } catch (error) {
      if (!isNotFound(error)) throw error;
      await writeAtomically(content, bytes);
    }
    const metadata: ObjectMetadata = {
      contentType: options.contentType,
      sizeBytes: bytes.byteLength,
      contentSha256,
      storedAt: new Date().toISOString(),
      labels,
    };
    const record: KeyRecord = { key, metadata };
    await writeAtomically(this.#keyPath(key), JSON.stringify(record));
    return metadata;
  }

  async get(key: string): Promise<StoredObject | null> {
    const record = await this.#readRecord(key);
    if (record === null) return null;
    let bytes: Uint8Array;
    try {
      bytes = await readFile(this.#contentPath(record.metadata.contentSha256));
    } catch (error) {
      if (isNotFound(error)) throw new ObjectStoreError('content_integrity', 'content missing');
      throw error;
    }
    if (sha256Hex(bytes) !== record.metadata.contentSha256) {
      throw new ObjectStoreError('content_integrity', 'content differs from its recorded hash');
    }
    return { bytes, metadata: record.metadata };
  }

  async head(key: string): Promise<ObjectMetadata | null> {
    const record = await this.#readRecord(key);
    return record === null ? null : record.metadata;
  }

  /** Removes the key; content stays, since other keys may name the same bytes. */
  async delete(key: string): Promise<boolean> {
    const target = this.#keyPath(validateKey(key));
    try {
      await rm(target);
      return true;
    } catch (error) {
      if (isNotFound(error)) return false;
      throw error;
    }
  }
}
