# Migration mechanism (Foundation 001 §5.4)

`db:migrate`, `db:status`, `db:rehearse`, and `db:verify` arrive with C4. Only `db:migrate` writes the ledger; the running application never holds the `mesh_migrate` credential (§5.2).
