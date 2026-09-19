# Postgres adapter (Foundation 001 §4.2, §4.4, §5.3)

The `RelationalStore` development adapter over node-postgres, and the only directory outside
`db/**` that may import the SQL client (boundary rule 5).

- `connection-config.ts`: parses one Springboard-named URL into an explicit client
  configuration. `sslmode=verify-full` is mandatory, the trust store is the system's
  (`sslrootcert` absent or `system`), and no other option is accepted (§5.3 rule 2, A07).
  Errors name the variable and the rule, never a value.
- `postgres-relational-store.ts`: pool with every parameter supplied explicitly, so the client
  never falls back to a platform-injected `PG*` variable (A08); `BEGIN READ ONLY` for
  read-only work (§5.3 rule 5).
- `session-context.ts`: the six transaction-local `mesh.*` settings bound from a validated
  `ActorContext` as the first statement of every transaction (§5.6 rule 2). Lists are
  comma-separated over a comma-free identifier alphabet.

"System trust store" here means the Node.js runtime's trust store: its bundled Mozilla CA
bundle plus any certificate the operator adds through `NODE_EXTRA_CA_CERTS`. Neither path
disables verification; CI uses the second to trust its per-run container CA.
