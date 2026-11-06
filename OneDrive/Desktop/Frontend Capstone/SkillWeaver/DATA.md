# DATA.md — Data ownership and rendering decisions

## Data model

| Entity | Main fields | Ownership |
|---|---|---|
| User | `id`, `name`, `email`, `passwordHash`, `createdAt` | User record is the account root. Password hash is server-only. |
| Goal | `id`, `userId`, `title`, `description`, `category`, `targetDate`, timestamps | Each goal stores its owner's user ID. |
| Task | `id`, `userId`, `title`, `description`, `goalId`, `priority`, `dueDate`, `completed`, `completedAt`, timestamps | Each task stores its owner's user ID; `goalId` must refer to a goal owned by the same account. |

The workspace adapter stores each account's goals and tasks separately in `data/skillweaver.json`. The file is generated on first use and ignored by Git.

## Where data is read

| Screen | Rendering / read strategy | Reason |
|---|---|---|
| Dashboard | Server Component reads the current user's workspace; interactive visual controls are small client components. | The initial page can be rendered with real account data without exposing the store to the browser. |
| Goals | Server Component reads goals and tasks; `GoalsManager` handles form state and requests. | The server owns the data; the browser owns temporary form/filter state. |
| Tasks | Server Component reads tasks and goals; `TasksManager` handles completion, search, and form interaction. | Mutations are checked by route handlers; task ownership is never trusted from the client. |
| Progress | Server Component calculates the initial activity view from saved tasks. | Analytics are derived from stored task timestamps and completion states. |
| Settings | Server Component supplies the current public profile; the client handles form interaction. | Password hashes and the session secret are never sent to the page. |

## Queries and refresh rules

The current adapter is file-backed rather than SQL-backed, so it has no SQL query key or client cache. Each private route performs a fresh server-side read for the signed-in user. After a successful mutation, the client updates its local view and calls `router.refresh()` so a later server render reads the current store. There is no cross-user cache.

## Data integrity rules

- A user ID is read from a verified session cookie, not from request payloads.
- Create/update/delete helpers scope record lookups by both record ID and user ID.
- A task cannot link to another user's goal.
- Deleting a goal keeps its tasks and clears their goal link.
- Task completion timestamps are set when marked complete and cleared when reopened.
- Empty accounts return empty arrays, not `undefined` or placeholder records.
- The sample workspace is opt-in and only loads when the user's workspace is empty.

## Persistence limitations

The JSON file store is a deliberately small capstone adapter. Its in-process write queue avoids overlapping writes within one Node.js process, but does not coordinate multiple processes or serverless instances and is not a transactional database. Replace it with a managed database before scaling or using ephemeral hosting. A production database implementation should use a user-scoped query in every read and mutation, foreign keys for task-to-goal ownership, and transactions for multi-record operations.
