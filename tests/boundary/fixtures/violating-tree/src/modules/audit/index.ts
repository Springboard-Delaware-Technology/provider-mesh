// rule 1 and rule 4: a non-app file imports an adapter
import { devAdapter } from '../../platform/adapters/dev/index.js';
export const audit = devAdapter;
