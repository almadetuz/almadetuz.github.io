---
name: cuaderno-instagram
description: Imports Amanda's Instagram posts (@amanda_tuz) into the Cuaderno blog at /cuaderno/ using Claude in Chrome. Lists the posts not seen yet, asks yes or no for each, then downloads text, images and videos, generates every variant and writes the Jekyll post. Use when the user says "importa los posts de Instagram", "trae los posts nuevos al cuaderno", "pasa este post de Instagram al blog", "cuaderno-instagram", or wants new Cuaderno entries from Instagram.
---

# Cuaderno from Instagram

Imports posts from https://www.instagram.com/amanda_tuz/ into `_posts/`. The deterministic work (list, decisions, caption cleanup, media, post file, registry) is done by `_scripts/cuaderno.js`. You drive Chrome and choose three things per post: title, slug and alt text.

Rules:
- Amanda's text is never rewritten. You never edit the caption the script writes into the post.
- Never commit or push. The user reviews on test.almadetuz.com and commits.
- Never call Instagram's `/api/` endpoints yourself and never retry in a loop: Instagram answers 429 and may flag the account. Read only what the page loads, through `.claude/skills/cuaderno-instagram/scan.js` and `.claude/skills/cuaderno-instagram/bundle.js`.
- The Chrome tool blocks any result that contains a signed CDN URL. Both snippets return data without URLs; do not change that.
- Run a snippet once per page load. To run it again, navigate to the page again first.
- Pass the answer, title and alt text to the shell in single quotes; write a `'` inside them as `'\''`.

## Setup

- Repo root is the working directory (`pwd` ends in `almadetuz.github.io`). Shell variables do not persist between Bash calls, so resolve two absolute paths once and write them literally into every later command and Write call, double-quoted in commands: `<SCRATCH>` is this session's scratchpad directory (given in your system prompt) and `<DL>` is the output of `xdg-user-dir DOWNLOAD` (run it once). Never use `$SCRATCH` or `$DL`.
- Load the Chrome tools in one ToolSearch call: `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__tabs_close_mcp,mcp__claude-in-chrome__list_connected_browsers,mcp__claude-in-chrome__select_browser`.
- Call `tabs_context_mcp`. If a tool reports several browsers and none selected, call `list_connected_browsers` and ask the user which one with AskUserQuestion; never pick one yourself. Create a new tab for this run.

## 1. Read the registry

Read `_data/cuaderno_instagram.yml`. Note `newest`, `oldest`, `backfill_done` and the shortcode of the first entry under `posts` (the newest listed post).

## 2. Scan the profile

1. Navigate the tab to `https://www.instagram.com/p/<newest shortcode>/`.
2. If the URL now contains `/accounts/login`, or a screenshot shows a login wall, stop and ask the user to log in to Instagram in that Chrome. Continue only when they say so.
3. Read `.claude/skills/cuaderno-instagram/scan.js`. In the `PARAMS` line below `// MAIN`, replace `__NEWEST__` and `__OLDEST__` with the registry dates (inside the existing quotes) and `__BACKFILL_DONE__` with `true` or `false`. Run the whole text with `javascript_tool`. It takes 10 to 100 seconds.
4. If it throws, show the error to the user and stop. Otherwise save the returned JSON string, unchanged, to `<SCRATCH>/scan.json` with the Write tool.

## 3. List and ask

1. Run `node _scripts/cuaderno.js list "<SCRATCH>/scan.json" "<SCRATCH>/list.json"`.
2. If it fails with "scan stopped before reaching the newest listed post", do step 2 once more. If it fails again, stop and report.
3. Paste its output to the user unchanged and ask: «¿Cuáles importo? Responde por ejemplo "sí 1,3; no 2". Las que no nombres quedan pendientes.» If the output is "No hay publicaciones nuevas.", do not ask; use an empty answer.
4. Run `node _scripts/cuaderno.js decide "<SCRATCH>/list.json" '<the user's answer, unchanged>'`. This saves the registry: "no" becomes `rejected`, everything else `pending`. If it rejects the answer, show the error and ask again.
5. It prints `{"import":[...]}`. An empty list means there is nothing to import: go to step 5.

## 4. Import each "sí"

For each shortcode `<code>` in the import list, in order:

1. Navigate to `https://www.instagram.com/p/<code>/` (a direct navigation: the post data is in the page only on a full load).
2. Read `.claude/skills/cuaderno-instagram/bundle.js` and run it unchanged with `javascript_tool`. It downloads `cuaderno-<code>.tar` and returns the media kinds and the size in bytes.
3. Check `ls "<DL>/cuaderno-<code>.tar"`. If it is not there yet, wait with Monitor (an until-loop on that file, at most 2 minutes). If it never appears, take a screenshot: Chrome may be asking to allow downloads from instagram.com. Ask the user to allow it, then navigate to the post again and repeat this step from 2.
4. Run `mkdir -p "<SCRATCH>/<code>" && tar -xf "<DL>/cuaderno-<code>.tar" -C "<SCRATCH>/<code>" && mv "<DL>/cuaderno-<code>.tar" "<SCRATCH>/"`.
5. Read `<SCRATCH>/<code>/caption.txt` and `<SCRATCH>/<code>/meta.json`. To look at the media, make a preview of the first image or poster, for example `convert "<SCRATCH>/<code>/1.webp" -resize 640x "<SCRATCH>/<code>/preview.jpg"`, and Read it.
6. Choose:
   - **Title**: Amanda's own words, usually the first sentence or the central idea of the caption. At most about 8 words, no emojis, no final period. Example: the first post's caption opens with an emoji and "Nuevos brotes.", so its title is "Nuevos brotes".
   - **Slug**: run `node _scripts/cuaderno.js slug '<title>'`.
   - **Alt**: one short sentence in Spanish describing what the images show (and where, if the caption says it). One alt text for all the images of the post.
7. Run `node _scripts/cuaderno.js import "<SCRATCH>/<code>" <slug> '<title>' '<alt>'`. It converts and resizes the images, crops the SEO image, transcodes videos, writes `_posts/<date>-<slug>.md` and marks the post `accepted` in the registry. Keep the JSON it prints (url, warnings).
8. If it fails, it has already removed what it created and the post stays `pending`. Note the error and go on with the next post. If the error says the slug is already used, choose a more specific title and run step 7 once more.

## 5. Verify

Run `node --test _tests/*.test.js && bundle exec jekyll build -q`. `_tests/cuaderno_content.test.js` checks the registry and every file each post references. If it fails because of an imported post, report it; do not hand-edit the post to make it pass.

## 6. Report

Close the tab with `tabs_close_mcp`. Answer in Spanish with one row per imported post: title, slug, `https://test.almadetuz.com/cuaderno/<slug>/`, and any warning (video over 8 MB) or failure. Then say how many posts stay pending and how many were rejected, and remind the user that nothing is committed.
