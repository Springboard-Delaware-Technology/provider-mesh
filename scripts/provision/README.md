# Environment provisioning (Foundation 001 §6.5)

This folder holds the provisioning procedure for one Provider Mesh environment, in two interchangeable forms: a console procedure (SQL files for Neon's SQL Editor) and a script. `provision.sh` creates one Provider Mesh environment from nothing and verifies it. It is the single source for recreating an environment (ADR-001 §4.3 rule 2). It is run **only by the decision authority**, from a machine outside any AI-agent context, with a Neon API key that no agent ever holds (ADR-001 §8.1, §8.3). Agents run it only in `--target container` mode against a local or CI Postgres.

What it does, in order:

1. Creates a Neon project in a U.S. region on the requested Postgres major, with the `provider_mesh` database (or verifies an existing project of the same name).
2. Creates the `provider_mesh_audit` database in the same project.
3. Runs `sql/01_roles.sql` — the four application roles, created in SQL so they are **not** members of `neon_superuser`, and verified to carry no superuser, bypass-RLS, create-database, or create-role attribute.
4. Runs `sql/02_domain_db.sql` and `sql/03_audit_db.sql` — connect grants (deny-by-default; `mesh_app` cannot even connect to the audit database), ownership to `mesh_migrate`, default privileges, and the instance-identity marker in each database.
5. Verifies role attributes, the audit-connect denial, and the markers, then prints the secret names and values **once**.

Nothing is written to disk. Passwords are generated locally and shown a single time; the API key is read from a hidden prompt.

## Two procedures

| | Procedure A — console | Procedure B — script |
|---|---|---|
| What you need | A browser | WSL with `curl`, `jq`, `psql` 16+ |
| Project and audit database | Created by you in the Neon console | Created by the script through the Neon API |
| Roles, grants, marker | `console/A_domain_db.sql` and `console/B_audit_db.sql` pasted into Neon's SQL Editor; `console/C_rotate_passwords.sql` from `mesh_admin` for later rotation | `sql/01–03` run by the script over `psql` |
| Secrets | Returned as the SQL Editor's result rows | Printed by the script |
| Reproducible from the repository | Yes — the SQL is versioned and the console steps are listed below | Yes — fully scripted |
| Used for | Development now; production later if preferred | CI dry run on every push; any environment |

Both produce the same result and both satisfy Foundation 001 §6.5. Record which one was used in `ENVIRONMENTS.md`.

## Procedure A — Neon console

1. In the Neon console, in the Springboard organization, click **New project**. Name `provider-mesh-development`, region **AWS US East (N. Virginia)** (`aws-us-east-1`), Postgres **18**, database name **`provider_mesh`**. Create it.
2. In the project, open **Databases** and add a second database named **`provider_mesh_audit`**, owned by the same role the project created.
3. Open **SQL Editor**. In the database selector choose **`provider_mesh`**. Paste the whole of `console/A_domain_db.sql`. The `environment` parameter at the top is already `development`; leave `instance_id` as `NULL::uuid`. Run it.
   The result has two parts: a verification table where every role must show `OK`, and a secrets table of seven rows.
4. Copy **`PROVIDER_MESH_INSTANCE_ID`** from the result.
5. Switch the database selector to **`provider_mesh_audit`**. Paste `console/B_audit_db.sql`, replace `NULL::uuid` on the `instance_id` line with `'<the id you copied>'::uuid`, and run it. The result must show `OK (denied)` and the same marker.
6. Get the endpoint host from the project's **Connect** panel: it is the part of the connection string after `@` and before `/` (it looks like `ep-….us-east-1.aws.neon.tech`). Use the pooled host if the panel offers one.
7. Enter the seven secrets into Replit Secrets for the provider-mesh workspace, by name, replacing `<ENDPOINT_HOST>` in the five URLs with the host from step 6. Then clear the SQL Editor.
8. Send the environment details — project ID, region, Postgres version, endpoint host, instance ID, date — for `ENVIRONMENTS.md`. Never send the secret values.

9. **Create the admin database** (needed for any later password rotation). In **Databases**, add a third database named **`mesh_admin`**, owned by the console owner role. It stays empty. Its only purpose is to give the SQL Editor a database whose owner can manage roles.

**Why step 9 exists.** The Neon SQL Editor always connects as the owner of the selected database, and there is no role selector. Step A makes `mesh_migrate` the owner of `provider_mesh` (and step B of `provider_mesh_audit`), and `mesh_migrate` by design cannot alter roles — so after step A, re-running step A or B from those databases fails with "permission denied to alter role." Roles are cluster-wide, so an empty database owned by the console role restores the ability to manage them.

**Rotating passwords later (step C).** Select **`mesh_admin`** in the SQL Editor, paste `console/C_rotate_passwords.sql` with the recorded `environment` and `instance_id` set at the top, and run it. It rotates all four passwords, denies the application roles access to `mesh_admin`, and returns the seven secrets. Update Replit Secrets from the result. Do not re-run step A or B to rotate passwords.

## Procedure B — script (WSL)

### One-time setup on Windows

The script needs a Unix shell with `curl`, `jq`, and `psql` (PostgreSQL 16 or newer, for `sslrootcert=system`). The reliable way on Windows is WSL:

1. Open **PowerShell as Administrator** and run `wsl --install -d Ubuntu`. Reboot when asked, then open **Ubuntu** from the Start menu and create a Linux username and password when prompted.
2. In the Ubuntu window:
   ```
   sudo apt update && sudo apt install -y curl jq postgresql-client
   psql --version
   ```
   The version must be 16 or higher. If Ubuntu's package is older, install the PostgreSQL apt repository first (instructions at postgresql.org/download/linux/ubuntu) and re-run the install.
3. Copy the `provision` folder somewhere WSL can reach it, for example your Windows Downloads folder, which WSL sees at `/mnt/c/Users/<you>/Downloads/provision`.

### Create the Neon API key

In the Neon console: your **organization** settings → **API keys** → create an **organization API key** named `provider-mesh-provisioning`. Copy it; it is shown once. You will paste it into the script's hidden prompt and can revoke it in the console immediately after the run.

### Run

In the Ubuntu window:

```
cd /mnt/c/Users/<you>/Downloads/provision
chmod +x provision.sh
./provision.sh --target neon --environment development
```

Defaults: project name `provider-mesh-development`, region `aws-us-east-1`, Postgres 18. If your Neon account belongs to more than one organization, the script lists them and stops; re-run with `--org-id <id>` for the Springboard organization.

When it finishes it prints two blocks. The first is the **environment record** — copy it into `docs/infrastructure/ENVIRONMENTS.md`. The second is the **secrets block** — enter each line by name into Replit Secrets for the provider-mesh workspace, then close the window. Do not paste the secrets block anywhere else, including into any chat.

After the run: revoke the API key in the Neon console, and clear the shell history with `history -c`.

### Re-running

The script is idempotent. Re-running against the same environment verifies the project, roles, and markers. To make a re-run verify an existing marker, pass `--instance-id <the id from ENVIRONMENTS.md>`; without it a new ID is generated and the marker check **aborts** deliberately, because a database whose marker differs belongs to another instance.

A re-run rotates the four role passwords (they are set unconditionally). Update Replit Secrets from the new secrets block whenever you re-run.

## CI / container mode

```
./provision.sh --target container --environment ci \
  --admin-url postgresql://postgres:postgres@localhost:5432/postgres
```

Runs steps 3–5 (and creates the two databases) against a local Postgres. This is the dry run the CI workflow executes on every push (spec §10 step 3, A27). No Neon API call is made and `curl`/`jq` are only checked for presence.

## What this script does not do

- It does not enable HIPAA on the project. That is a Stage 2 step, done by the decision authority in the Neon console (organization-level enablement plus per-project enable; irreversible; forces a compute restart).
- It does not create the migration ledger, `audit_event`, or any application table; those come from `db:migrate`.
- It does not create a production environment. That is deferred (spec §17 decision 1) and, when it happens, uses this same script with `--environment production`, run the same way.
- It never creates a Replit database. `DATABASE_URL` must not exist in the workspace (ADR-001 §6.3 rule 8).
