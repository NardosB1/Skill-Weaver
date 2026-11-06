# AUTH.md — Authentication and route protection

## Authentication flow

1. The user submits the registration or sign-in form to a same-origin route handler.
2. Zod validates and normalizes the submitted fields on the server.
3. Passwords are hashed with `bcryptjs` using 12 rounds. Plain-text passwords are never written to the JSON data file.
4. The server signs a seven-day HS256 session token with `SESSION_SECRET` and sets it in an HTTP-only, SameSite=Lax cookie. The cookie is Secure in production.
5. Protected App Router layouts verify the cookie and look up the user on the server before rendering the workspace.
6. Every mutating API route verifies the session again. The client interface is not treated as an authorization boundary.

## Private routes

| Route | Access | What is checked |
|---|---|---|
| `/dashboard` | Signed in | Workspace layout verifies session before rendering. |
| `/goals` | Signed in | Same protected workspace layout; reads only the signed-in user's goals. |
| `/tasks` | Signed in | Same protected workspace layout; reads only the signed-in user's tasks. |
| `/progress` | Signed in | Same protected workspace layout; calculates analytics from owned data. |
| `/settings` | Signed in | Same protected workspace layout; profile and data mutations verify ownership. |

## Mutating actions

| Action | Server-side proof |
|---|---|
| Register / sign in | Zod validation; password hash comparison; session signing. |
| Create or edit goal | Valid session; records are stored under the authenticated user's workspace. |
| Delete goal | Authenticated user ID is used to locate the goal; linked tasks are unassigned, not exposed. |
| Create or edit task | Valid session; task is stored under the authenticated user's workspace; a linked goal must belong to the same user. |
| Complete task | Server locates the task by both task ID and authenticated user ID. |
| Delete task | Server locates the task by both task ID and authenticated user ID. |
| Update profile / reset data | Valid session; server uses the session user ID, never a client-supplied owner ID. |

## The three capstone security checks

### 1. Signed-out write

- Sign out.
- Send a `POST` to `/api/goals` with a valid same-origin request body.
- Expected result: `401` and no record is created.
- The refusal occurs in the route handler after `getSessionUser()` returns no user.

### 2. Cross-account record ID (IDOR)

- Create two different accounts.
- Create a goal/task while signed in as account A.
- Sign in as account B and attempt to update/delete the ID created by A.
- Expected result: `404` or an equivalent refusal; A's record remains unchanged.
- The data functions search with both record ID and the authenticated user's ID. The user ID is derived from the signed session, not accepted from the client.

### 3. Crafted return link

- Open `/login?next=https://example.com`.
- Sign in successfully.
- Expected result: the application navigates to `/dashboard`; it never reads or redirects to the supplied `next` parameter.

## Additional controls

- Mutating routes require a same-origin `Origin` header.
- Session cookies are HTTP-only, SameSite=Lax, path `/`, and Secure in production.
- The token algorithm is explicitly restricted to HS256 during verification.
- Password inputs have server-side length validation and bcrypt hashing.
- Email addresses are normalized to lowercase.
- The UI disables submit buttons while a request is pending to reduce accidental duplicate submissions.

## Limitations and production hardening

This is a teaching capstone implementation, not a replacement for a fully managed identity platform. Before a public multi-user production deployment, add rate limiting / abuse protection at the edge, email verification and password reset, audit logging, session revocation, a managed transactional database, backup/restore procedures, and automated security tests. The JSON file adapter is intended for a single persistent Node.js process; it does not provide cross-process transaction locking.
