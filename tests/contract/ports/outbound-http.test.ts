import { describe, expect, it } from 'vitest';

import { RefusingOutboundHttp } from '../../../src/platform/adapters/dev/index.js';
import { DestinationNotAllowedError } from '../../../src/platform/ports/index.js';

describe('OutboundHttp development adapter (§4.4, §1.5, A28)', () => {
  it('allows no destination', () => {
    const http = new RefusingOutboundHttp();
    expect(http.isDestinationAllowed('https://example.invalid/')).toBe(false);
    expect(http.isDestinationAllowed('http://127.0.0.1/')).toBe(false);
  });

  it('refuses before any connection is attempted', async () => {
    const http = new RefusingOutboundHttp();
    await expect(
      http.request({ method: 'GET', url: 'https://example.invalid/resource', timeoutMs: 10 }),
    ).rejects.toBeInstanceOf(DestinationNotAllowedError);
    expect(http.refusedHosts).toEqual(['example.invalid']);
  });
});
