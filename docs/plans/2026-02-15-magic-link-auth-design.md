# Magic Link Authentication with Firebase + Luma Verification

**Date:** 2026-02-15
**Status:** Approved

## Problem

Registered attendees (via Luma) need access to a private section of hawaiiaisummit.com for event materials, detailed schedules, and attendee networking. Luma has no OAuth/SSO, so we need our own auth that verifies registration.

## Solution

Firebase Auth magic link authentication, gated by Luma guest list verification via a Netlify Function.

## Auth Flow

```
1. User visits /login and enters email
2. Frontend calls Netlify Function: POST /api/check-registration { email }
3. Function calls Luma API: GET /v1/event/get-guests (filtered by email)
4. If registered & approved → function returns { registered: true }
5. Frontend calls Firebase: sendSignInLinkToEmail(email, actionCodeSettings)
   - actionCodeSettings.url = "https://hawaiiaisummit.com/portal"
6. Firebase sends magic link email to user
7. User clicks link → arrives at /portal with Firebase sign-in parameters
8. portal.html calls Firebase: isSignInWithEmailLink(window.location.href)
   - Completes sign-in → user has Firebase Auth session
9. Portal content renders
10. Optional: user clicks "Set Password" → Firebase linkWithCredential
```

## Components

### login.html (new)
- Email input form matching existing site styling (dark theme, teal/coral accents)
- States: idle, checking registration, sending link, link sent, not registered, error
- Stores email in localStorage before sending (Firebase requires it on return)
- Links back to index.html

### portal.html (new)
- Firebase Auth state listener on page load
- Magic link completion if arriving via email link
- Redirect to /login if no session
- Placeholder sections for: materials, schedule, attendee directory
- "Set Password" optional form using Firebase linkWithCredential
- Logout button
- Styled consistently with existing site

### netlify/functions/check-registration.js (new)
- POST handler, receives { email }
- Calls Luma API with x-luma-api-key header
- Filters guest list for matching email with approved status
- Returns { registered: true/false }
- Environment variables: LUMA_API_KEY, LUMA_EVENT_ID

### netlify.toml (modify)
- Add [functions] directory = "netlify/functions"

### index.html (modify)
- Add "Attendee Login" link in footer area

### package.json (new, minimal)
- Only needed if Netlify Function requires dependencies (node-fetch for Node <18)
- Netlify Functions on Node 18+ have native fetch, so may not be needed

## Session Strategy
- Firebase Auth persistence: LOCAL (survives browser close)
- Tokens auto-refresh silently
- No server-side session validation (nothing sensitive behind gate)
- Logout clears Firebase session

## Environment Variables (Netlify Dashboard)
- `LUMA_API_KEY` - Luma API key (requires Luma Plus subscription)
- `LUMA_EVENT_ID` - Event ID: evt-JXQsDO3ZPfpk7sS

## Firebase Config (public, embedded in HTML)
- apiKey, authDomain, projectId from Firebase Console
- Email Link sign-in method enabled in Firebase Console

## Security Notes
- Luma API key stays server-side in Netlify Function
- Firebase config is designed to be public (security rules enforce access)
- No sensitive data behind the auth gate (long-lived sessions acceptable)
- Rate limiting provided by Netlify Functions (125K/month free) and Luma API (300/min)

## Not Included
- Server-side session validation
- Custom email templates (use Firebase defaults, customizable via console)
- Database beyond Firebase Auth user records
- Admin panel for managing access
