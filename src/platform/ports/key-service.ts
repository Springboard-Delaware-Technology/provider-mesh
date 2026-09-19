/**
 * `KeyService` port (Foundation 001 §4.4): wrap and unwrap data keys under a wrapping key the
 * service holds. Wrapping-key material is never exported through this interface.
 */
export interface WrappedDataKey {
  /** Identifier of the wrapping key used; never the key itself. */
  readonly keyId: string;
  readonly ciphertext: Uint8Array;
}

export interface KeyService {
  currentKeyId(): Promise<string>;
  wrapDataKey(plaintextDataKey: Uint8Array): Promise<WrappedDataKey>;
  unwrapDataKey(wrapped: WrappedDataKey): Promise<Uint8Array>;
  /** Rotation hook: introduces a new wrapping key and returns its identifier. */
  rotate(): Promise<{ readonly keyId: string }>;
}
