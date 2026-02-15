# Speakers Flyer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a print-ready 8.5x11 speakers flyer (`flyer_speakers.html`) that showcases all 8 confirmed speakers in a 2x4 circular headshot grid, matching the community/warm style of `flyer.html`.

**Architecture:** Single self-contained HTML file with inline CSS. Copy `flyer.html` as the base, replace the tracks/features content section with a speakers grid, update the hero subtitle to "Meet the Speakers". Reuse the hero, details strip, footer, and all CSS variables/media queries unchanged.

**Tech Stack:** HTML, CSS (inline), Google Fonts (Libre Baskerville + Source Sans 3)

---

## Design Reference

- **Distribution:** Print (8.5x11)
- **Style:** Community/warm — cream background, serif display font, organic feel
- **Speaker layout:** 2 rows x 4 circular headshots with name + title beneath

## Speaker Data

| Name | Title | Photo |
|------|-------|-------|
| Benson Medina | Director of R&D, Hawaii County | benson_medina.jpeg |
| Michelle Dumais | Founder, Kealani Solutions | michelle_dumais.jpeg |
| Binil Chacko | Business Advisor, Hawaii SBDC / Founder, Empower Potential | binil_chacko.jpeg |
| Mathew Goldsborough | Founder & CEO, NimbleBrain | mathew_goldsborough.png |
| Ratna Amin | Owner, Infragarden | ratna_amin.jpeg |
| Evan Mendenhall | Founder, Professional AI Agents LLC | evan_mendenhall.jpeg |
| Tracie Foglia | Hawaii Employers Council | tracie_foglia.jpeg |
| Paul Dumais | Co-Founder & CTO, Abra Hospitality Inc | paul_dumais.jpeg |

---

### Task 1: Copy flyer.html as base and update title/subtitle

**Files:**
- Create: `flyer_speakers.html` (copy of `flyer.html`)

**Step 1: Copy the file**

```bash
cp flyer.html flyer_speakers.html
```

**Step 2: Update the HTML `<title>` tag**

Change line 7 from:
```html
<title>Hawaii Island AI Summit 2026 - Community Flyer</title>
```
to:
```html
<title>Hawaii Island AI Summit 2026 - Speakers Flyer</title>
```

**Step 3: Update the hero subtitle**

Change the `.hero-subtitle` text from:
```html
<p class="hero-subtitle">For Community Builders & Small Businesses</p>
```
to:
```html
<p class="hero-subtitle">Meet the Speakers</p>
```

**Step 4: Verify in browser**

Run: `open flyer_speakers.html` (or Python http server)
Expected: Flyer loads, hero shows "Meet the Speakers" in gold text, everything else identical to flyer.html

**Step 5: Commit**

```bash
git add flyer_speakers.html
git commit -m "feat: scaffold speakers flyer from community flyer base"
```

---

### Task 2: Replace content section with speakers grid CSS

**Files:**
- Modify: `flyer_speakers.html` (CSS section, lines ~187-298)

**Step 1: Remove tracks/features/welcome CSS**

In the `<style>` block, remove the CSS rules for these classes (lines ~187-298):
- `.features`, `.feature`, `.feature-icon`, `.feature-icon svg`, `.feature-text`
- `.tracks`, `.tracks-header`, `.tracks-grid`, `.track`, `.track.builders`, `.track.leaders`, `.track-name`, `.track-desc`
- `.welcome-message`, `.welcome-text`, `.welcome-text::before`, `.welcome-text::after`

**Step 2: Add speakers grid CSS**

Replace the removed CSS with:

```css
/* ========================================
   Speakers Grid
   ======================================== */
.speakers-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25in;
}

.speakers-header {
  font-family: var(--font-display);
  font-size: 0.36in;
  font-weight: 700;
  color: var(--color-teal);
  text-align: center;
}

.speakers-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.3in 0.25in;
  width: 100%;
}

.speaker-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.speaker-photo {
  width: 1.1in;
  height: 1.1in;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-teal);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.1in;
}

.speaker-name {
  font-family: var(--font-body);
  font-size: 0.16in;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 0.03in;
}

.speaker-title {
  font-family: var(--font-body);
  font-size: 0.11in;
  font-weight: 400;
  color: var(--color-warm-gray);
  line-height: 1.35;
  max-width: 1.5in;
}

/* Welcome Message */
.welcome-message {
  text-align: center;
  padding: 0.08in 0.3in 0;
}

.welcome-text {
  font-family: var(--font-display);
  font-size: 0.2in;
  font-style: italic;
  color: var(--color-teal);
  position: relative;
  display: inline-block;
}

.welcome-text::before,
.welcome-text::after {
  content: "\2726";
  font-style: normal;
  margin: 0 0.15in;
  opacity: 0.5;
}
```

**Step 3: Verify CSS compiles**

Open in browser. Content section will still show old HTML but new CSS should not cause errors.

---

### Task 3: Replace content section HTML with speakers grid

**Files:**
- Modify: `flyer_speakers.html` (HTML content, lines ~513-577)

**Step 1: Replace the `<main class="content">` inner HTML**

Remove everything inside `<main class="content">...</main>` (the features, tracks, and welcome message HTML) and replace with:

