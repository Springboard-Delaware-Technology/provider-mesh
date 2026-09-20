import { readdir, readFile, writeFile } from 'node:fs/promises';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { beforeEach, describe, expect, it } from 'vitest';

import {
  FilesystemObjectStore,
  ObjectStoreError,
} from '../../../src/platform/adapters/dev/index.js';

const bytes = (text: string): Uint8Array => new TextEncoder().encode(text);

describe('ObjectStore development adapter (§4.4, A15 groundwork, A28)', () => {
  let store: FilesystemObjectStore;
  beforeEach(async () => {
    store = new FilesystemObjectStore(await mkdtemp(path.join(tmpdir(), 'pm-object-store-')));
  });

  it('puts, heads, gets, and deletes by opaque key with metadata', async () => {
    const put = await store.put('audit-checkpoints/synthetic/one.json', bytes('{"a":1}'), {
      contentType: 'application/json',
      labels: { kind: 'checkpoint' },
    });
    expect(put).toMatchObject({
      contentType: 'application/json',
      sizeBytes: 7,
      contentSha256: expect.stringMatching(/^[0-9a-f]{64}$/) as string,
      labels: { kind: 'checkpoint' },
    });
    expect(await store.head('audit-checkpoints/synthetic/one.json')).toEqual(put);
    const got = await store.get('audit-checkpoints/synthetic/one.json');
    expect(got?.metadata).toEqual(put);
    expect(new TextDecoder().decode(got?.bytes)).toBe('{"a":1}');
    expect(await store.delete('audit-checkpoints/synthetic/one.json')).toBe(true);
    expect(await store.delete('audit-checkpoints/synthetic/one.json')).toBe(false);
    expect(await store.get('audit-checkpoints/synthetic/one.json')).toBeNull();
    expect(await store.head('audit-checkpoints/synthetic/one.json')).toBeNull();
  });

  it('is content-addressed: the same bytes under two keys are stored once', async () => {
    const a = await store.put('k/a', bytes('same'), { contentType: 'text/plain' });
    const b = await store.put('k/b', bytes('same'), { contentType: 'text/plain' });
    expect(a.contentSha256).toBe(b.contentSha256);
    const shard = path.join(store.root, 'objects', a.contentSha256.slice(0, 2));
    expect(await readdir(shard)).toEqual([a.contentSha256]);
    expect(await readdir(path.join(store.root, 'keys'))).toHaveLength(2);
    // A key overwritten with new bytes points at the new content; the old bytes are untouched.
    const c = await store.put('k/a', bytes('other'), { contentType: 'text/plain' });
    expect(c.contentSha256).not.toBe(a.contentSha256);
    expect(new TextDecoder().decode((await store.get('k/a'))?.bytes)).toBe('other');
    expect(new TextDecoder().decode((await store.get('k/b'))?.bytes)).toBe('same');
  });

  it('reports content altered in place instead of returning it', async () => {
    const put = await store.put('k/altered', bytes('original'), { contentType: 'text/plain' });
    const content = path.join(
      store.root,
      'objects',
      put.contentSha256.slice(0, 2),
      put.contentSha256,
    );
    expect(await readFile(content, 'utf8')).toBe('original');
    await writeFile(content, 'tampered');
    await expect(store.get('k/altered')).rejects.toMatchObject({
      name: 'ObjectStoreError',
      code: 'content_integrity',
    });
  });

  it('refuses keys and labels outside the documented alphabet, before touching the filesystem', async () => {
    for (const key of ['', '../escape', '/absolute', 'has space', 'a/../b', 'x'.repeat(513)]) {
      await expect(
        store.put(key, bytes('x'), { contentType: 'text/plain' }),
      ).rejects.toBeInstanceOf(ObjectStoreError);
    }
    await expect(
      store.put('k/label', bytes('x'), { contentType: 'text/plain', labels: { 'bad label': 'v' } }),
    ).rejects.toMatchObject({ code: 'invalid_label' });
    await expect(readdir(path.join(store.root, 'keys'))).rejects.toBeDefined();
  });

  it('exposes no public URL and keeps the root it was given', () => {
    expect(Object.keys(store)).toEqual([]);
    expect(path.isAbsolute(store.root)).toBe(true);
  });
});
