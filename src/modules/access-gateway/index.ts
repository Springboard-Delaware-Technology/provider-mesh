/**
 * Interaction and Access Gateway — public surface (Architecture §6.1).
 * Under Foundation 001 this module exposes health and readiness only (§5.10).
 */
export { createHttpServer, type HttpServer, type RegisteredRoute } from './http-server.js';
export type { NotReadyReason, ReadinessProbe, ReadinessResult } from './readiness.js';