```html
    <!-- Main Content -->
    <main class="content">
      <!-- Speakers -->
      <div class="speakers-section">
        <h2 class="speakers-header">Your Speakers</h2>
        <div class="speakers-grid">
          <div class="speaker-card">
            <img src="images/speakers/benson_medina.jpeg" alt="Benson Medina" class="speaker-photo">
            <div class="speaker-name">Benson Medina</div>
            <div class="speaker-title">Director of R&D, Hawaii County</div>
          </div>
          <div class="speaker-card">
            <img src="images/speakers/michelle_dumais.jpeg" alt="Michelle Dumais" class="speaker-photo">
            <div class="speaker-name">Michelle Dumais</div>
            <div class="speaker-title">Founder, Kealani Solutions</div>
          </div>
          <div class="speaker-card">
            <img src="images/speakers/binil_chacko.jpeg" alt="Binil Chacko" class="speaker-photo">
            <div class="speaker-name">Binil Chacko</div>
            <div class="speaker-title">Business Advisor, Hawaii SBDC / Founder, Empower Potential</div>
          </div>
          <div class="speaker-card">
            <img src="images/speakers/mathew_goldsborough.png" alt="Mathew Goldsborough" class="speaker-photo">
            <div class="speaker-name">Mathew Goldsborough</div>
            <div class="speaker-title">Founder & CEO, NimbleBrain</div>
          </div>
          <div class="speaker-card">
            <img src="images/speakers/ratna_amin.jpeg" alt="Ratna Amin" class="speaker-photo">
            <div class="speaker-name">Ratna Amin</div>
            <div class="speaker-title">Owner, Infragarden</div>
          </div>
          <div class="speaker-card">
            <img src="images/speakers/evan_mendenhall.jpeg" alt="Evan Mendenhall" class="speaker-photo">
            <div class="speaker-name">Evan Mendenhall</div>
            <div class="speaker-title">Founder, Professional AI Agents LLC</div>
          </div>
          <div class="speaker-card">
            <img src="images/speakers/tracie_foglia.jpeg" alt="Tracie Foglia" class="speaker-photo">
            <div class="speaker-name">Tracie Foglia</div>
            <div class="speaker-title">Hawaii Employers Council</div>
          </div>
          <div class="speaker-card">
            <img src="images/speakers/paul_dumais.jpeg" alt="Paul Dumais" class="speaker-photo">
            <div class="speaker-name">Paul Dumais</div>
            <div class="speaker-title">Co-Founder & CTO, Abra Hospitality Inc</div>
          </div>
        </div>
      </div>

      <!-- Welcome Message -->
      <div class="welcome-message">
        <p class="welcome-text">No tech background required—just a curiosity to learn.</p>
      </div>
    </main>
```

**Step 2: Verify in browser**

Open `flyer_speakers.html` in browser.
Expected: 2x4 grid of circular speaker photos with names and titles, all fitting within the content area between the details strip and footer.

**Step 3: Commit**

```bash
git add flyer_speakers.html
git commit -m "feat: add speakers grid with 8 speakers to flyer"
```

---

### Task 4: Visual polish and spacing tuning

**Files:**
- Modify: `flyer_speakers.html`

**Step 1: Open in browser and check print preview**

Run: `open flyer_speakers.html`
Then Cmd+P to check print preview at 8.5x11.

**Step 2: Tune spacing if needed**

Check these potential issues and adjust CSS values:
- **Content overflow:** If the speakers grid + footer exceeds 11in, reduce `.speaker-photo` from 1.1in to 1.0in, reduce `.speakers-grid` gap from 0.3in to 0.25in
- **Too much whitespace:** If there's a big gap, increase `.speaker-photo` size or add more gap
- **Long titles wrapping badly:** Binil Chacko's title is the longest. Verify it wraps to 2 lines max within the 1.5in `max-width`
- **Michelle Dumais photo:** Uses `speaker-photo-zoomed` class on index.html — may need `object-position` adjustment if framing is off

**Step 3: Commit if changes were made**

```bash
git add flyer_speakers.html
git commit -m "fix: tune speaker flyer spacing for print layout"
```

---

### Task 5: Final verification and cleanup

**Files:**
- Verify: `flyer_speakers.html`

**Step 1: Cross-check all 8 speaker photos load**

Open in browser, verify no broken images. All photos are in `images/speakers/`:
- benson_medina.jpeg
- michelle_dumais.jpeg
- binil_chacko.jpeg
- mathew_goldsborough.png (note: .png not .jpeg)
- ratna_amin.jpeg
- evan_mendenhall.jpeg
- tracie_foglia.jpeg
- paul_dumais.jpeg

**Step 2: Check print preview**

Cmd+P in browser. Verify:
- Fits exactly on one 8.5x11 page
- No content cut off at bottom
- Colors render correctly (backgrounds, teal border on photos)
- All speaker photos circular and properly cropped
- Footer logos visible
- QR code sharp

**Step 3: Compare side-by-side with flyer.html**

Open both files in browser tabs. Verify:
- Same hero section (except subtitle text)
- Same details strip
- Same footer
- Speakers flyer feels like part of the same family

**Step 4: Final commit if any cleanup needed**

```bash
git add flyer_speakers.html
git commit -m "chore: final polish on speakers flyer"
```
