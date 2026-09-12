# Technical Specification — Issue #4

> **Status note:** This issue is `CLOSED` (2026-08-22), resolved by PR #6 → commit
> `80e324c`. The specification below is therefore **retrospective**: sections 2–3
> document the verified root cause and the solution as it was actually
> implemented, and section 4 describes the change that landed rather than
> outstanding work. Section 9 is written as a re-verification checklist.

## 1. Issue Overview

| Field | Value |
| --- | --- |
| Title | When hovering over "Privacy Policy" in the footer, nothing is displayed |
| Description | The footer's "Privacy Policy" link shows no information on hover; it should display a short description of where the link leads. |
| Labels | *(none)* |
| Milestone | *(none)* |
| Assignees | *(none)* |
| State | CLOSED — 2026-08-22 |
| Priority | Low |

Reported behaviour, verbatim from the issue: *"When hovering over 'Privacy
Policy' in the footer, nothing is displayed. It should display a short
description of the link."* A screenshot of the footer was attached. No
reproduction steps beyond the hover interaction were given, and no maintainer
comments discuss alternative designs — the only comment records the fix.

## 2. Problem Analysis

Root cause, confirmed against the repository:

The footer's policy links were rendered as bare `<a>` elements carrying a label
and no `href`, no `title`, and no tooltip markup of any kind. A hover therefore
had nothing to reveal — there was no hidden element to show and no native
`title` attribute for the browser to fall back on. The links were also not
keyboard reachable, since an anchor without `href` is not focusable by default.

This was not specific to "Privacy Policy". The same markup backed three sibling
links, which produced three separate reports:

| Issue | Link | Resolution |
| --- | --- | --- |
| #2 | Cookie Policy | `80e14e0` |
| #3 | Terms of Service | PR #5 → `ea22427` |
| **#4** | **Privacy Policy** | **PR #6 → `80e324c`** |
| #8 | Contact Us | PR #9 → `fc5d029` |

