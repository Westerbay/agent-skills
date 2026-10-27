# SEO and delivery

Review the changed route's actual search contract. Public product, editorial, and
marketing pages differ from account screens, internal tools, previews, and search/filter
combinations. Record intended indexability before recommending changes. Never remove
authentication or intentional `noindex` to improve a score. Robots directives are not
access control.

## Follow delivery from request to document

For the changed route and a representative sibling, trace:

`URL -> route match -> status/headers -> data -> initial HTML -> hydrated DOM -> links`

Check direct loads as well as client navigation, meaningful success/error responses,
redirect destinations, and unavailable/deleted entities. A page that shows an error
inside an HTTP 200 shell deserves investigation as a soft-404 risk. Do not assume
server rendering is mandatory: Google can render JavaScript, while other consumers may
not. Establish whether actual content and crawlable links remain available under the
project's delivery model. Avoid requiring scrolling or clicking to expose essential
indexable content. Use links with real `href` destinations for navigation.

Check route-specific descriptive titles and descriptions, including stale metadata
after navigation. A shared layout must not overwrite every child with identical data.
Distinguish metadata correctness from guarantees about the snippet a search engine
chooses. These checks follow [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Reconcile indexing signals

| Signal | Evidence to inspect | Failure to investigate |
| --- | --- | --- |
| Access and robots | Authentication, `robots.txt`, response `X-Robots-Tag`, document robots metadata | Public content accidentally excluded; private content exposed; contradictory directives |
| Canonical | Final canonical URL on direct load and navigation; route/locale/entity mapping | All products point to the home page; a translated page points to an unrelated language; conflicting header and HTML values |
| Redirects | Actual status, destination, preserved meaningful parameters | Loops, broken destinations, loss of a public route without a replacement |
| Discovery | Internal links, pagination, sitemap generation where used | New public routes unreachable; expired, private, or noncanonical URLs emitted as preferred URLs |

A crawler blocked by `robots.txt` may not see a page's `noindex`; blocking crawling does
not guarantee removal from search. Preserve private access controls independently of
indexing rules. See [Google's developer guide](https://developers.google.com/search/docs/fundamentals/get-started-developers).

Canonicalization expresses a preferred representative of duplicate or very similar
content. Check that the target resolves, uses the correct origin and language, and
matches the intended content. Keep sitemap, internal links, redirects, and canonical
output coherent. Missing canonical markup is not automatically a defect on every
unique page; show duplicate-URL risk or the repository's violated contract. Do not use
`noindex` merely as a replacement for canonicalization. See [Google's canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

## Structured data and content integrity

When structured data is present or the change introduces a relevant supported content
type, check its generated values against visible content and authoritative data. Do not
invent ratings, availability, authors, or offers. Validate the supported schema's current
requirements before adding it; schema validity does not guarantee a rich result. Read
the current [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
and the relevant type's official guide. Do not demand structured data for every page.

For multilingual routes, inspect the existing locale/canonical/alternate strategy and
translated destinations. For pagination or filters, preserve distinct useful content;
do not collapse all pages into page one without evidence of actual duplication.

## Evidence-driven priority

An accidental sitewide `noindex`, broken public navigation, or cross-route canonical
leak can affect all consumers of one shared owner. Prioritize that owner over cosmetic
metadata tuning. Reproduce at least two different route inputs when a shared generator
may leak titles, entity identity, locale, or canonical URLs.

If performance changed, inspect the specific regression in content delivery or
interaction, such as a new blocking dependency or a large image without reserved space.
Use project measurements when available; do not invent scores or promise ranking gains.
Source review and local checks cannot prove that a deployed page has been indexed.

Sources were consulted on 2026-10-27. Check current official documentation when relying
on search-engine behavior, supported structured-data features, or framework metadata APIs.
