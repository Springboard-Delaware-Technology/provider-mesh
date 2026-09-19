/**
 * `SecretStore` port (Foundation 001 §4.4): read named secrets at startup only.
 * Values are never logged, echoed, or written (§1.4 invariant 8).
 */
export interface SecretStore {
  /** Returns the value or throws an error that names the secret and nothing else. */
  readRequired(name: string): string;
  readOptional(name: string): string | undefined;
}
