// rule 1: a module imports an adapter directly
import { devAdapter } from '../../platform/adapters/dev/index.js';
export const internal = devAdapter;
