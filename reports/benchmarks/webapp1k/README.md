# WebApp1K fixed three-task sample

Upstream: https://github.com/onekq/WebApp1k at `00895306c81d5329904827b65f4a933ce3cb8746`.
The official base corpus has 1,000 tests. `selection.json` was written before generation and freezes the first three paths in ascending codepoint order. The three copied test files remain byte-identical. They are © 2024 onekq under MIT; see `upstream/LICENSE`.

The generator uses the exact upstream `generate_implementation` first-attempt prompt and `extract_code` function, loaded from the pinned source via Python AST. The official prompt supplies the complete test to the model. Inference is replaced with Codex CLI 0.153.4, explicit `gpt-6-astra`, medium reasoning, one completion per task and no tools or repairs. It is not a full official leaderboard run or a product Studio evaluation.

`summary.json` contains all outcomes and SHA-256 provenance. Preserve these distinct results:

1. `official-layout`: upstream `latest` dependencies; all three suites fail to load, zero assertions executed. React Router 7 is incompatible with the old Jest resolver, and fetch-mock 12 lacks APIs used by the tests.
2. `compatible-dependencies-original-layout`: intermediate dependency preparation; zero assertions executed because fetch-mock's node-fetch peer was absent. Retained as environment-failure evidence.
3. `pinned-original-layout`: compatible pinned dependencies; two suites and four assertions pass. The first suite is blocked because its test imports `./AddAltTextToImage`, while the upstream generator writes `addAltTextToImage.js` on a case-sensitive Linux filesystem.
4. `pinned-import-mapping`: provide an additional filename alias with byte-identical generated contents; all three suites and all six untouched assertions pass. No test or generated code is edited. This is a separately labelled compatibility diagnostic, not the strict-layout score.

The official `run_eval.py` currently defaults to `duo_tests`; this experiment explicitly selects the original 1,000-task `tests/` corpus. No tasks are substituted. No outcome is excluded because it failed.

## Reproduce without another model call

From the product repository root, choose a fresh temporary checkout:

```bash
export WEBAPP1K_REPO=/tmp/webapp1k-replay
# The directory should not already exist.
git clone https://github.com/onekq/WebApp1k.git "$WEBAPP1K_REPO"
git -C "$WEBAPP1K_REPO" checkout 00895306c81d5329904827b65f4a933ce3cb8746
cp reports/benchmarks/webapp1k/compatible-package.json "$WEBAPP1K_REPO/staging/package.json"
cp reports/benchmarks/webapp1k/compatible-package-lock.json "$WEBAPP1K_REPO/staging/package-lock.json"
npm ci --prefix "$WEBAPP1K_REPO/staging" --legacy-peer-deps --ignore-scripts --no-audit --no-fund
node scripts/benchmark-webapp1k.mjs
# The strict-layout command intentionally exits nonzero for the upstream casing mismatch.
node scripts/benchmark-webapp1k.mjs --case-alias
node scripts/summarize-webapp1k.mjs
```

The runner verifies the commit, all selected tests, upstream source hashes and exactly three staged test files. The only permitted package-manifest deviation is the saved compatibility manifest. Case aliases are enabled only by `--case-alias`, and removed for strict-layout reruns. All generation artifacts are replayed unchanged.

A new inference experiment consumes quota and must use a new output directory:

```bash
WEBAPP1K_OUTPUT=/tmp/webapp1k-new-generation node scripts/benchmark-webapp1k.mjs --generate
WEBAPP1K_OUTPUT=/tmp/webapp1k-new-generation node scripts/benchmark-webapp1k.mjs
WEBAPP1K_OUTPUT=/tmp/webapp1k-new-generation node scripts/benchmark-webapp1k.mjs --case-alias
```

This is a tiny, publicly test-visible sample of blogging components. It does not establish a full WebApp1K score, general coding accuracy, child usability, educational efficacy, product success rate, or superiority over another model.
