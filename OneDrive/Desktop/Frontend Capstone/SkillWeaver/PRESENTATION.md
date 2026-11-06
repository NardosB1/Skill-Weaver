# SkillWeaver — eight-minute presentation outline

Use a timer and rehearse this aloud. Open the live URL, repository, and the files named below before presenting.

| Time | What to show | What to explain |
|---|---|---|
| 0:00–1:00 | Welcome page and dashboard | SkillWeaver helps students turn learning goals into practical tasks and track follow-through. |
| 1:00–3:00 | Create a goal, create a task, mark it complete, then open Progress | The dashboard totals and progress view derive from saved tasks. Show the empty state first if using a new account. |
| 3:00–5:00 | Open `src/lib/auth.ts`, `src/app/(workspace)/layout.tsx`, and one API route | Explain the signed cookie, server-side session lookup, and user-scoped record access. |
| 5:00–6:00 | Show the tests in `AUTH.md` | Explain the signed-out write, cross-account ID, and crafted return-link checks. |
| 6:00–7:00 | Show `PERF.md` | Present measured deployed results only. The ZIP starts with the actual-value fields marked as pending. |
| 7:00–8:00 | Show `FUTURE.md` | Explain why collaboration, AI planning, notifications, and advanced themes were cut from the first scope. |

## Code walkthrough questions to prepare

- Why is the workspace layout a Server Component?
- Which components need client-side state, and why?
- Where is the session verified?
- Where is record ownership verified for a task update?
- Why does deleting a goal unassign rather than delete its tasks?
- What is the limitation of the JSON file store, and what would replace it?
- What would another development week improve first?
