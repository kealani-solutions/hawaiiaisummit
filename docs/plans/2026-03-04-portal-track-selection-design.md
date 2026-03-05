# Portal Track Selection — Design

**Date:** 2026-03-04

## Overview

Replace the portal's placeholder "Coming Soon" cards with a track selection feature. Attendees log in and choose either the Builders or Leaders track for the afternoon workshops.

## UX Flow

1. User arrives at `/portal` (via magic link in email or existing session)
2. Firebase Auth handles authentication (unchanged)
3. On auth success, check Firestore `users/{uid}` for existing track selection
4. **No selection yet:** Show two side-by-side track cards with session details, speaker photos, and "Select" buttons
5. **Already selected:** Show confirmation state with track name, session summary, and "Change selection" link

## Data Storage

- **Firestore collection:** `users`
- **Document ID:** Firebase Auth UID
- **Fields:** `email` (string), `track` ("builders" | "leaders"), `selectedAt` (timestamp)
- **Security rules:** Users can only read/write their own document (`request.auth.uid == userId`)

## What Changed

- Removed: Three placeholder "Coming Soon" cards (Event Schedule, Workshop Materials, Attendee Directory)
- Removed: Set-password section
- Added: Track selection cards with speaker/session data from sessions page
- Added: Confirmation state after selection
- Added: Firestore compat SDK script tag
- Added: `firestore.rules`, `firebase.json`, `.firebaserc` for rule deployment

## Technical Details

- No new Netlify functions — all client-side Firestore reads/writes
- Session data hardcoded in portal.html (same pattern as sessions.html)
- Firebase Firestore compat SDK v11.3.0 via CDN (matches existing auth SDK version)
