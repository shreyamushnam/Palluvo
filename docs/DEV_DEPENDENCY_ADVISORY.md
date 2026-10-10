# Development Toolchain Advisory: risk acceptance

**Advisory:** [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) (`braces` stack-exhaustion DoS on deeply nested brace patterns)

**Chain:** `eslint-config-next@16.4.0` → `@next/eslint-plugin-next` → `fast-glob@3.3.1` → `micromatch@4.0.8` → `braces@3.0.3`

## Status

- `npm run audit:prod` (`npm audit --omit=dev --audit-level=high`) is clean: the vulnerable package is **not** in the production dependency graph, the build output, or the runtime.
- `braces@3.0.3` is the latest published release and the advisory affects all versions (`*`), so **no patched version exists** to upgrade to. The only suggested remedy (`npm audit fix --force` → `eslint-config-next@14.2.35`) is a breaking downgrade across two major versions and conflicts with Next.js 16, so it is intentionally not applied.

## Risk acceptance

- **Exposure:** only the lint step (local developer machines and CI) runs the vulnerable code, via ESLint's file globbing of this repository's own, trusted source tree.
- **Attack requirement:** an attacker would need to feed a deeply nested brace pattern into the glob call; the patterns used are fixed in tooling config and are not user- or network-controlled.
- **Impact:** worst case is a stalled/crashed lint process (denial of service); no code execution, data exposure, or effect on shipped artifacts.

## Mitigations

- CI blocks on production advisories (`npm run audit:prod`) and does not install or run the dev toolchain on any deployed host.
- Lint runs only on trusted, committed source; no untrusted input reaches the glob patterns.

## Plan

Re-check on each dependency bump (`npm audit`, `npm view braces version`). Remove this acceptance as soon as `braces`, `micromatch`/`fast-glob`, or `@next/eslint-plugin-next` publishes a fix compatible with `eslint-config-next@16.x`.
