import { describe, expect, it } from 'vitest';

import { RecordingSearchIndex } from '../../../src/platform/adapters/dev/index.js';

describe('SearchIndex development adapter (§4.4, A28)', () => {
  it('records every call by compartment and returns no hits', async () => {
    const index = new RecordingSearchIndex();
    await index.index('org:A', {
      documentId: 'd1',
      fields: { title: 'Synthetic Organization 01' },
    });
    await index.remove('org:A', 'd1');
    const hits = await index.query('org:B', 'housing', 10);
    expect(hits).toEqual([]);
    expect(index.calls).toEqual([
      { operation: 'index', compartmentKey: 'org:A', documentId: 'd1' },
      { operation: 'remove', compartmentKey: 'org:A', documentId: 'd1' },
      { operation: 'query', compartmentKey: 'org:B', text: 'housing' },
    ]);
  });
});
