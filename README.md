# Release 2 — CMS Security & One-Commit Publish (28 October 2026)

**Recommended update to an existing live website:** use `Xander_Portfolio_PATCH_ONLY.zip` rather than replacing your production `data/portfolio.json` / `data/portfolio-fallback.js` files. The full source ZIP contains a snapshot of the uploaded file and may not reflect edits made on the live GitHub repository since that snapshot.

**Security limit:** Public GitHub Pages content is public, including JSON, JS, assets and repository history. The CMS now omits `published:false` entries and unknown JSON fields from new public commits. This does **not** make rendered portfolio data secret or retroactively erase old commits. The token vault encrypts at rest with a separate user-selected passphrase, but cannot withstand hostile same-origin JavaScript, XSS or browser malware. Prefer a trusted personal computer, HTTPS, and repository-limited short-expiry tokens.

**New release notes:** See `PANDUAN-UPDATE-V2.md` for instructions in Indonesian.

---

# Xander Portfolio — Modern Professional Bento + JSON CMS

Project revamp from the original `Project Website Asal.zip`. **Production stack: pure HTML, CSS, JavaScript, JSON.** No SQL database, PHP, Node server, or front-end build tools required.

## What's included

- `index.html` — public professional portfolio (bento layout, responsive, light/dark toggle, accessibility baseline).
- `Sign-In.html` — custom CMS sign-in page using the requested username and a PBKDF2 password *verifier* (not plaintext). The public website now has a persistent **Sign In** button in its header (including mobile) linking directly to this page.
- `admin.html` — CMS dashboard for editing profile, projects, experience, skills, achievements, education, certificates, colors, SEO, and social links.
- `data/portfolio.json` — **single source of truth** for production data.
- `data/portfolio-fallback.js` — generated public-only snapshot for opening `index.html` / CMS directly from a local folder (`file://`). The hosted site uses the latest JSON from the repository.
- `js/site.js` — renders production content from JSON; no need to change HTML whenever the content changes.
- `js/admin.js` — edits and previews JSON; saves local drafts and publishes using GitHub REST Contents API.
- `js/auth-config.js` — client-side password-verifier configuration, **not server-side authentication**.
- `assets/` — image/logo assets migrated from the original project (private internship letter and private address intentionally omitted).

## Quick local preview (fixed for `file://`)

**You may double-click `index.html` to view the entire portfolio from a local folder.** The browser loads the bundled `data/portfolio-fallback.js` snapshot, so it no longer needs `fetch()` to read JSON using the restricted `file://` protocol. Your original photo is displayed in natural color (the grayscale CSS filter was removed).

- To view the front-end: open `index.html` directly, or start a local HTTP server.
- To test the CMS: open `Sign-In.html`, sign in and change content; the local draft persists in the browser and Live Preview is supported in `file://` mode.
- To move local draft edits into **JSON** files without a repository connection: use **Export JSON backup** and replace `data/portfolio.json` as needed. If you then want double-click previews to also reflect those edits, download the matching `data/portfolio-fallback.js` using **Export offline JS**. Browser security prevents a static page from silently saving files to your disk.
- To publish edits directly to GitHub Pages, connect GitHub in the CMS and use **Publish JSON changes**. HTTP(S) always reads the current repository JSON. The local fallback snapshot is for offline viewing only.

To preview real-time production JSON locally (recommended for testing GitHub-style data loading), use the **Live Server extension in VS Code** and open the website using the localhost URL provided by the extension.

To refresh offline data **without touching any code**, open the CMS dashboard, edit your content and use both **Export JSON** and **Export offline JS**. Place the two downloaded files in the `data/` folder (replace `portfolio.json` and `portfolio-fallback.js`). On GitHub, the Publish button syncs both public data files in one commit; the production site uses JSON directly.

## GitHub Pages hosting

