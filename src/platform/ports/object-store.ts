/**
 * `ObjectStore` port (Foundation 001 §4.4): put, get, head, delete by opaque key with metadata.
 * No public URLs exist on this interface, by design.
 */
export interface ObjectMetadata {
  readonly contentType: string;
  readonly sizeBytes: number;
  /** Hex SHA-256 of the content; the development adapter is content-addressed by it. */
  readonly contentSha256: string;
  readonly storedAt: string;
  readonly labels: Readonly<Record<string, string>>;
}

export interface StoredObject {
  readonly bytes: Uint8Array;
  readonly metadata: ObjectMetadata;
}

export interface ObjectStore {
  put(
    key: string,
    bytes: Uint8Array,
    options: { readonly contentType: string; readonly labels?: Readonly<Record<string, string>> },
  ): Promise<ObjectMetadata>;
  get(key: string): Promise<StoredObject | null>;
  head(key: string): Promise<ObjectMetadata | null>;
  delete(key: string): Promise<boolean>;
}
