# Postgres adapter (Foundation 001 §4.2, §4.4, §5.3)

SQL client, connection discipline, and compartment session context arrive with capability C3.
This is the only directory outside `db/**` that may import the SQL client (boundary rule 5).
Every connection uses `sslmode=verify-full` with the system trust store; the configuration
builder rejects any option that disables verification (§5.3 rule 2, A07).
