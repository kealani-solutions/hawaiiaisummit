#!/usr/bin/env node
/**
 * One-time script: Seed Firebase with Luma track preferences.
 *
 * For each approved Luma attendee who selected a track (builders/leaders):
 *   1. Find or create a Firebase Auth user by email
 *   2. Write track to `users/{uid}` (merge)
 *   3. Write track to `trackSelections/{sanitizedEmail}` (merge)
 *
 * Attendees with no track preference (undecided) are skipped.
 *
 * Usage:
 *   node scripts/seed-tracks.js [--dry-run]
 *
 * Requires:
 *   - LUMA_API_KEY and LUMA_EVENT_ID env vars (via `netlify env:get` or export)
 *   - Firebase service account key at /tmp/firebase-adminsdk-key.json
 */

const admin = require('firebase-admin');

// ── Config ──────────────────────────────────────
const SERVICE_ACCOUNT_PATH = '/tmp/firebase-adminsdk-key.json';
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  // Get env vars via netlify CLI if not already set
  const LUMA_API_KEY = process.env.LUMA_API_KEY || (await shellExec('netlify env:get LUMA_API_KEY')).trim();
  const LUMA_EVENT_ID = process.env.LUMA_EVENT_ID || (await shellExec('netlify env:get LUMA_EVENT_ID')).trim();

  if (!LUMA_API_KEY || !LUMA_EVENT_ID) {
    console.error('Missing LUMA_API_KEY or LUMA_EVENT_ID');
    process.exit(1);
  }

  // Init Firebase Admin
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const db = admin.firestore();
  const auth = admin.auth();

  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== LIVE RUN ===');

  // ── Fetch all approved guests from Luma ──
  console.log('Fetching attendees from Luma...');
  const allGuests = [];
  let nextCursor = null;
  const baseUrl = `https://api.lu.ma/public/v1/event/get-guests?event_api_id=${LUMA_EVENT_ID}&approval_status=approved`;

  do {
    const url = nextCursor ? `${baseUrl}&pagination_cursor=${nextCursor}` : baseUrl;
    const res = await fetch(url, {
      headers: { 'x-luma-api-key': LUMA_API_KEY },
    });
    if (!res.ok) throw new Error(`Luma API error: ${res.status}`);
    const data = await res.json();

    for (const entry of data.entries || []) {
      const g = entry.guest || {};
      const answers = g.registration_answers || [];
      const trackAnswer = answers.find((a) => a.question_id === 'c1bz86b5');
      let lumaTrack = null;
      if (trackAnswer) {
        const val = trackAnswer.value || '';
        if (val.startsWith('Builders')) lumaTrack = 'builders';
        else if (val.startsWith('Leaders')) lumaTrack = 'leaders';
      }

      allGuests.push({
        name: g.name || g.user_name || [g.user_first_name, g.user_last_name].filter(Boolean).join(' ') || '',
        firstName: g.user_first_name || '',
        lastName: g.user_last_name || '',
        email: (g.email || g.user_email || '').toLowerCase(),
        lumaTrack,
      });
    }
    nextCursor = data.next_cursor;
  } while (nextCursor);

  console.log(`Found ${allGuests.length} total attendees`);

  // Filter to those with a track preference
  const withTrack = allGuests.filter((g) => g.lumaTrack && g.email);
  const skipped = allGuests.filter((g) => !g.lumaTrack);
  console.log(`${withTrack.length} have a track preference, ${skipped.length} undecided/skipped`);

  // ── Process each attendee ──
  let created = 0;
  let updated = 0;
  let alreadySet = 0;
  let errors = 0;

  for (const guest of withTrack) {
    try {
      // Find or create Firebase Auth user
      let uid;
      try {
        const userRecord = await auth.getUserByEmail(guest.email);
        uid = userRecord.uid;
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          if (DRY_RUN) {
            console.log(`  [DRY] Would create auth user: ${guest.email}`);
            uid = `dry-run-${guest.email}`;
          } else {
            const newUser = await auth.createUser({
              email: guest.email,
              displayName: guest.name || undefined,
            });
            uid = newUser.uid;
            console.log(`  Created auth user: ${guest.email} (${uid})`);
            created++;
          }
        } else {
          throw err;
        }
      }

      // Check if track is already set in Firestore
      const sanitizedEmail = guest.email.replace(/[.@]/g, '_');

      if (!DRY_RUN) {
        const trackDoc = await db.collection('trackSelections').doc(sanitizedEmail).get();
        if (trackDoc.exists && trackDoc.data().track) {
          console.log(`  Already has track: ${guest.email} → ${trackDoc.data().track}`);
          alreadySet++;
          continue;
        }

        // Write to users/{uid}
        await db.collection('users').doc(uid).set({
          email: guest.email,
          name: guest.name || '',
          firstName: guest.firstName || '',
          lastName: guest.lastName || '',
          track: guest.lumaTrack,
          selectedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Write to trackSelections/{sanitizedEmail}
        await db.collection('trackSelections').doc(sanitizedEmail).set({
          email: guest.email,
          name: guest.name || '',
          track: guest.lumaTrack,
          selectedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        console.log(`  Set track: ${guest.email} → ${guest.lumaTrack}`);
        updated++;
      } else {
        console.log(`  [DRY] Would set track: ${guest.email} → ${guest.lumaTrack}`);
        updated++;
      }
    } catch (err) {
      console.error(`  ERROR (${guest.email}): ${err.message}`);
      errors++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Auth users created: ${created}`);
  console.log(`Tracks set: ${updated}`);
  console.log(`Already had track: ${alreadySet}`);
  console.log(`Errors: ${errors}`);
  console.log(`Skipped (undecided): ${skipped.length}`);

  process.exit(0);
}

function shellExec(cmd) {
  return new Promise((resolve, reject) => {
    require('child_process').exec(cmd, { cwd: __dirname + '/..' }, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
