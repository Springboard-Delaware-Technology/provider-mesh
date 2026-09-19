# Migrations (Foundation 001 §5.4)

Plain SQL files `NNNN_<name>.sql`, forward-only, applied in filename order inside a transaction and recorded in the hash-verified `migration_ledger`. The first migration set arrives with C4. Applied migrations are immutable (§1.4 invariant 7).
