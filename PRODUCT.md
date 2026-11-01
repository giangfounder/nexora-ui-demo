# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: customer-care and sales staff at Vietnamese businesses who work the inbox all day. They answer customers across many channels, pick up conversations the AI assistant hands over, and keep customer records and pipeline stages up to date. They spend long shifts in the product, often with several conversations open at once.

Secondary: managers and shop owners who configure the AI assistants, connect channels, set routing rules, and read reports and quality scores.

## Product Purpose

NEXORA is a platform for running customer conversations with AI. An AI customer-care assistant answers most conversations on its own and hands the hard ones to a person. Staff handle every channel from one inbox, with the customer's record and history next to the conversation. Success means customers get fast, correct answers and staff spend their time only on conversations that need a human.

## Positioning

-   AI answers first and hands over to a person when needed, with the hand-off reason visible to the agent.
-   Built for Vietnamese channels in one inbox: Zalo OA, Zalo personal, Facebook Messenger, Instagram, TikTok, Shopee, Lazada, WhatsApp, website live chat, email.
-   CRM (customer types, pipeline stages, deals) and conversation quality scoring (Prism) sit next to the inbox instead of in separate tools.

## Operating Context

-   Main workflows: omnichannel inbox and hand-off queue, customer list / Kanban pipeline / customer detail, AI assistant studio (build and test an assistant), employees, teams and routing rules, Prism quality criteria and scores, reports, automation flows, app/integration store, settings.
-   `ui-prototype/` is the main UI version. It runs standalone on mock data (`src/mocks/`), with no backend, and is deployed as a static site.
-   Built on a Flowise fork: React 18, Vite, MUI 5. Icons go through the single `AppIcon` wrapper (Bootstrap Icons, solid glyphs inlined in `bootstrapGlyphs.js`).

## Capabilities and Constraints

-   Vietnamese is the default interface language; English is also available (`src/i18n/`).
-   Light and dark themes are both supported.
-   Channel and partner logos are brand marks and stay as they are.

## Brand Commitments

-   Name and logo: the NEXORA wordmark and the X mark stay unchanged.
-   Mascot: Mira, the blue robot with a halo, appears in the logo and as the floating assistant; keep it.
-   The interface speaks Vietnamese first.

## Evidence on Hand

-   All customer, conversation, report and assistant data in the prototype is mock data (`src/mocks/`, `views/*/mock*.js`). Do not present it as real customers, metrics or results.
-   No testimonials, case studies, customer logos or published metrics exist yet; do not fabricate any.

## Product Principles

1. The inbox is the product: anything that slows a staff member answering a customer is a cost.
2. Show what the AI did and why it handed over, so a person can take over without re-reading the whole thread.
3. One place for the customer: conversation, record, stage and quality score stay together.
4. Vietnamese first: copy, names and diacritics must read naturally.
