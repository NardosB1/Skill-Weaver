# PERF.md — Performance and accessibility record

## Budgets from the capstone brief

The supplied capstone brief sets these Core Web Vitals targets for the deployed build:

| Metric | Target | Actual deployed result |
|---|---:|---|
| LCP | Under 2.5 seconds | Not measured in this environment |
| CLS | 0.1 or lower | Not measured in this environment |
| INP | 200 ms or lower | Not measured in this environment |

**Do not report an estimated value as a measured result.** Run Lighthouse against the deployed URL and fill in the actual column, including the date, device profile, and URL.

## Implementation choices

- App Router Server Components are used for initial workspace reads; client components are used for forms, navigation state, filtering, and task interactions.
- The app avoids large image assets in the main experience; the decorative dashboard treatment is CSS-based.
- Lucide icons are imported per component.
- The dashboard uses derived statistics rather than duplicated counters.
- Route metadata is declared per page; the root layout defines title, description, Open Graph and Twitter metadata.
- `robots.ts` disallows indexing private routes and API endpoints; `sitemap.ts` lists only public entry routes.
- Layouts reflow at tablet and mobile widths; the sidebar becomes an accessible mobile drawer.
- Reduced-motion preferences are respected.

## Manual verification checklist

| Check | How to run | Result |
|---|---|---|
| Lighthouse | Chrome DevTools → Lighthouse; test the deployed URL with mobile and desktop profiles. | Pending deployment |
| LCP / CLS / INP | Record the values shown in Lighthouse / field data when available. | Pending deployment |
| Keyboard navigation | Use Tab, Shift+Tab, Enter, and Space without a mouse. | Source-level pass only; manual browser check pending |
| Mobile layout | Test at 375px, 390px, 768px, and 1024px widths. | CSS breakpoints included; manual browser check pending |
| Headings | Inspect each route; each page has one primary `h1`. | Source-level review pending browser inspection |
| Images | Inspect Network panel; dashboard artwork is CSS and the Open Graph SVG is a small vector asset. | Pending deployed check |
| Empty states | Register a new account; inspect goals, tasks, progress, and dashboard. | Implemented; runtime check pending |
| Error states | Trigger a failed request / unavailable route. | API messages and route error UI included; runtime check pending |

## Record the deployed audit here

- Audit date:
- Deployed URL:
- Lighthouse version / browser:
- Device profile:
- Performance score:
- Accessibility score:
- Best Practices score:
- SEO score:
- LCP:
- CLS:
- INP:
- Biggest finding:
- Change made:
- Before / after evidence:
