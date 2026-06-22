# GitHub repo settings checklist (public repos)

Apply these settings to each public repo in the `cloudgrid-io` org. The
steps below use the GitHub UI; `gh` CLI equivalents are noted where available.

## 1. Secret scanning and push protection

1. Go to **Settings > Code security and analysis**.
2. Enable **Secret scanning** (or confirm it is on).
3. Enable **Push protection** under secret scanning.

```
gh api -X PUT repos/cloudgrid-io/{repo}/code-scanning/default-setup
```

Push protection blocks commits that contain detected secrets before they
reach the remote. Secret scanning alerts on any that slip through.

## 2. Branch protection on main

1. Go to **Settings > Branches > Add branch protection rule**.
2. Branch name pattern: `main`.
3. Enable:
   - **Require a pull request before merging**
     - Required approving reviews: **1**
   - **Require status checks to pass before merging**
     - Add required checks: `gitleaks`, `no-internal-refs`, `license`,
       `lint-skills` (adjust per repo).
   - **Require branches to be up to date before merging**
   - **Do not allow bypassing the above settings** (applies to admins too).

```
gh api repos/cloudgrid-io/{repo}/branches/main/protection \
  -X PUT \
  -f required_status_checks='{"strict":true,"contexts":["gitleaks","no-internal-refs","license","lint-skills"]}' \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f enforce_admins=true \
  -f restrictions=null
```

## 3. Restrict visibility changes

1. Go to **Settings > General > Danger Zone**.
2. Confirm **Change repository visibility** is restricted to org owners.
   (This is the default for org repos — verify it has not been relaxed.)

At the org level (**Organization Settings > Member privileges**):
- Set **Repository creation** to the appropriate level.
- Set **Repository visibility change** to **Disabled** for non-owners.

## 4. Dependabot

1. Go to **Settings > Code security and analysis**.
2. Enable **Dependabot alerts**.
3. Enable **Dependabot security updates**.
4. Confirm `.github/dependabot.yml` exists in the repo (CI lints for it).

## 5. Verify

After applying, confirm:

```
# Branch protection is active
gh api repos/cloudgrid-io/{repo}/branches/main/protection

# Secret scanning is enabled
gh api repos/cloudgrid-io/{repo} --jq '.security_and_analysis'
```

Run a test PR to verify required checks appear and block merge until green.
