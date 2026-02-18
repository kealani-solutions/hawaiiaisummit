# Retractable Banner Design — 33" x 81"

## Overview

Tall retractable banner for Hawaii Island AI Summit. Designed for wayfinding/attraction at venue entrance. Year-agnostic for reuse.

## Dimensions

- **Trim size:** 33" x 81"
- **Bleed:** Add 0.25" on all sides if required by printer (not included in SVG)
- **Safe zone:** Keep critical content 1.5" from trim edges
- **Note:** Bottom 3–4" may be hidden by retractable base — only circuit texture there

## File

`banner-33x81.svg` in project root. References `images/logos/event_logo.png` via relative path.

**For print production:** Either keep the SVG alongside the `images/` folder, or replace the `<image>` tag's `href` with a base64-encoded version of the logo. Text uses Inter font — convert to outlines before sending to printer if they don't have the font.

## Layout (top to bottom)

| Zone | Position | Content |
|------|----------|---------|
| Signal waves | 12"–27" from top | Oversized teal→gold gradient arcs (3 concentric quarter-circle arcs radiating upper-right from origin point). Soft glow behind origin. |
| Logo | 34"–48" from top | `event_logo.png` embedded at full width with 2" side padding. White text + signal waves icon on dark bg. |
| Divider | 52" from top | Thin teal line, 35% opacity |
| Location | 56.5" from top | "Hilo, Hawai'i" — Inter Light, 1.3" size, white, tracked |
| Website | 63" from top | "hawaiiaisummit.com" — Inter Regular, 0.9" size, white, 75% opacity |
| Circuit texture | 66"–81" from top | Subtle circuit board traces fading in from transparent, teal at 10% opacity |

## Colors

- **Background:** `#0A0A0A` with subtle radial gradient (`#0F2428` center)
- **Arc 1 (inner):** `#00E5F5` (bright teal)
- **Arc 2 (middle):** `#4DAE8A` (teal-green)
- **Arc 3 (outer):** `#C8963E` (gold/amber)
- **Text:** `#FFFFFF`
- **Divider/circuit:** `#00D4E8` at low opacity

## Typography

- **Font:** Inter (Google Fonts, matches website)
- **Location:** Inter Light (weight 300), letter-spacing +14 units
- **Website:** Inter Regular (weight 400), letter-spacing +6 units

## Design Rationale

- **Oversized signal waves** at top create instant brand recognition from across a room — the teal-to-gold gradient arcs are the summit's most distinctive visual element
- **Dark background** matches the website's dark theme and gives a premium tech feel
- **No year or date** makes the banner reusable annually
- **Generous vertical spacing** ensures readability on the tall narrow format — each zone has clear breathing room
- **Circuit texture** at bottom adds depth and tech atmosphere without competing with primary elements
- **Logo PNG embedded directly** — no risk of font mismatch or re-interpretation of the logo text

## Optional Enhancements

- Add the old turtle/Big Island emblem as very faint watermark in a corner (~3–5% opacity)
- Add a QR code above the website URL for quick mobile access
- Add sponsor logos in a strip above the circuit pattern zone
