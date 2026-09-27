# React / TypeScript organization

## Feature boundaries

Choose a proportionate structure. This example is for a paginated list that owns
queries, navigation, columns and multiple display states:

```text
features/users/
  users.config.ts
  hooks/
    use-users.ts                 Query and cache parameters
    use-users-table.ts           Navigation, retry and table model
  components/
    users-table.tsx              Section composition
    users-table.columns.ts       Column definitions and cell callbacks
    users-table-content.tsx      Table and empty-state rendering
    users-table-pagination.tsx   Buttons and page announcement
    users-table-feedback.tsx     Loading and error feedback
```

These names illustrate responsibilities; do not copy this structure for a simple
static list. Extract a generic mechanism only when reuse offers a concrete benefit
and fits the project's modules.

## Handlers before JSX

```tsx
function Navigation({ pending, onNextPage }: NavigationProps) {
  return <Button disabled={pending} onClick={onNextPage}>Next</Button>
}
```

The hook or component that owns the state defines the named behavior:

```tsx
async function handleNextPage() {
  if (!canGoNext) return
  if (hasCachedNextPage) {
    setPageIndex(pageIndex + 1)
    return
  }
  await loadNextPage(pageIndex + 1)
}
```

Avoid `onClick={() => void handleNextPage()}` when a direct reference suffices.
Handle errors in orchestration or the chosen query mechanism. An asynchronous
callback's type must reflect its promise when consumers need to await it. Do not
add `useCallback` automatically: stabilize references only when a consumer or
measurement justifies it.

## Typed options without assertions

Specify generics explicitly when inference narrows a type too far:

```ts
function getNextPageCursor<T>(page: CursorPage<T>): string | undefined {
  return page.nextCursor ?? undefined
}

return infiniteQueryOptions<
  CursorPage<T>, Error, TData, QueryKey, string | undefined
>({
  ...options,
  initialPageParam: undefined,
  getNextPageParam: getNextPageCursor<T>,
})
```

The `CursorPage` type, page limits and response schema belong to the shared
contract. The wrapper must preserve useful native options such as `select`,
`enabled` and `staleTime`. Validate untrusted data before use; static typing alone
does not validate an external response.

## State, cache and navigation

- Derive rows and available actions from received pages. Store only necessary
  interaction state, such as the requested page.
- Keep columns and an empty array stable when the table library depends on their
  identity; do not add memoization everywhere.
- Use the same unique ordering in the cursor predicate and the query. `limit + 1`
  detects the next page without counting the entire list.
- Include page size, filters and relevant context in the query key. Pass the
  cancellation signal to the HTTP client and respect private-cache eviction.
- Do not advance the displayed page when loading fails. Preserve available rows.
  A retry must load the failed page even if the user has returned to an earlier page.
- Preserve semantic HTML, labels, loading announcements and keyboard navigation.
  Splitting components must not degrade accessibility or mobile rendering.

## Meaningful validation

Adapt existing tests to cover the first/last page, returning without an unnecessary
request, an error followed by retry, retry after backward navigation, preservation
of generic options and changes to cache parameters. Use an owned, isolated test
database for persistence tests. A pure component extraction does not require a
test that duplicates its JSX.
