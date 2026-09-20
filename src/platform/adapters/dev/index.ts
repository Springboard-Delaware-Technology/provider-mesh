/**
 * Development adapters (Foundation 001 §4.4). Only `src/app` may import this directory
 * (boundary rule 4). Adapters for the remaining ports arrive with their capabilities: KeyService
 * and SecretStore (C2 follow-through), JobQueue (C7). The `AuditSink` implementation is the
 * Audit Service itself (`src/modules/audit`) over the Postgres audit database (C5, §5.5).
 */
export { FilesystemObjectStore, ObjectStoreError } from './filesystem-object-store.js';
export { RecordingSearchIndex, type RecordedSearchCall } from './recording-search-index.js';
export { RefusingOutboundHttp } from './refusing-outbound-http.js';
