/**
 * `OutboundHttp` port (Foundation 001 §4.4): request with destination allowlist and certificate
 * verification. Under Foundation 001 the allowlist is empty and every destination is refused
 * (§1.5 excludes outbound calls).
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';

export interface OutboundRequest {
  readonly method: HttpMethod;
  readonly url: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: Uint8Array;
  readonly timeoutMs: number;
}

export interface OutboundResponse {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: Uint8Array;
}

export class DestinationNotAllowedError extends Error {
  readonly host: string;
  constructor(host: string) {
    super(`outbound destination not allowed: ${host}`);
    this.name = 'DestinationNotAllowedError';
    this.host = host;
  }
}

export interface OutboundHttp {
  /** True only when the URL's host is on the configured allowlist. */
  isDestinationAllowed(url: string): boolean;
  /** Rejects with `DestinationNotAllowedError` before any connection is attempted. */
  request(request: OutboundRequest): Promise<OutboundResponse>;
}