1. Create a GitHub repository you own (prefer a dedicated repository for this portfolio).
2. Upload **the contents of** this folder (not an extra enclosing folder) to the repository root.
3. Under GitHub **Settings → Pages**, configure **Deploy from a branch**, choose `main` and `/(root)`, and save. Alternatively use a GitHub Pages Actions workflow with the appropriate published source.
4. The public URL is generally `https://ACCOUNT.github.io/REPOSITORY/` for a project repository, or `https://ACCOUNT.github.io/` when the repository is named `ACCOUNT.github.io`.
5. Open the live `Sign-In.html` URL, log in, and open **GitHub & Publish** in the CMS sidebar.
6. Create a *fine-grained Personal Access Token* at https://github.com/settings/personal-access-tokens/new. Choose your user as resource owner; restrict repository access to your **portfolio repository only**; permission **Contents: Read and write**. Do not grant access to other repositories or share the token.
7. Enter GitHub **owner**, **repository name**, **branch**, and token, then click **Test & connect**. Optionally enter a separate vault passphrase (minimum 12 characters) so the token is saved **encrypted** in browser localStorage; after reopening CMS, use **Unlock saved token** and the passphrase. Without a passphrase, the token is memory-only. No raw token is written to repository files.
8. Edit in CMS → **Preview** → **Publish JSON changes**. This writes **one Git commit** containing both `data/portfolio.json` and `data/portfolio-fallback.js` (not two separate commits). Only explicitly supported fields and published entries are included. GitHub Pages will redeploy from the configured branch; a change is not guaranteed to be visible *immediately* because deployment and caches can take time.
9. If you change the published website manually outside the CMS, choose **Reload published JSON** before editing to avoid overwriting other changes.

**Media:** use the Media Library after connecting GitHub. Images upload directly into `assets/uploads/` via GitHub API (this creates an immediate commit), then paste the returned relative path into the relevant content field and publish the updated JSON. Upload max 2 MB and don't upload confidential images.

**Backups:** CMS supports export/import of `data/portfolio.json` and stores the current *unpublished* draft in localStorage of the current browser only. GitHub commit history serves as production version history.

## Security — required reading

**A GitHub Pages website is publicly readable. A sign-in/password check implemented in JavaScript cannot protect the CMS HTML/JS, and a PBKDF2 password hash shipped with the site can be inspected and potentially attacked offline. The custom sign-in is only a convenient UI gate, not robust authentication.** Anyone with sufficient technical knowledge can bypass this gate to view the CMS editor, but **cannot publish to your repository without an authorized GitHub credential**. Only GitHub-repository permissions authorize changes to production.

- The user-selected username is configured in `js/auth-config.js`. The user-selected plaintext password is **not embedded** in this repository. A salted PBKDF2 verifier is embedded; change the password if it is reused anywhere, especially now that it was shared in a chat. To change it, generate a new verifier locally (see below). The password is not a substitute for GitHub authentication.
- **Don't commit GitHub access tokens** in HTML, JS, JSON, Markdown, screenshots, or browser storage. Never place a PAT inside a public GitHub repository.
- Consider 2FA or passkeys on your GitHub account; remove stale tokens via GitHub Settings. Use a token expiration date.
- If you require **actual restricted read access** to `/admin.html` or genuine secure username/password authentication using your own credentials, a static-only GitHub Pages site cannot provide it. You must add a trusted identity provider / access proxy / serverless backend. GitHub Pages alone is insufficient for that requirement.
- The public page hides the admin link by default, but hidden links / noindex / client-side route guards are **not security controls**.
- Changes are public commits. Do not include confidential business/customer data or identifying private home addresses in portfolio content.

### Rotate the CMS UI password verifier (optional)

To change the CMS UI password verifier, generate a new random salt and PBKDF2-SHA256 value using the browser Web Crypto API from an HTTPS or localhost context (not by committing your plaintext password). Replace the `salt` and `verifier` fields in `js/auth-config.js`. The username is configurable there as well. The UI password remains only a client-side convenience; GitHub account permissions are what prevent unauthorized publishing.

### Limitations / scope

- The GitHub CMS requires a GitHub token to *publish*, but not to edit a local draft.
- Uploaded images are committed at upload time. Deleting unused assets should be done via GitHub repository; the Media Library displays referenced images and supports new uploads, but does not delete repository files.
- SEO metadata is set client-side from JSON. Search engines that do not execute JS may not read the custom JSON-derived title and description; for SEO-heavy use, also edit the static fallback `<title>` and meta description in `index.html`.
- JSON edits update the public site after GitHub Pages deployment; browser caching may require refreshing the page.
- Only published content (`published: true`) is displayed publicly; content remains in the JSON file (and public Git repository) even if hidden from the UI. Do not store secret data in hidden entries.

## Documentation references

- GitHub REST — Create or update file contents: https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents
- GitHub Pages overview: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- Fine-grained tokens: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
