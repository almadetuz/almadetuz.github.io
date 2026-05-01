---
description: Refine a user story for the Jekyll site through structured codebase discovery
allowed-tools:
  - Read
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

I'll help you refine a user story into a well-structured technical plan for this Jekyll site. Input: $ARGUMENTS

This site is a static Jekyll build on GitHub Pages. There is no server-side code to design — work happens in `_layouts/`, `_includes/`, content collections, `assets/`, and `_sass/`. Plans should be expressed in those terms.

## Phase 1: Load Context

### 1.1 Parse input

Determine what the user provided in `$ARGUMENTS`. Present a brief summary of the request and any draft solution found in their description. You need a clear "problem to solve" and a high-level "solution proposed" before continuing.

### 1.2 Explore the codebase

Use `Task` with `subagent_type: "Explore"` to map the relevant pieces:

- Which **layout(s)** apply? (`page`, `landing`, `link`, `lead`, `download`, `legal`, `clean`, `confirm`, `suscribed`, `checkout`)
- Which **includes** are involved? (forms, link tracking, blocks, products)
- Which **content collection or top-level dir** owns the new content? (`cartas/`, `coser-y-cantar/`, `infusiones/`, `mis-canciones/`, `taller/`, `legal/`, `d/`, `u/`, `l/`, `_singles/`)
- Which **SCSS partial(s)** would change? (`main`, `form`, `carousel`, `video`, `fonts`, `logo`)
- Which **JS modules** would change? (`api.js`, `forms.js`, `link.js`, `cta.js`, `scroll_v1.js`, `amplitude_v261.js`)
- Are there **analytics**, **SEO**, or **deep-link** implications?

Share a concise summary with the user — focus on what matters for product decisions, not file dumps.

## Phase 2: Interactive Discovery

For each section: propose a draft based on code exploration, ask targeted questions, iterate until confirmed. Use `AskUserQuestion` for choices/confirmations; conversational prompts for open-ended input.

### Group 1: Context + Open Questions

- **Context** — What problem are we solving? How does the site currently behave? Which page or flow is affected?
- **Open questions** — Scope decisions, product behaviour, edge cases. Examples: "Does this need cookie consent?", "Should the download require email capture first?", "Is this Spanish-only or do we ship a translation?"

### Group 2: User Story + Out of Scope

- **User story** — Single-sentence statement of the desired outcome from the visitor's perspective ("As a visitor on a song page, I want…").
- **Out of scope** — Things explicitly excluded. Examples: "no English version", "no schema.org markup in this story", "no Spotify deep-link change".

### Group 3: Solution

Describe WHAT will change from the visitor/system perspective. Reference Jekyll-specific decisions:

- Reuse an existing layout/include vs. add a new one (and why).
- Drive behaviour from front matter vs. hard-code in the layout.
- Static-only vs. needing client-side JS.
- Tracker/event impact (new events, new UTM fields, new conversion).

### Group 4: Technical Details

Break the implementation down by area:

- **Content** — new pages or collections; front matter shape; URLs/permalinks; sitemap inclusion.
- **Layouts / Includes** — new or modified files; parameter contracts; backwards compatibility for existing callers.
- **Styling** — which `_sass/` partial(s); new variables; mobile-first behaviour at the project's breakpoints.
- **JavaScript** — which file(s); new helpers vs. extending existing modules; vendor-version bumps.
- **Analytics & SEO** — new events (PascalCase), new `seo_*` front matter fields, deep-link metadata, sitemap exclusions.
- **Assets** — new images (with full responsive variants), audio/video, fonts.
- **Forms / Privacy** — privacy checkbox + honeypot present; new `form_id`; consent gating.

Reference specific files. Be concrete enough that an engineer can start typing.

### Group 5: Testing Strategy

Static-site testing is mostly manual + visual. Cover:

- **Local build** — `bundle exec jekyll build` runs cleanly with no Liquid warnings; `bundle exec jekyll serve` for local check.
- **Layout / breakpoint walk-through** — verify at thin (360), mobile (576), tablet (768), desktop (1280).
- **SEO verification** — view-source → confirm `og:*`, `twitter:*`, canonical, deep-link `al:*` tags render correctly.
- **Sitemap** — `/sitemap.xml` includes (or excludes) the right pages.
- **Analytics smoke test** — events fire in dev with `environment === "devel"`; consent gating respected.
- **Form smoke test** — submit valid + invalid + honeypot; check spinner, error messaging, success redirect.
- **Cross-browser** — at minimum Chrome and Safari (mobile + desktop).

### Optional: Rollback Strategy

Only if the change is risky (e.g. analytics rewiring, signup API change, redirect/path change that breaks bookmarks). Otherwise omit the section.

## Phase 3: Compose and Save the Plan

### 3.1 Generate the description

Compose the full description using this exact format:

```markdown
## Context

[Context text]

### Open questions

[Bullet list of unresolved questions, or "No open questions." if all resolved]

---

## User Story

[High-level description of the desired outcome from the visitor's perspective]

### Out of scope

[Bullet list of excluded items]

---

## Solution

[The confirmed solution approach, in Jekyll terms]

---

## Technical Details

[The confirmed technical breakdown, by area]

---

## Testing Strategy

[The confirmed testing plan]

### Rollback Strategy

[Only if applicable — otherwise omit this section entirely]
```

### 3.2 Preview and iterate

Show the full composed description to the user. Ask: "Does this look good, or do you want to change anything?" Iterate until approved.

### 3.3 Save the plan

Save the plan as `.claude/plans/YYYY-MM-DD-<slug>.md`. Create the `.claude/plans/` directory if it doesn't exist. Share the path with the user so it can be handed off to Claude Code for implementation.

## Key Principles

- **Write the plan in English.** Conversation with the user can be in any language they prefer; the saved plan is in English.
- **Be concrete about Jekyll surfaces.** Always name the layout, include, collection, SCSS partial, or JS file that will change.
- **Propose, don't just ask.** Draft a Jekyll-shaped answer first; let the user confirm or correct.
- **Respect constraints.** GitHub Pages: no custom plugins beyond `jekyll-feed`/`jekyll-sitemap`, no server-side code. If the user asks for something that requires a backend, say so up front.
- **Validate drafts against code.** Verify any proposal against the actual `_layouts/`, `_includes/`, and content paths before committing to it.
- **Concise summaries.** When sharing exploration findings, summarise what matters for the story — don't paste large files.
