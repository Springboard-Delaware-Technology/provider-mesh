import type { IndexDocument, SearchHit, SearchIndex } from '../../ports/index.js';

export interface RecordedSearchCall {
  readonly operation: 'index' | 'remove' | 'query';
  readonly compartmentKey: string;
  readonly documentId?: string;
  readonly text?: string;
}

/**
 * Development `SearchIndex` adapter (Foundation 001 §4.4): a no-op that records calls for tests.
 * It indexes nothing and returns no hits; no search technology is selected by this package.
 */
export class RecordingSearchIndex implements SearchIndex {
  readonly #calls: RecordedSearchCall[] = [];

  get calls(): readonly RecordedSearchCall[] {
    return this.#calls;
  }

  index(compartmentKey: string, document: IndexDocument): Promise<void> {
    this.#calls.push({ operation: 'index', compartmentKey, documentId: document.documentId });
    return Promise.resolve();
  }

  remove(compartmentKey: string, documentId: string): Promise<void> {
    this.#calls.push({ operation: 'remove', compartmentKey, documentId });
    return Promise.resolve();
  }

  query(compartmentKey: string, text: string, _limit: number): Promise<readonly SearchHit[]> {
    this.#calls.push({ operation: 'query', compartmentKey, text });
    return Promise.resolve([]);
  }
}
