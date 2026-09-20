/**
 * Infrastructure ports (Foundation 001 §4.4). Interfaces only: no vendor type crosses this
 * surface, and modules may import this directory but never an adapter (boundary rules 1 and 4).
 */
export type { ActorContext } from './actor-context.js';
export type { CompartmentRefs } from './compartment.js';
export type {
  QueryResult,
  RelationalStore,
  SqlStatement,
  TransactionOptions,
  TransactionScope,
} from './relational-store.js';
export type { ObjectMetadata, ObjectStore, StoredObject } from './object-store.js';
export type { KeyService, WrappedDataKey } from './key-service.js';
export type { SecretStore } from './secret-store.js';
export type { ClaimedJob, JobQueue, JobRequest } from './job-queue.js';
export type { IndexDocument, SearchHit, SearchIndex } from './search-index.js';
export type {
  Absent,
  AbsenceReason,
  AuditActorKind,
  AuditCheckpoint,
  AuditEventInput,
  AuditResult,
  AuditSink,
  ChainHead,
  Maybe,
} from './audit-sink.js';
export type {
  HttpMethod,
  OutboundHttp,
  OutboundRequest,
  OutboundResponse,
} from './outbound-http.js';
export { DestinationNotAllowedError } from './outbound-http.js';
