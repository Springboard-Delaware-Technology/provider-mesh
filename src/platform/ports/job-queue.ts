import type { CompartmentRefs } from './compartment.js';

/**
 * `JobQueue` port (Foundation 001 §4.4, §5.7): enqueue with compartment context and idempotency
 * key; claim; complete; fail-with-unknown. A job without compartment context is rejected.
 */
export interface JobRequest {
  readonly jobType: string;
  readonly compartment: CompartmentRefs;
  readonly idempotencyKey: string;
  readonly correlationId: string;
  readonly payloadVersion: number;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface ClaimedJob extends JobRequest {
  readonly jobId: string;
  readonly attempt: number;
  readonly claimedAt: string;
}

export interface JobQueue {
  enqueue(job: JobRequest): Promise<{ readonly jobId: string }>;
  claim(workerId: string, limit: number): Promise<readonly ClaimedJob[]>;
  complete(jobId: string): Promise<void>;
  /** Terminal outcome when the result cannot be determined (Domain Model §4.4: unknown is a state). */
  failUnknown(jobId: string, reasonCode: string): Promise<void>;
}
