# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static landing page for the Hawaii Island AI Summit 2026, hosted on Netlify.

- **Site URL:** https://hawaiiaisummit.com
- **Event:** March 12, 2026 at Arc of Hilo, Hawaii
- **Contact:** hawaiiaisummit@kealanisolutions.com

## Development

This is a single-page static HTML site with no build step.

```bash
# Run locally with Python
python -m http.server 8000

# Or with Node.js
npx serve
```

Open http://localhost:8000 to view.

## Architecture

**Single-file structure:** All HTML, CSS, and JavaScript are in `index.html`:
- CSS in `<style>` block (lines ~87-950)
- HTML content (lines ~950-1340)
- JavaScript at bottom in `<script>` block (countdown timer, FAQ accordion, scroll animations, form handling)

**Forms:** Two email signup forms (hero and footer) use Netlify Forms with AJAX submission. Forms are handled via JavaScript that intercepts submit, posts to Netlify, and shows inline success message.

**Assets:**
- `images/logos/` - Sponsor and site logos
- `images/backgrounds/` - Hero section backgrounds
- `images/venue/` - Venue photos
- `summit.ics` - Calendar invite file

## Key Integrations

- **Netlify Forms:** Email signups (hero-signup, footer-signup)
- **Google Fonts:** Inter font family
- **Schema.org:** Event structured data for SEO

## Design Tokens

CSS custom properties in `:root`:
- `--color-primary: #006877` (teal)
- `--color-secondary: #FF7F50` (coral)
- `--color-white: #F9FBFB`
- `--color-dark: #2D3132`
