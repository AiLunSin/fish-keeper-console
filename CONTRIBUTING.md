# Contributing

Thanks for helping fish keepers. This project is a community plugin; it is not affiliated with or endorsed by DeepSeek.

## Before changing behavior

- Read the [requirements](./docs/requirements.zh-CN.md) boundaries and the [technical design](./docs/technical-design.zh-CN.md).
- Open an issue for any change that adds a write operation, a new data source, or a new network destination.
- Keep the non-goals in place: no persona engine, no community features, no automatic intervention, no model calls.

## Adapters first

Prefer a data-source adapter or a declarative preset over `if (pluginName === 'dsh-fish')` branches in core code. A new adapter should include:

- a synthetic fixture under `demo/` or `tests/fixtures/`;
- a read-only contract check (source-tree hashes unchanged after every read);
- a smoke test in `scripts/` when the adapter has write capabilities;
- updates to `docs/compat-notes.md` when the target plugin changes format.

## Write operations

Every PR that writes to a fish data directory must state:

1. what is written;
2. why it must be written;
3. how automatic writes are prevented;
4. how a failure is rolled back;
5. which confirmation token or explicit user action guards it.

## Checks

```bash
npm test
# Optional syntax check (PowerShell)
Get-ChildItem lib/*.js | ForEach-Object { node --check $_.FullName }
```

`npm test` uses temporary directories and synthetic data. Do not commit real diary text, real credentials, `.fishkeeper` packages, or `.data/`.

## Style and language

- Host code is ESM JavaScript under `lib/`; keep it dependency-free unless a dependency removes more code than it adds.
- Client source is `src/client.jsx`; rebuild `lib/client.js` after changing it.
- User-visible strings live in `locale/en.json` and `locale/zh.json`.
- Comments state contracts, not implementation history. English comments are fine; user-facing copy is localized.

## Security

Report vulnerabilities privately; see [SECURITY.md](./SECURITY.md). Do not paste real fish data into an issue.
