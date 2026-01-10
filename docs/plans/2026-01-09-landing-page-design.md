# Hawaii Island AI Summit — Landing Page Design

**Date:** January 9, 2026
**Status:** Approved
**Target Launch:** January 9, 2026

---

## Overview

A bold, energetic Save the Date landing page for the Hawaii Island AI Summit (March 12, 2026). The primary goal is email capture before full registration opens on Luma.

### Design Principles
- **Bold & Energetic** — Large typography, vibrant gradients, high visual impact
- **Simple Tech Stack** — Pure HTML/CSS/vanilla JS, no build step
- **Netlify-First** — Forms, hosting, and deployment aligned with Netlify best practices

---

## Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary | Deep Ocean Teal | `#006877` |
| Secondary | Sunset Coral | `#FF7F50` |
| Accent Light | Clean White | `#F9FBFB` |
| Accent Dark | Dark Charcoal | `#2D3132` |

---

## Page Structure

```
1. Hero (full viewport, animated gradient background)
2. Value Proposition (4 benefit cards)
3. Dual Track Overview (Builders / Leaders)
4. Agenda Timeline
5. Venue Section (with photos + map)
6. Get Involved (Speakers / Sponsors / Volunteers)
7. FAQ (accordion)
8. Footer (logos + secondary email form)
```

---

## Section Details

### 1. Hero Section

**Background:** Full-viewport animated flowing gradient (teal → coral). CSS-only animation using `@keyframes` to shift background positions — ocean wave effect.

**Content (centered stack):**
- Tagline: "Leadership & Builders" (small caps, coral)
- Headline: "HAWAII ISLAND AI SUMMIT" (large, bold, white)
- Date/Location: "March 12, 2026 • Arc of Hilo"
- Countdown Timer: 4 boxes (Days | Hours | Minutes | Seconds)
- Email Form: Single field + "Save My Spot" button (coral)
- Add to Calendar: Google / Apple / Outlook links
- Scroll indicator at bottom

### 2. Value Proposition

**Background:** White

**Content:**
- Tagline quote: "Join Hawaii's tech and business community for a day of hands-on workshops, inspiring conversations, and meaningful connections."
- 4 benefit cards (horizontal row, 2x2 on mobile):
  - Hands-On Workshops
  - Local Connections
  - Practical AI Skills
  - Island Style

Cards use teal SVG line icons, subtle shadow on hover.

### 3. Dual Track Overview

**Background:** Dark charcoal (`#2D3132`)

**Header:** "Choose Your Track"

**Content:** Two large cards side by side:

| BUILDERS TRACK | LEADERS TRACK |
|----------------|---------------|
| Teal accent border | Coral accent border |
| For developers, engineers, creators | For business owners, managers, decision-makers |
| Workshop: Agentic AI — Automation, agents, and making it real | Workshop: Responsible AI — Policies, security, and safeguards |

Gradient glow on hover matching accent color.

### 4. Agenda Timeline

**Background:** White

**Header:** "Your Day at the Summit"

**Layout:** Vertical timeline, alternating left/right (single column on mobile)

**Schedule:**
- 11:00 AM — Doors Open + Blessing + Networking
- 11:30 AM — Keynote Presentations
- 12:15 PM — Lunch (local kine food)
- 1:00 PM — Workshop Sessions (2 tracks)
- 3:00 PM — Talk Story Panel: AI & Future of Work
- 4:00 PM — Pau Hana Networking

Vertical connecting line with teal dots. Fade-in on scroll.

### 5. Venue Section

**Layout:** Full-width hero image (Arc of Hilo exterior) with dark overlay

**Overlay Content:**
- "The Venue" header
- "Arc of Hilo" (large)
- Address + brief description
- Static map or embedded Google Map link

**Below:** Gallery strip of 2-3 venue photos (interior, garden)

### 6. Get Involved

**Background:** Teal

**Header:** "Get Involved"

**Content:** Three cards:

| Become a Speaker | Become a Sponsor | Volunteer |
|------------------|------------------|-----------|
| Microphone icon | Handshake icon | Heart icon |
| Description text | Description text | Description text |
| "Learn More" button | "Learn More" button | "Learn More" button |

Buttons open mailto links for this phase.

### 7. FAQ

**Background:** Light gray (`#F9FBFB`)

**Header:** "Questions?"

**Content:** Accordion with 5 questions:
- Who should attend?
- How much does it cost?
- When does registration open?
- Is parking available?
- What should I bring?

Vanilla JS toggle, smooth expand/collapse animation.

### 8. Footer

**Background:** Dark charcoal (`#2D3132`)

**Content:**
- Organizer logos row (grayscale/white): Kealani Solutions, HWIT, Hawaii Center for AI, Big Island Tech Meetup, Nimble Brain, Arc of Hilo
- Secondary email signup: "Don't miss out. Save your spot."
- Hawaiian phrase: *Ma ka hana ka ʻike* — Learn by doing
- Copyright 2026

---

## Technical Implementation

### File Structure
```
/
├── index.html          # Single HTML file with embedded CSS/JS
├── images/
│   ├── logos/          # Organizer/partner logos
│   ├── venue/          # Arc of Hilo photos
│   └── backgrounds/    # Landscape photos
└── summit.ics          # Calendar file for download
```

### Tech Stack
| Aspect | Approach |
|--------|----------|
| HTML | Semantic HTML5, single file |
| CSS | Embedded in `<style>`, custom properties, flexbox/grid |
| JS | Embedded in `<script>`, vanilla only |
| Animation | CSS `@keyframes` for gradient, Intersection Observer for scroll |
| Countdown | ~20 lines JS, updates every second |
| Form | Netlify Forms (`data-netlify="true"` attribute) |
| Calendar | Generated .ics file + Google Calendar URL |

### Netlify Configuration
- No build command needed (static HTML)
- Form submissions stored in Netlify dashboard
- Auto-deploy on git push

### Responsive Breakpoints
- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

---

## Assets

### Logos Available
- Kealani Solutions (white)
- HWIT (black)
- Hawaii Center for AI
- Big Island Tech
- Nimble Brain (white)
- Arc of Hilo (color)

### Venue Photos
- arc_of_hilo_outside.jpg
- arc_of_hilo_conference.jpg
- arc_of_hilo_garden.jpg
- arc_of_hilo_conference_line.jpg

### Landscape Photos (Unsplash)
- jake-houglum (rainbow coastline)
- micah-alameda (Waipio Valley)
- ian-stauffer
- jim-harris
- stephen-wiggins
- john-ko
- tell-death-i-m-busy

### Graphics
- AI_transparent_small.png (turtle/circuit graphic)

---

## Content Placeholders

The following content needs finalization:
- FAQ answers
- "Get Involved" mailto addresses or form links
- Venue address confirmation
- Any additional speaker/sponsor details

---

## Success Metrics

- Email signups captured
- Page load time < 2 seconds
- Mobile-friendly (passes Google Mobile Test)
- Accessible (WCAG 2.1 AA)
