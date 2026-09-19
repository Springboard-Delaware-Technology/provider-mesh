// rule 2b: composition root reaches past a module's index.ts
import { internal } from '../modules/registry/internal.js';
import { events } from '../platform/events/index.js';
export const main = [internal, events];
