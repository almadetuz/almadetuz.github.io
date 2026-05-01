# .claude/ — Claude Code Configuration

Configuration for Claude Code agents working on www.almadetuz.com — a Jekyll static site hosted on GitHub Pages.

## Project at a glance

- **Generator**: Jekyll via the `github-pages` gem (no custom plugins beyond `jekyll-feed`, `jekyll-sitemap`)
- **CSS**: Bootstrap 5.3.3 + Bootstrap Icons 1.13.1 + custom SASS in `_sass/`
- **JS**: Bootstrap bundle, Axios, Amplitude (analytics-browser), custom modules in `assets/js/`
- **Languages**: Spanish (`es_ES`) — UI copy is in Spanish
- **Deployment**: Push to `main` → GitHub Pages builds automatically

For full project context see [`CLAUDE.md`](../CLAUDE.md) (repo root) and [`_docs/`](../_docs/) (architecture docs).

## Structure

```
.claude/
├── README.md                        # This file
├── agents/
│   └── architecture-checker.md      # Detects Jekyll/site-convention violations
├── commands/
│   ├── refine.md                    # Refine a user story with structured codebase discovery
│   └── review-code.md               # Review pending Jekyll/HTML/SCSS/JS changes
└── rules/
    ├── code-styled.md               # Naming + formatting (Liquid, HTML, SCSS, JS, Markdown)
    ├── security.md                  # Secrets, XSS, deep links, form/cookie compliance
    └── jekyll/
        ├── frontmatter.md           # Required front matter per layout
        ├── layouts-and-includes.md  # When to use which layout / how to write includes
        ├── liquid.md                # Liquid templating do's and don'ts
        ├── assets.md                # Responsive images, SASS, JS bundling rules
        ├── analytics.md             # UTM persistence + event naming
        ├── seo.md                   # SEO/Open Graph/deep-link metadata
        └── forms.md                 # Form IDs, honeypot, privacy, signup flow
```

## Agents

| Agent | Purpose | Invoke when |
| --- | --- | --- |
| `architecture-checker` | Detect convention/layout/SEO/asset violations across Liquid, HTML, SCSS and JS | PR review, after touching `_layouts/`, `_includes/`, content collections, or assets |

Example invocations: "Check architecture of the new download page" / "Find Jekyll violations in this PR" / "Validate front matter in `cartas/dentro/`".

## Commands

Slash commands available in Claude Code (`/command-name`):

| Command | Description |
| --- | --- |
| `/refine` | Refine a user story with structured codebase discovery; saves a plan to `.claude/plans/YYYY-MM-DD-<name>.md` |
| `/review-code` | Review pending changes (staged + unstaged) against Jekyll conventions and project rules |

## Rules

Rules in `rules/` are loaded by Claude Code based on the `paths:` glob in their front matter. Rules in `rules/jekyll/` are detailed topic guides referenced by the `architecture-checker` agent and by `/review-code`.

When adding a new rule:

1. Put global rules (apply across the whole project) directly in `rules/`.
2. Put Jekyll-specific topic guides in `rules/jekyll/`.
3. Reference each new rule from this README and from `architecture-checker.md` if it is checkable.
