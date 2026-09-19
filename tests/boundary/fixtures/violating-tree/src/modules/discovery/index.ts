// rule 2: deep import of another module's internals
import { internal } from '../registry/internal.js';
export const discovery = internal;
