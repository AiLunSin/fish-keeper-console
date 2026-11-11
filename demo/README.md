# Demo data

Everything under this directory is **synthetic**. It contains no real fish, user, channel, or credential data.

- `fish-a/`, `fish-b/` use the generic file adapter (`fish.json` / `state.json`, JSONL diaries, `river/events.jsonl`).
- `fishtank/` mirrors the `fish.json` shape of `dsh-fishtank@0.1.0` for the `preset: fishtank` contract tests.
- `fish-a/credentials/demo.json` is a fake credential file used only to demonstrate existence and permission checks. Its token is not a usable secret.

The demo is wired in `cordis.patch.yml` by relative paths. Remove those sources or replace `location` with a real data directory before using the console for real fish.

Do not add real diaries, credentials, screenshots of private data, or exported `.fishkeeper` packages here.