"Contact Us" (#8) differed slightly: it *was* a working `react-router` `Link`,
so it navigated correctly but still had no tooltip.

A second, layout-level concern surfaced during the fix. "Privacy Policy" is the
**first** item in the footer link row. A tooltip centred on its trigger would
extend past the left viewport edge on narrow screens and be clipped, so
horizontal centring alone was not a sufficient design.

## 3. Proposed Solution

The minimal change was to introduce one reusable presentational component
rather than patch each link inline, because four links shared the defect.

`src/components/FooterPolicyLink.jsx` encapsulates:

- the trigger element and its label,
- a `role="tooltip"` bubble revealed on `group-hover` / `group-focus`,
- `aria-describedby` wiring via `useId()` so the description is announced to
  assistive technology,
- an `align` prop (`left` / `center` / `right`) selecting position and arrow
  offset from an `ALIGN` lookup map,
- an optional `to` prop that swaps the rendered element between a
  `react-router` `Link` and a plain `<a>`.

Trade-offs considered:

- **Native `title` attribute** — one line per link, but unstyleable, delayed by
  ~1s, and invisible to keyboard users. Rejected: the issue asks for a tooltip
  "in sync with the website design".
- **A tooltip library** — rejected as over-engineering for four static strings;
  `CLAUDE.md` also constrains the project to Tailwind utilities with no new
  dependencies.
- **CSS-only reveal via `group-hover`** — chosen. No state, no effects, no
  re-renders; consistent with the Tailwind-only styling rule.

Non-navigable links receive `tabIndex: 0` so they remain focusable despite
having no `href`; navigable ones (`to` set) are focusable natively and must not
be given a redundant `tabIndex`.

## 4. Step-by-Step Implementation

1. **Create `FooterPolicyLink`** — build the component described above as a
   functional component with a named export, per the project's conventions.
2. **Define the `ALIGN` map** — three entries pairing tooltip position classes
   with the matching arrow offset, with `ALIGN.center` as the fallback for an
   unrecognised `align` value.
3. **Replace the Privacy Policy anchor** — render it through
   `FooterPolicyLink` with `align="left"` and the description text, so the
   tooltip anchors to the row's left edge instead of overflowing it.
4. **Apply the same component to the sibling links** — Terms of Service and
   Cookie Policy at default centre alignment; Contact Us with `align="right"`
   and `to="/contact"` (landed under #3, #2 and #8 respectively).

## 5. Verification Strategy

The project currently has **no test runner configured** — `package.json`
defines only `dev`, `build`, `lint`, and `preview`. The unit and integration
rows below therefore describe tests that would need a runner (Vitest +
React Testing Library) to be added first; that addition is out of scope for
this issue. Manual checks are the verification that actually applies today.

### Unit Tests

- Render with `description` → a `role="tooltip"` element exists containing that text.
- Render without `to` → element is an `<a>` with `tabIndex="0"`.
- Render with `to="/contact"` → element is a router `Link` with that target and **no** `tabIndex`.
- Render with `align="left"` → tooltip carries `left-0`; with an unknown value → falls back to centre classes.
- Two instances on one page → `aria-describedby` ids are unique.

### Integration Tests

- Render `<Footer />` → four tooltip descriptions are present in the accessible tree.
- Click "Contact Us" → router location becomes `/contact`.

### Manual Checks

- Hover "Privacy Policy" → styled tooltip fades in above the link.
- Tab to "Privacy Policy" → the same tooltip appears on focus, not only on hover.
- Narrow the viewport to ~360px → the tooltip stays fully on-screen, not clipped at the left edge.
- Hover each of the other three links → tooltip appears, correctly aligned.
- Toggle dark mode → tooltip contrast remains readable.

## 6. Files to Modify

| File Path | Nature of Change |
| --- | --- |
| `src/components/Footer.jsx` | Replace the bare policy anchors with `FooterPolicyLink`, passing `label`, `description`, and `align`. |

## 7. New Files to Create

| File Path | Purpose |
| --- | --- |
| `src/components/FooterPolicyLink.jsx` | Reusable footer link with an accessible, design-consistent hover/focus tooltip. |

## 8. Existing Utilities to Leverage

| Utility | Benefit |
| --- | --- |
| React `useId()` | Collision-free tooltip ids for `aria-describedby` across multiple instances. |
| `Link` (react-router-dom) | Keeps client-side navigation for the one link that actually navigates. |
| Tailwind `group` / `group-hover` / `group-focus` | Pure-CSS reveal — no component state, satisfies the Tailwind-only styling rule. |
| Existing footer gradient and `bg-gray-800/95` surface tokens | Tooltip matches the established visual language. |

## 9. Acceptance Criteria

- [x] Hovering "Privacy Policy" displays a short description of the link.
- [x] The tooltip is styled consistently with the site's design language.
- [x] The tooltip is reachable by keyboard focus and exposed via `aria-describedby`.
- [x] The tooltip does not clip at the viewport edge for the first link in the row.
- [x] No regression to the sibling footer links or to `/contact` navigation.
- [ ] Automated tests added — **not met**; no test runner exists in this project.
- [ ] `npm run lint` verified on the merged result — see note below.

**Open item carried over from PR #9:** the automated agent that produced the
Contact Us fix reported it was unable to run `npm run lint` and asked for a
local run before merge. The branch was merged regardless. A lint run over
`Footer.jsx` and `FooterPolicyLink.jsx` is the one concrete outstanding action
for this family of issues.

## 10. Out of Scope

- Writing the actual Privacy Policy, Terms of Service, and Cookie Policy pages
  and routing to them — the links remain non-navigable by design; only the
  hover description was requested.
- Introducing a test runner or test suite to the project.
- Any redesign of the footer layout beyond tooltip alignment.
- Adding a tooltip to navbar or in-page links.
