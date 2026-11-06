# FUTURE.md — Deliberately deferred scope

These items are not part of the first complete capstone build. They are recorded intentionally so that the core experience can be finished and verified before new features are started.

## Could: defer until the core flow is stable

- Full calendar view and drag-and-drop scheduling.
- Email reminders and notification delivery.
- Collaborative study groups, public profiles, and social feeds.
- AI-generated study plans or automated coaching.
- Multiple dashboard themes and advanced personalization.
- File uploads, rich notes, and course-resource libraries.
- A mobile-native application.

## Infrastructure improvements before public production use

- Replace the JSON file adapter with a managed PostgreSQL database and migrations.
- Add rate limiting, email verification, password reset, session revocation, audit logs, and automated security tests.
- Add database backups, restore drills, and monitoring.
- Add deployment-specific environment validation and persistent storage configuration.

## Why these were deferred

The main capstone task is to provide a small, complete learning workspace. A stable end-to-end account flow, correct ownership checks, working goal/task CRUD, understandable empty states, accessible responsive UI, and honest documentation have higher value than animations or additional screens that remain half-built.
