import {
  DestinationNotAllowedError,
  type OutboundHttp,
  type OutboundRequest,
  type OutboundResponse,
} from '../../ports/index.js';

/**
 * Development `OutboundHttp` adapter (Foundation 001 §4.4): the allowlist is empty, so every
 * destination is refused before any socket is opened. No outbound call exists in this package.
 */
export class RefusingOutboundHttp implements OutboundHttp {
  readonly #attempts: string[] = [];

  /** Hosts refused so far, for tests. */
  get refusedHosts(): readonly string[] {
    return this.#attempts;
  }

  isDestinationAllowed(_url: string): boolean {
    return false;
  }

  request(request: OutboundRequest): Promise<OutboundResponse> {
    const host = hostOf(request.url);
    this.#attempts.push(host);
    return Promise.reject(new DestinationNotAllowedError(host));
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return '(unparseable)';
  }
}
