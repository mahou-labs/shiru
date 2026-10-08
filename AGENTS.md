# shiru

## Tests are part of every API change

Every new feature or bug fix in `apps/api` ships with tests in the same change. `vp run test` runs them with coverage, and CI fails when coverage drops below the thresholds in `apps/api/vite.config.ts`. Do not lower the thresholds to make a change pass. Add the missing tests.

Write tests the way a caller uses the API:

- Put them next to the code as `*.test.ts`.
- Drive the real app through `createClient()` from `src/test/client.ts`. It sends requests to the Hono app with the dashboard's `Origin` and a cookie jar. `signUpVerified()` and `createOrganization()` cover the usual setup.
- Assert literal values: status codes, response bodies, typed error codes. A test that would still pass if the code returned `undefined` is not a test.
- For a procedure that has no route yet, attach a handler and run it with `call()` from `@orpc/server`, as `src/utils/orpc.test.ts` does for `paidProcedure`.
- Pin time with `vi.useFakeTimers({ toFake: ["Date"] })` and `vi.setSystemTime()` when results depend on dates.

`src/test/setup.ts` swaps three things, and nothing else should be mocked:

- `cloudflare:workers` becomes the bindings in `src/test/bindings.ts`. Sent emails land in `sentEmails`, and `waitUntil` work is awaited after each request.
- `src/utils/db.ts` becomes an in-memory SQLite database with the real migrations from `apps/api/drizzle` applied. Each test file gets a fresh database, so use unique emails within a file.
- `@polar-sh/sdk` becomes an in-memory fake of the customer API. Its state is `polarCustomers`.

Better Auth skips its origin (CSRF) check when `NODE_ENV` is `test`, so origin rejection cannot be tested here. Use the `verify-shiru` skill for checks that need the real server or a browser.
