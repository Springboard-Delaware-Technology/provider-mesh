/**
 * `SearchIndex` port (Foundation 001 §4.4): index and query by compartment. Search indexes are
 * governed projections (replit.md §6); every call is scoped to a compartment key.
 */
export interface IndexDocument {
  readonly documentId: string;
  readonly fields: Readonly<Record<string, string>>;
}

export interface SearchHit {
  readonly documentId: string;
  readonly score: number;
}

export interface SearchIndex {
  index(compartmentKey: string, document: IndexDocument): Promise<void>;
  remove(compartmentKey: string, documentId: string): Promise<void>;
  query(compartmentKey: string, text: string, limit: number): Promise<readonly SearchHit[]>;
}
