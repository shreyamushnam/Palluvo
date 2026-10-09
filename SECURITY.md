# Security Policy & Dependency Audit Log

## Production Environment Security
Production dependencies are strictly audited and verified against high- and critical-severity vulnerabilities:
```bash
npm run audit:prod
```
As of the current tree (`next@16.4.0`, `react@19.2.8`, `react-dom@19.2.8`, `lucide-react@^1.47.0`), the production dependency audit reports **0 vulnerabilities**.

---

## Residual Development Toolchain Risk Assessment

### Finding Summary
- **Advisory**: [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) — `braces` vulnerable to stack-exhaustion denial of service through deeply nested patterns.
- **Affected Package**: `braces@3.0.3` (versions `<=3.0.3`).
- **Classification**: Development Toolchain Only (Severity: High).
- **Dependency Chain**:
  ```
  palluvo (root)
  └── eslint-config-next@16.4.0 (devDependencies)
      └── @next/eslint-plugin-next@16.4.0
          └── fast-glob@3.3.1
              └── micromatch@4.0.8
                  └── braces@3.0.3
  ```

### Risk Evaluation & Threat Model
1. **Production Isolation**: `eslint-config-next` and its transitive dependencies are purely devDependencies used during build-time linting (`npm run lint`). No part of this dependency tree is bundled into client or server production builds.
2. **Execution Context**: The vulnerable code path (`braces` inside `micromatch`/`fast-glob`) is only reached via `@next/eslint-plugin-next/dist/utils/get-root-dirs.js` during ESLint execution to resolve project directory roots.
3. **Absence of Untrusted Input**: In this repository, `getRootDirs()` processes trusted static file system paths configured in local project files, never untrusted user input or external network payloads.
4. **Rejection of Forced Fix**: `npm audit fix --force` proposes rolling back `eslint-config-next` to `14.2.35`. This is a breaking major-version downgrade incompatible with Next.js 16 and ESLint 9 flat configurations.

### Explicit Acceptance of Residual Risk
The project explicitly accepts this residual development-only risk until an upstream patched release of `braces` / `micromatch` / `fast-glob` is made available and incorporated into `@next/eslint-plugin-next` and `eslint-config-next`.

### Monitoring & Re-Evaluation Plan
1. **Weekly Upstream Monitoring**: Review updates to [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) and release notes for `braces`, `micromatch`, and `eslint-config-next`.
2. **Automated CI Audits**: Run `npm run audit:prod` on every pull request to ensure no vulnerabilities leak into production dependencies.
3. **Prompt Resolution**: Immediately upgrade `eslint-config-next` once Next.js releases a patch resolving the dependency chain.
