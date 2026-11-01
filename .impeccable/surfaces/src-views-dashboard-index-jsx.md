---
version: 1
slug: 'src-views-dashboard-index-jsx'
primary_target: 'src/views/dashboard/index.jsx'
related_targets: []
---

# Surface brief: NEXORA app (Operate)

Visitor mode: Operate. Staff run the inbox and the customer pipeline all day; scanability and familiar controls outrank expression.

Audience and job: CSKH/sales staff pick up AI hand-offs, answer customers across Vietnamese channels, update records. Managers read reports and configure assistants.

Constraints: logo + X mark and the Mira mascot stay; Vietnamese first; light and dark; mock data only, no invented metrics.

Chosen direction: "Bảng giờ tàu" (Vietnamese railway arrivals board). Memorable moment: the Tổng quan opens on the hand-off queue drawn as an arrivals board.

## Direction contract

THESIS: every conversation is a train arriving at the platform: when, from whom, which channel, why a person is needed, what state. The app refuses the glowing-hero, 3D-chart, pastel-icon-tile dashboard.

OWN-WORLD: deep railway navy (#0E2350) boards with white type and amber (#F2B233) for "waiting"; pale ground (#F4F6FA) with white 8px panels held by 1px hairlines, no soft shadows; Be Vietnam Pro for UI, Barlow Semi Condensed for headings and tabular figures; status always a Phosphor duotone glyph plus a word, never a bare colour dot; neutral rounded-square avatars with initials.

STORY: a staff member opens the app and sees at once who is waiting, for how long and why, then works the queue.

FIRST VIEWPORT: Tổng quan: page title, then the navy hand-off board (8 columns: wait time, customer, channel with logo, reason, state), beside a 4-column list of conversation states each with glyph and count; below, a row of four station-style figures with one-colour sparklines.

FORM: assigned direction, candidate 7 of the grounded list; seed: 5009e0dc95e20c48.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Open decisions

-   Top navigation stays light (not navy) for now: it carries the workspace switcher, radial panel and logo hand-off animation.
-   Remaining screens inherit the new theme (font, flat panels, 8px radius, glyph statuses) but are not individually redesigned.
