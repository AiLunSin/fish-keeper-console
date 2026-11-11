# Security policy

Fish Keeper Console reads sensitive local data: fish diaries, memory, persona text, and channel configuration. Treat checkpoints and `.fishkeeper` packages as private data.

## Reporting a vulnerability

Do **not** open a public issue containing real diary text, credential values, `.fishkeeper` packages, or absolute personal paths. Report privately to the maintainers through the repository's private security advisory channel (GitHub Security Advisories), or by the contact method listed on the repository profile.

Include:

- the affected version and commit;
- the affected route or file;
- reproduction steps using synthetic data only;
- the impact, especially whether it can write outside the console data root or expose data to another principal.

## Scope

In scope:

- path traversal or symlink escape in checkpoint restore, migration import, or source reads;
- authentication or authorization bypass on `/api/fishkeeper/*`;
- a write outside the selected source or console data root;
- package extraction issues (zip slip, zip bomb, unsafe entry names);
- secrets or diary bodies written to logs or included in share-mode exports.

Out of scope:

- DSH itself, the target fish plugin, or the browser/OS;
- a user explicitly enabling non-loopback HTTP sources;
- data loss caused by running the target fish plugin while its data file is written externally (documented in `docs/compat-notes.md`).

## Safe defaults

- HTTP sources are loopback-only unless `allowRemote` is explicitly enabled. Literal cloud-metadata and link-local hosts are rejected, but the adapter does not pin DNS resolution; use loopback or a trusted host name.
- Credentials are referenced through `ctx.credentials`; they are not stored in source options.
- Full exports and checkpoints contain diary text. Use share mode for anything shared.
- Write-back requires a preflight token, an explicit overwrite confirmation, a pre-import checkpoint (when available), and a backup of existing files.
