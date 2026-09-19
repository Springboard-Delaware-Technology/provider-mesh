/* Foundation 001 §4.3 boundary rules. Runs in CI via `npm run boundary:check` and fails the build
 * on violation. Rule names are asserted by tests/boundary/boundary.test.ts (A03). */
const path = require('node:path');
const SQL_CLIENTS =
  '(^|/)node_modules/(pg|pg-pool|pg-connection-string|pg-native|pg-protocol|postgres)(/|$)';

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'F001-rule-1-modules-must-not-import-adapters',
      comment:
        'src/modules/* may import src/platform/ports and src/platform/events; never an adapter (§4.3 rule 1).',
      severity: 'error',
      from: { path: '^src/modules/' },
      to: { path: '^src/platform/adapters/' },
    },
    {
      name: 'F001-rule-2-modules-import-other-modules-via-index-only',
      comment:
        "A module imports another module only through that module's index.ts public surface (§4.3 rule 2).",
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/' },
      to: { path: '^src/modules/(?!$1/)[^/]+/', pathNot: '^src/modules/[^/]+/index\\.ts$' },
    },
    {
      name: 'F001-rule-2b-app-imports-modules-via-index-only',
      comment:
        'The composition root uses the same public surface as any other importer (§4.3 rule 2).',
      severity: 'error',
      from: { path: '^src/app/' },
      to: { path: '^src/modules/[^/]+/', pathNot: '^src/modules/[^/]+/index\\.ts$' },
    },
    {
      name: 'F001-rule-3-platform-must-not-import-modules',
      comment: 'src/platform/** may not import src/modules/** (§4.3 rule 3).',
      severity: 'error',
      from: { path: '^src/platform/' },
      to: { path: '^src/modules/' },
    },
    {
      name: 'F001-rule-4-only-app-imports-adapters',
      comment:
        'Only src/app/** may import src/platform/adapters/** (§4.3 rule 4). Adapters may import each other.',
      severity: 'error',
      from: { path: '^src/', pathNot: '^src/(app|platform/adapters)/' },
      to: { path: '^src/platform/adapters/' },
    },
    {
      name: 'F001-rule-5-sql-client-only-in-postgres-adapter-and-db',
      comment:
        'No file outside src/platform/adapters/postgres and db/** may import the SQL client (§4.3 rule 5).',
      severity: 'error',
      from: { pathNot: '^(src/platform/adapters/postgres/|db/)' },
      to: { path: SQL_CLIENTS },
    },
    {
      name: 'F001-rule-5-sql-client-only-in-postgres-adapter-and-db-unresolved',
      comment:
        'Same as rule 5 for a client that is not installed (the import is still a violation).',
      severity: 'error',
      from: { pathNot: '^(src/platform/adapters/postgres/|db/)' },
      to: {
        path: '^(pg|pg-pool|pg-connection-string|pg-native|pg-protocol|postgres)(/|$)',
        couldNotResolve: true,
      },
    },
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      comment: 'Every source file is reachable; an orphan is dead code or a wiring mistake.',
      severity: 'warn',
      from: { orphan: true, pathNot: ['\\.d\\.ts$', '(^|/)README\\.md$', '^src/app/main\\.ts$'] },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: ['^tests/boundary/fixtures/', '\\.md$'] },
    tsPreCompilationDeps: true,
    // Absolute so the same rules apply when the test runs the check inside the fixture tree.
    tsConfig: { fileName: path.join(__dirname, 'tsconfig.json') },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: { text: { highlightFocused: true } },
  },
};
