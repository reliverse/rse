# Rse

> 🌠 @reliverse/rse is a brand-new modern alternative to npm and jsr registries, as well as to package managers like npm, bun, deno, yarn, and pnpm. It's a robust, secure, fast, all-in-one package ecosystem—offering everything from private registries with granular tokens to bundling, testing, hot reloading, Bun, Node.js-compatible environment. W.I.P.

## TODO

### 1. **Core CLI (rse)**

- [ ] **Initialize CLI Project**  
  - [ ] Set up the `rse` CLI repository (via [Rempts](https://github.com/reliverse/rempts)).  
  - [ ] Configure the build system (via [Relidler](https://github.com/reliverse/relidler)).

- [ ] **Command Structure & Parsing**  
  - [ ] Implement subcommands (`rse install`, `rse run`, `rse publish`, `rse test`, `rse build`, etc.).  
  - [ ] Use a library or custom approach for CLI argument parsing.

- [ ] **Configurable Global Directory**  
  - [ ] Default to `~/.reliverse/rse/libs` or `C:\Users\...\.reliverse\rse\libs`.  
  - [ ] Allow config/environment overrides.  
  - [ ] Initialize directory if missing.

### 2. **Dependency Resolution & Installation**

- [ ] **Single-file Import Parsing**  
  - [ ] Detect `import ... from "rse://package@version"` or custom schemes.  
  - [ ] Collect needed packages + versions.

- [ ] **Project-based `package.json`** (NPM-like)  
  - [ ] Read dependencies from `package.json`.  
  - [ ] **Optional**: Install to local `node_modules` for a "drop-in” replacement.  
  - [ ] If no `package.json`, fallback to single-file or `jsr.json`/`deno.json`.

- [ ] **Install Logic**  
  - [ ] Retrieve metadata and tarballs from the registry (private or public).  
  - [ ] Extract to either:
    - **Global** shared folder, or  
    - **Local** `node_modules` (if requested).
  - [ ] Cache packages to speed up future installations (similar to Bun's global cache).

- [ ] **Rewrite/Alias Imports**  
  - [ ] For single-file approach, rewrite imports to absolute paths in the global dir.  
  - [ ] For local node_modules usage, rely on standard Node resolution.  
  - [ ] Consider "sloppy imports” if `package.json` is present (.js extension that points to .ts, etc.).

- [ ] **Locking & Consistency**  
  - [ ] Provide a lockfile or consistent resolution approach for reliability across environments.

### 3. **Running Scripts & Project Files**

- [ ] **`rse run`**  
  - [ ] Install dependencies if needed.  
  - [ ] Execute user's main file (TypeScript or JavaScript).  
  - [ ] Provide watch mode (`--watch` or `--hot`) for automatic restarts (similar to Bun's hot reloading).

- [ ] **Support `package.json` Scripts**  
  - [ ] If `package.json` has a `scripts` section, allow `rse run <scriptName>` to mimic npm/yarn.

### 4. **Registry (Backend)**

- [ ] **Architecture & Hosting**  
  - [ ] Decide on local or cloud-based (S3/GCS) storage.  
  - [ ] Possibly deploy to Cloud Run or use Docker for local dev.

- [ ] **Core REST Endpoints**  
  - [ ] `POST /publish`: publish tarball & metadata.  
  - [ ] `GET /package/:name`: fetch package info.  
  - [ ] `GET /package/:name/:version`: fetch version metadata.  
  - [ ] `GET /package/:name/:version/download`: download tarball.  
  - [ ] Support private packages via authenticated tokens (see "Security & Granular Tokens”).

- [ ] **DB & Package Storage**  
  - [ ] Store metadata, user, scope, token data in Postgres (or similar).  
  - [ ] Store modules in local directory or object storage (S3/GCS).  
  - [ ] Provide versioning and validation.

- [ ] **Private Packages**  
  - [ ] Ensure only authorized tokens/users can publish or install certain packages.  
  - [ ] Provide local usage for testing or staging.

- [ ] **Security, Reliability, & Policies**  
  - [ ] Token-based auth & role-based permissions.  
  - [ ] Optional "vetted” external packages to reduce risk.

### 5. **Website (Frontend)**

- [ ] **Framework & Basic Pages**  
  - [ ] Minimal site to browse and search packages.  
  - [ ] Package detail pages with docs, readme, versions.  
  - [ ] Admin pages for tokens, users, and private packages.

- [ ] **Local Dev Setup**  
  - [ ] Document `/etc/hosts` edits (`127.0.0.1 rse.test`), etc.  
  - [ ] Scripts to run registry + frontend in dev mode.

- [ ] **Search & Staging**  
  - [ ] Search engine for package discovery.  
  - [ ] Staging area for pre-release or private testing.

- [ ] **Docs Portal** (Optional or Future)  
  - [ ] Generate TypeScript documentation for each version.  
  - [ ] Provide a user-friendly doc viewer (similar to jsr.io or Deno Land).

### 6. **Scopes & Package Metadata** (jsr-like)

- [ ] **Scopes**  
  - [ ] Support `@scope/package` naming rules.  
  - [ ] Provide CLI or UI to create scopes (e.g., `@myorg`).

- [ ] **Manifests**  
  - [ ] Support `package.json`, `jsr.json`, `deno.json`.  
  - [ ] Check for ESM-only, TypeScript "slow types”, etc.  
  - [ ] Optionally allow overrides for advanced usage.

- [ ] **Validation & Compliance**  
  - [ ] Windows- and Unix-safe file naming.  
  - [ ] Node built-in usage checks, if relevant.  
  - [ ] `rse publish --dry-run` to preview warnings.

### 7. **Publishing Workflow**

- [ ] **`rse publish`**  
  - [ ] TAR/zip the directory, send to registry.  
  - [ ] Validate name, scope, version collisions.  
  - [ ] Mark private or public.  
  - [ ] Support rating or scanning for compliance (optional).

- [ ] **Local & CI Publishing**  
  - [ ] OAuth/token-based login flow.  
  - [ ] GitHub Actions OIDC flow for automated publishing.  
  - [ ] Permission check for `@scope`.

- [ ] **Include/Exclude Files**  
  - [ ] Respect `.gitignore`.  
  - [ ] Support `publish.include`, `publish.exclude` in `jsr.json` or `deno.json`.  
  - [ ] Un-ignore with `!filename` patterns.

- [ ] **Rate-Limiting & Dist-Tags**  
  - [ ] Tag versions like `latest`, `beta`.  
  - [ ] Throttle suspicious or excessive requests.

### 8. **Private & Secure Features (From vlt/VSR)**

- [ ] **Granular Access Tokens**  
  - [ ] **Customer Tokens (Read-Only)**: Only download/pull authorized packages.  
  - [ ] **Team Tokens (Read & Write)**: Publish, update, delete packages within a scope.  
  - [ ] Rotate/revoke tokens via admin UI or CLI.

- [ ] **Token Management API**  
  - [ ] Create, update, remove tokens.  
  - [ ] Associate tokens with users/teams.  
  - [ ] Fine-grained scoping (e.g., `@myorg/private-*`).

- [ ] **Audit & Compliance**  
  - [ ] Log who published or changed packages and when.  
  - [ ] Provide optional advanced scanning or gating on external libs.

- [ ] **Local Testing & Staging**  
  - [ ] Mirror private packages to local or ephemeral environments.  
  - [ ] Isolate dev/test from production.

### 9. **API (Management & Control)**

- [ ] **Package & User Management**  
  - [ ] CRUD for packages, versions, users, tokens.  
  - [ ] Private/public toggles, scope definitions.

- [ ] **Version & Dist-Tag Management**  
  - [ ] Provide unscoped packages (optional).  
  - [ ] Support custom dist-tags (`alpha`, `rc`, etc.).

- [ ] **Rate-Limiting & Search**  
  - [ ] Throttle excessive requests.  
  - [ ] Provide search endpoint for package discovery.

- [ ] **Staging Area**  
  - [ ] Upload new versions to staging.  
  - [ ] Let authorized testers confirm before full release.

### 10. **Local Dev Environment**

- [ ] **Local DNS**  
  - [ ] Document host entries: `127.0.0.1 rse.test`, etc.  
  - [ ] Provide dev scripts for registry + frontend + DB.

- [ ] **Database Migrations**  
  - [ ] Tools like `sqlx`, Prisma, or Flyway.  
  - [ ] Clear instructions on user roles, migrations.

- [ ] **Populate Sample Data**  
  - [ ] Publish sample "hello-world” or `@std/encoding` packages for testing.  
  - [ ] Provide an example admin user or staff account.

- [ ] **Admin/Staff**  
  - [ ] CLI or UI flow to set a user as admin.  
  - [ ] Admin panel for secure private packages, token revocations, etc.

### 11. **Testing & Quality**

- [ ] **Unit Tests**  
  - [ ] Test CLI commands (install, run, publish, build, test, etc.).  
  - [ ] Test registry endpoints (publish, fetch, private ACL, tokens).

- [ ] **Integration & E2E**  
  - [ ] End-to-end: publish → install → run → test (including private packages).  
  - [ ] Validate single-file approach, local `node_modules`, monorepos, etc.

- [ ] **Cross-Platform CI**  
  - [ ] Windows, macOS, Linux coverage.  
  - [ ] Ensure path handling & environment variables are consistent.

- [ ] **Security & Load**  
  - [ ] Evaluate concurrency, rate-limiting, token abuse scenarios.  
  - [ ] Test large packages or many small requests.

### 12. **Performance & Optimization**

- [ ] **Caching & Checksums**  
  - [ ] Keep package integrity checks & global cache for quick re-installs.  
  - [ ] Possibly integrate a CDN or local caching proxy.

- [ ] **Parallel Installation**  
  - [ ] Install multiple packages simultaneously.  
  - [ ] Prevent partial extraction race conditions.

- [ ] **Policy & Approval Flow** (Optional Future)  
  - [ ] Let organizations "approve” external dependencies before they're used.  
  - [ ] Mark them "safe” in the registry for dev consumption.

### 13. **Bun-like Developer Tools & Features**

> **These tasks aim to match or emulate Bun's all-in-one toolkit**:  
> **Bundling** (like `bun build`),  
> **Test runner** (like `bun test`),  
> **Dev server**,  
> **Hot reloading**,  
> **Monorepo** support,  
> **Custom shell**/scripts, etc.

1. **Test Runner**  
   - [ ] Create a Jest-compatible API (`describe`, `it`, `expect`) or custom.  
   - [ ] **`rse test`** with optional watchers, snapshot support, TS/JS/JSX out of the box.  
   - [ ] Provide DOM/browsersim features (optional) or integrate with something like `happy-dom`.

2. **Bundler**  
   - [ ] **`rse build`**: bundle TypeScript/JavaScript for production.  
   - [ ] Minify, tree-shake, handle JSX/TS.  
   - [ ] Possibly allow single-file executables (like Bun's `--compile`) for easy deployment.

3. **Dev Server**  
   - [ ] Serve static files (`rse dev ./index.html`) for front-end apps.  
   - [ ] Possibly add framework detection or universal "app server.”  
   - [ ] Offer live reload or hot reload with state preservation.

4. **Hot Reloading**  
   - [ ] Provide a `--hot` flag to reload on file changes.  
   - [ ] Keep open connections alive if feasible, or do a partial restart.

5. **Monorepo Support**  
   - [ ] Recognize `workspaces` in `package.json`.  
   - [ ] **`rse run --filter=<package>`** to run commands in a subset of the monorepo.  
   - [ ] Link local packages automatically in dev for quick iteration.

6. **Shell Scripting API**  
   - [ ] Similar to `Bun.$`, let users run shell commands cross-platform in scripts.  
   - [ ] Provide an easy, built-in approach to handle environment differences without extra libs.

7. **Built-in Utilities**  
   - [ ] Password hashing (bcrypt, argon2), hashing (e.g. MD5, SHA).  
   - [ ] Glob matching, semver comparisons, color conversions, etc.  
   - [ ] Expose them as a standard library or built-in modules.

8. **HTTP Server & WebSocket** (Optional)  
   - [ ] Provide a built-in `rse.serve()` to replicate Bun's easy server approach.  
   - [ ] Could come with a router or minimal framework for quick prototypes.  
   - [ ] Possibly integrate watchers or hot reloading for server code.

By implementing these, **rse** can match Bun's "all-in-one” developer experience—**fast test runs, a built-in bundler, dev server,** and more.

### 14. **Drop-in Replacement for Git**

#### 1. **High-Level Design**

- [ ] **Define Project Scope & Goals**  
  - [ ] Decide if this VCS is purely local or distributed (peer-to-peer or server-based).  
  - [ ] Identify the key differentiators from Git (e.g., simpler data model, better large file handling, different conflict resolution strategy, etc.).  
  - [ ] Choose a primary language (e.g., Rust, Go, C, etc.).

- [ ] **Basic VCS Features**  
  - [ ] Check-in/commit changes, track file history.  
  - [ ] Support branching, merging, or simpler forms of concurrency management.  
  - [ ] Possibly a distributed model (push, pull, fetch, etc.) or central server-based approach.

- [ ] **Drop-in Replacement for Git**
  - [ ] Built-in `git` CLI into the `rse` CLI.

#### 2. **Repository & Data Model**

- [ ] **Repository Structure**  
  - [ ] Define how we store versioned data on disk (like `.git/` in Git).  
  - [ ] Possibly store objects (blobs, commits, trees) in separate files or a single object database.  
  - [ ] Consider chunk-based or a "content-addressable" storage approach, referencing content by hash.

- [ ] **Object Types**  
  - [ ] **Blob**: raw file content.  
  - [ ] **Tree (Directory Listing)**: references to blobs/trees, representing the state of a directory.  
  - [ ] **Commit**: references a tree, parent commits, commit metadata (author, message, timestamp).  
  - [ ] Decide if we need tags, references, annotated commits, or other advanced objects from the start.

- [ ] **Hashing & Identifiers**  
  - [ ] Choose a cryptographic hash (e.g., SHA-256, BLAKE3).  
  - [ ] Each object gets a unique hash ID.  
  - [ ] Plan how to handle collisions or if we assume they’re negligible.

- [ ] **Refs & Branches**  
  - [ ] Store references (branch heads, tags) in a special location (e.g., `refs/heads/main`, `refs/tags/v1.0`).  
  - [ ] Decide how we track the “HEAD” pointer for the current branch/commit.

#### 3. **Core Commands & Workflows**

- [ ] **Local Commands**  
  - [ ] `init`: Create a new repository (generate the hidden directory or store).  
  - [ ] `status`: Show changes between working directory and the latest commit.  
  - [ ] `commit`: Record snapshots of changed files into the repository.  
  - [ ] `log`: Display commit history.  
  - [ ] `diff`: Show differences between commits or working directory and HEAD.  
  - [ ] `checkout`: Switch between branches or commit snapshots.  
  - [ ] `branch`: Create/list/delete branches.  
  - [ ] `tag`: Create/list/delete tags.

- [ ] **Staging or Index** (Optional)  
  - [ ] Decide if we replicate Git’s “index/staging area” or track changes directly from working dir to commit.  
  - [ ] If we have a staging area, implement `add` to move changes into the index.

- [ ] **Remote Commands** (if distributed)  
  - [ ] `push`: Upload local commits/branches to a remote repository.  
  - [ ] `pull`: Fetch remote commits and merge/rebase them locally.  
  - [ ] `fetch`: Just download remote objects/refs without merging.  
  - [ ] `clone`: Copy a remote repository to local.

- [ ] **Merge & Conflict Resolution**  
  - [ ] Provide a default merge algorithm (e.g., a three-way merge).  
  - [ ] On conflicts, write conflict markers in the working directory and require manual resolution.  
  - [ ] Possibly consider a simpler or more advanced approach (like diff3, recursive merges, etc.).

#### 4. **Networking & Protocol**

- [ ] **Decide on Protocol Approach**  
  - [ ] If we want a direct "peer-to-peer" approach, define a custom protocol (similar to Git’s packfiles).  
  - [ ] If we want a more server-based approach, define an HTTP or gRPC-based interface to push/pull objects.  
  - [ ] Possibly reuse an existing protocol like SSH-based or HTTP-based for convenience.

- [ ] **Object Transfer**  
  - [ ] For `push`, figure out which objects the remote lacks, only send new commits/blobs.  
  - [ ] For `pull/fetch`, request needed objects from the remote.  
  - [ ] Implement a “delta” or “pack” format to optimize transfers (optional, but crucial for large repos).

- [ ] **Authentication & Security** (Optional for V1)  
  - [ ] Basic authentication or tokens for server-based approach.  
  - [ ] If peer-to-peer, consider encryption (TLS) or signing commits for identity.

#### 5. **Performance & Storage**

- [ ] **Compression**  
  - [ ] Decide whether to store objects uncompressed or compressed.  
  - [ ] Possibly use zlib or a modern compression method for objects.

- [ ] **Delta Storage** (Optional)  
  - [ ] For large files or many versions, store incremental deltas instead of full copies.  
  - [ ] This can be handled in a “pack” file for objects.

- [ ] **Large File Support** (Optional for V1)  
  - [ ] we might skip LFS at first, but consider a plugin or extension to store big binaries out-of-band.

#### 6. **Branching & Merging Model**

- [ ] **Linear History vs. DAG**  
  - [ ] Decide if we allow merges to create a graph or if we want a simpler linear approach.  
  - [ ] If we choose DAG, provide tools (like `log --graph`) or a simpler alternative.

- [ ] **Rebase & Cherry-Pick** (Optional for V1)  
  - [ ] Provide advanced commands if we want to replicate Git’s feature set.  
  - [ ] Or keep it simpler for a minimal V1.

#### 7. **User Interface & CLI Design**

- [ ] **CLI**  
  - [ ] Create subcommands akin to `myvcs commit`, `myvcs push`, etc.  
  - [ ] Provide helpful usage messages, short/long flags, color-coded output.  
  - [ ] Possibly mirror Git’s command style for user familiarity.

- [ ] **Configuration**  
  - [ ] A config file in each repository (like `.myvcs/config`) for storing user name, email, remote URLs.  
  - [ ] A global config file for default settings.

- [ ] **Help & Docs**  
  - [ ] `myvcs help <command>` to describe usage.  
  - [ ] Provide minimal man pages or HTML docs in a future iteration.

#### 8. **Testing & Validation**

- [ ] **Unit Tests**  
  - [ ] For data structures (commit objects, tree objects), hashing, refs, merges.  
  - [ ] For the local commands (init, commit, etc.) to ensure correct file/directory operations.

- [ ] **Integration Tests**  
  - [ ] End-to-end: init a repo, commit files, clone to another location, push/pull changes.  
  - [ ] Test merges, conflict scenarios, and resolution flows.

- [ ] **Performance Benchmarks**  
  - [ ] Compare commit times, push/pull speeds, or size of stored data vs. small and large repositories.  
  - [ ] Identify any bottlenecks in object packing or hashing.

- [ ] **Cross-Platform Testing**  
  - [ ] Ensure Windows, macOS, Linux all handle path separators, file modes, etc. consistently.  
  - [ ] Check any text/binary normalization if we want to handle line endings like Git does (core.autocrlf).

#### 9. **Advanced Features (Optional)**

- [ ] **Rebase & Interactive Rebase**  
  - [ ] Re-apply commits on top of another base, rewrite commit messages.  
  - [ ] Offer a “todo” list for the user to reorder or squash commits.

- [ ] **Stash**  
  - [ ] Temporarily store uncommitted changes, then apply them later.  
  - [ ] Useful for quick context switching without committing.

- [ ] **Signing Commits**  
  - [ ] Integrate GPG or other key-based signing for verifying commit authorship.  
  - [ ] Provide a trust model or verifying signatures on pull.

- [ ] **Submodules or Subtrees**  
  - [ ] Nested repositories referencing external code.  
  - [ ] Possibly keep it simpler in V1.

- [ ] **Plugins / Extension Mechanism**  
  - [ ] Let advanced users write scripts or plugins (like Git hooks) to automate tasks (e.g., pre-commit checks).

#### 10. **Release & Distribution**

- [ ] **Packaging**  
  - [ ] Provide a single binary distribution or minimal set of binaries.  
  - [ ] Possibly cross-compile for multiple OS/architectures.

- [ ] **Documentation & Examples**  
  - [ ] Thorough user guide on repository setup, branch usage, merges, remote config.  
  - [ ] Tutorials or quickstart: “How to set up and commit your first project.”

- [ ] **Community / Feedback**  
  - [ ] (Even if closed source) gather feedback from testers on performance, UI, merging approach.  
  - [ ] Possibly build out a small plugin ecosystem or integration with popular IDEs.

- [ ] **Roadmap for Future**  
  - [ ] Integrate advanced features (rebase, stash, partial commits).  
  - [ ] Explore different data models or large-scale performance improvements.  
  - [ ] Offer hosting or cloud-based solutions if we want a “GitHub-like” service in the future.

### 15. **Community & Ecosystem**

- [ ] **Open Source & Roadmap**  
  - [ ] Provide a `README`, contribution guide, code of conduct.  
  - [x] Publish a living roadmap with planned/in-progress features (like hot reload, bundling, test runner).

- [ ] **Docs & Tutorials**  
  - [ ] Show single-file usage, project-based usage, private registry usage, and advanced features (like monorepos).  
  - [ ] Include test runner, build pipeline, dev server, etc.

- [ ] **Support & Feedback**  
  - [ ] Slack/Discord or GitHub Discussions for Q&A.  
  - [ ] Encourage early adopters to file issues for Node compatibility gaps.

- [ ] **Comparisons & Migrations**  
  - [ ] Document how to migrate from npm, jsr, vlt, bun, deno, pnpm, yarn.  
  - [ ] Emphasize the "drop-in” approach, speed, and security benefits.

## Notes

- Perhaps, in order not to reinvent the wheel, it is worth using certain existing MIT-licensed APIs implementations, such as [Bun](https://github.com/oven-sh/bun#readme).
- The initial frontend files were created using `bun init` in bun v1.2.9. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Contributing

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

## License

💖 [MIT](LICENSE) 2025 © [blefnk Nazar Kornienko](https://github.com/blefnk)
