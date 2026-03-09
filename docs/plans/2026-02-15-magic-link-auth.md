# Magic Link Auth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add magic link authentication that verifies Luma event registration, creating a private attendee portal at /portal.

**Architecture:** Firebase Auth (compat SDK via CDN) handles magic link emails, session management, and optional password upgrade. A single Netlify Function checks the Luma API guest list before allowing sign-in. Frontend is vanilla HTML/JS matching the existing static site pattern.

**Tech Stack:** Firebase Auth (compat v11.x CDN), Netlify Functions (Node 18+), Luma REST API

**Design doc:** `docs/plans/2026-02-15-magic-link-auth-design.md`

---

## Prerequisites (Manual - Firebase Console)

Before starting implementation, the user must complete these steps in the Firebase/GCP console:

1. Go to https://console.firebase.google.com/ and create a new project (or use existing GCP project)
2. In the Firebase project, go to **Authentication > Sign-in method**
3. Enable **Email/Password** provider
4. Under Email/Password, also enable **Email link (passwordless sign-in)**
5. Go to **Authentication > Settings > Authorized domains** and add `hawaiiaisummit.com` and `localhost`
6. Go to **Project Settings > General** and note the Firebase config object (apiKey, authDomain, projectId, etc.)
7. In **Netlify Dashboard > Site settings > Environment variables**, add:
   - `LUMA_API_KEY` = your Luma API key (from Luma dashboard, requires Luma Plus)
   - `LUMA_EVENT_ID` = `evt-JXQsDO3ZPfpk7sS`

---

### Task 1: Netlify Function - Luma Registration Check

**Files:**
- Create: `netlify/functions/check-registration.js`
- Modify: `netlify.toml`

**Step 1: Create the functions directory**

```bash
mkdir -p netlify/functions
```

**Step 2: Write the Netlify Function**

Create `netlify/functions/check-registration.js`:

```javascript
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { email } = JSON.parse(event.body || '{}');
  if (!email) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email required' }) };
  }

  const LUMA_API_KEY = process.env.LUMA_API_KEY;
  const LUMA_EVENT_ID = process.env.LUMA_EVENT_ID;

  if (!LUMA_API_KEY || !LUMA_EVENT_ID) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  try {
    const url = `https://api.lu.ma/public/v1/event/get-guests?event_api_id=${LUMA_EVENT_ID}&approval_status=approved`;
    const response = await fetch(url, {
      headers: { 'x-luma-api-key': LUMA_API_KEY },
    });

    if (!response.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Failed to check registration' }) };
    }

    const data = await response.json();
    let found = false;

    // Check current page
    const guests = data.entries || [];
    found = guests.some((g) => g.guest?.email?.toLowerCase() === email.toLowerCase());

    // Paginate if needed
    let nextCursor = data.next_cursor;
    while (!found && nextCursor) {
      const nextUrl = `${url}&pagination_cursor=${nextCursor}`;
      const nextResponse = await fetch(nextUrl, {
        headers: { 'x-luma-api-key': LUMA_API_KEY },
      });
      if (!nextResponse.ok) break;
      const nextData = await nextResponse.json();
      const nextGuests = nextData.entries || [];
      found = nextGuests.some((g) => g.guest?.email?.toLowerCase() === email.toLowerCase());
      nextCursor = nextData.next_cursor;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ registered: found }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
```

**Step 3: Update `netlify.toml` to configure functions**

Add at the top of `netlify.toml`, inside the existing `[build]` section:

```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

**Step 4: Verify locally with Netlify CLI (optional)**

```bash
npx netlify-cli dev
# Then test: curl -X POST http://localhost:8888/.netlify/functions/check-registration -d '{"email":"test@example.com"}'
```

**Step 5: Commit**

```bash
git add netlify/functions/check-registration.js netlify.toml
git commit -m "feat: add Netlify Function for Luma guest registration check"
```

---

### Task 2: Login Page

**Files:**
- Create: `login.html`

**Step 1: Create `login.html`**

This page contains the email form, Luma registration check, and Firebase magic link sending. The Firebase config placeholder values (`YOUR_*`) must be replaced with actual values from Firebase Console (see Prerequisites).

CSS reuses the same custom properties and patterns from `index.html` (dark theme, teal/coral accents, Bebas Neue + Inter fonts, bold geometric style).

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attendee Login | Hawaii Island AI Summit 2026</title>
  <link rel="icon" type="image/png" href="images/logos/AI_transparent_small.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Bebas+Neue&family=Inter:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-primary: #00D4E8;
      --color-primary-dark: #006877;
      --color-secondary: #FF7F50;
      --color-secondary-light: #FF9A70;
      --color-accent: #FFD93D;
      --color-white: #FFFFFF;
      --color-dark: #0A0A0A;
      --color-gray: #0D1B1E;
      --font-display: 'Bebas Neue', 'Oswald', sans-serif;
      --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-family);
      color: var(--color-white);
      line-height: 1.6;
      background: var(--color-dark);
      font-weight: 600;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, #0A0A0A 0%, #0D1B1E 30%, #006877 70%, #FF7F50 100%);
      background-size: 400% 400%;
      animation: boldGradient 10s ease infinite;
    }

    @keyframes boldGradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .login-card {
      background: rgba(0, 0, 0, 0.6);
      border: 3px solid var(--color-primary);
      padding: 50px 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      backdrop-filter: blur(10px);
    }

    .login-card h1 {
      font-family: var(--font-display);
      font-size: 2.5rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 10px;
      text-shadow: 0 0 30px rgba(0, 212, 232, 0.5);
    }

    .login-card .subtitle {
      color: var(--color-primary);
      font-family: var(--font-display);
      font-size: 1.1rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 35px;
    }

    .form-group { margin-bottom: 20px; text-align: left; }

    .form-group label {
      display: block;
      font-family: var(--font-display);
      font-size: 0.95rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-accent);
      margin-bottom: 8px;
    }

    .form-group input {
      width: 100%;
      padding: 14px 16px;
      font-family: var(--font-family);
      font-size: 1rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(0, 212, 232, 0.4);
      color: var(--color-white);
      outline: none;
      transition: border-color 0.3s;
    }

    .form-group input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 15px rgba(0, 212, 232, 0.3);
    }

    .form-group input::placeholder { color: rgba(255, 255, 255, 0.4); }

    .btn-login {
      width: 100%;
      padding: 16px;
      font-family: var(--font-display);
      font-size: 1.2rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      border: none;
      cursor: pointer;
      background: var(--color-secondary);
      color: white;
      box-shadow: 0 0 25px rgba(255, 127, 80, 0.5);
      transition: all 0.3s ease;
    }

    .btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 40px rgba(255, 127, 80, 0.7);
      background: var(--color-secondary-light);
    }

    .btn-login:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .message {
      margin-top: 20px;
      padding: 14px;
      font-size: 0.95rem;
      display: none;
    }

    .message.success {
      display: block;
      background: rgba(0, 212, 232, 0.15);
      border: 2px solid var(--color-primary);
      color: var(--color-primary);
    }

    .message.error {
      display: block;
      background: rgba(255, 127, 80, 0.15);
      border: 2px solid var(--color-secondary);
      color: var(--color-secondary);
    }

    .back-link {
      display: inline-block;
      margin-top: 30px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
      transition: color 0.3s;
    }

    .back-link:hover { color: var(--color-primary); }

    .password-section {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: none;
    }

    .password-section .subtitle {
      font-size: 0.9rem;
      margin-bottom: 15px;
      color: rgba(255, 255, 255, 0.6);
      text-transform: none;
      letter-spacing: normal;
      font-family: var(--font-family);
    }

    .btn-alt {
      width: 100%;
      padding: 12px;
      font-family: var(--font-display);
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border: 2px solid var(--color-primary);
      cursor: pointer;
      background: transparent;
      color: var(--color-primary);
      transition: all 0.3s ease;
    }

    .btn-alt:hover {
      background: var(--color-primary);
      color: var(--color-dark);
    }

    @media (max-width: 500px) {
      .login-card { padding: 35px 25px; }
      .login-card h1 { font-size: 2rem; }
    }
  </style>
</head>
<body>
  <div class="login-card">
    <h1>Attendee Portal</h1>
    <p class="subtitle">Registered Guests Only</p>

    <!-- Email login form -->
    <form id="login-form">
      <div class="form-group">
        <label for="email">Your Registration Email</label>
        <input type="email" id="email" placeholder="email@example.com" required autocomplete="email">
      </div>
      <button type="submit" class="btn-login" id="submit-btn">Send Login Link</button>
    </form>

    <!-- Password login form (shown if user has set a password) -->
    <form id="password-form" style="display: none;">
      <div class="form-group">
        <label for="password-email">Email</label>
        <input type="email" id="password-email" readonly>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="Enter your password" required>
      </div>
      <button type="submit" class="btn-login" id="password-btn">Log In</button>
      <p style="margin-top: 12px; text-align: center;">
        <a href="#" id="use-magic-link" style="color: var(--color-primary); font-size: 0.9rem;">Use magic link instead</a>
      </p>
    </form>

    <div id="message" class="message"></div>
    <a href="/" class="back-link">&larr; Back to Hawaii Island AI Summit</a>
  </div>

  <!-- Firebase SDK (compat) -->
  <script src="https://www.gstatic.com/firebasejs/11.3.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/11.3.0/firebase-auth-compat.js"></script>
  <script>
    // TODO: Replace with your Firebase project config
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
    };
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    const loginForm = document.getElementById('login-form');
    const passwordForm = document.getElementById('password-form');
    const submitBtn = document.getElementById('submit-btn');
    const messageDiv = document.getElementById('message');
    const emailInput = document.getElementById('email');

    function showMessage(text, type) {
      messageDiv.textContent = text;
      messageDiv.className = 'message ' + type;
    }

    function hideMessage() {
      messageDiv.className = 'message';
    }

    // Check if user is already logged in
    auth.onAuthStateChanged((user) => {
      if (user) {
        window.location.href = '/portal';
      }
    });

    // Magic link login flow
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessage();
      const email = emailInput.value.trim();
      if (!email) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Checking registration...';

      try {
        // Step 1: Check Luma registration
        const checkRes = await fetch('/.netlify/functions/check-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const checkData = await checkRes.json();

        if (!checkData.registered) {
          showMessage('This email is not registered for the summit. Please register at lu.ma first.', 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Login Link';
          return;
        }

        // Step 2: Check if user has a password set (try sign-in methods)
        const methods = await auth.fetchSignInMethodsForEmail(email);
        if (methods.includes('password')) {
          // User has a password - show password form
          loginForm.style.display = 'none';
          passwordForm.style.display = 'block';
          document.getElementById('password-email').value = email;
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Login Link';
          return;
        }

        // Step 3: Send magic link via Firebase
        submitBtn.textContent = 'Sending link...';
        const actionCodeSettings = {
          url: window.location.origin + '/portal',
          handleCodeInApp: true,
        };
        await auth.sendSignInLinkToEmail(email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        showMessage('Check your email! We sent a login link to ' + email, 'success');
        loginForm.style.display = 'none';
      } catch (err) {
        showMessage('Something went wrong. Please try again.', 'error');
      }

      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Login Link';
    });

    // Password login flow
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessage();
      const email = document.getElementById('password-email').value;
      const password = document.getElementById('password').value;
      const btn = document.getElementById('password-btn');
      btn.disabled = true;
      btn.textContent = 'Logging in...';

      try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = '/portal';
      } catch (err) {
        showMessage('Invalid password. Please try again or use a magic link.', 'error');
        btn.disabled = false;
        btn.textContent = 'Log In';
      }
    });

    // Switch back to magic link
    document.getElementById('use-magic-link').addEventListener('click', async (e) => {
      e.preventDefault();
      hideMessage();
      const email = document.getElementById('password-email').value;
      passwordForm.style.display = 'none';

      try {
        const actionCodeSettings = {
          url: window.location.origin + '/portal',
          handleCodeInApp: true,
        };
        await auth.sendSignInLinkToEmail(email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        showMessage('Check your email! We sent a login link to ' + email, 'success');
      } catch (err) {
        showMessage('Something went wrong. Please try again.', 'error');
        loginForm.style.display = 'block';
      }
    });
  </script>
</body>
</html>
```

**Step 2: Verify locally**

```bash
npx netlify-cli dev
# Open http://localhost:8888/login
# Verify the page renders with correct styling
# Try submitting an email (will fail Luma check without env vars - expected)
```

**Step 3: Commit**

```bash
git add login.html
git commit -m "feat: add login page with magic link and password forms"
```

---

### Task 3: Portal Page

**Files:**
- Create: `portal.html`

**Step 1: Create `portal.html`**

This page handles magic link completion, displays authenticated content, and offers the optional password setup. Same Firebase config placeholder values as `login.html`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attendee Portal | Hawaii Island AI Summit 2026</title>
  <link rel="icon" type="image/png" href="images/logos/AI_transparent_small.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Bebas+Neue&family=Inter:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-primary: #00D4E8;
      --color-primary-dark: #006877;
      --color-secondary: #FF7F50;
      --color-secondary-light: #FF9A70;
      --color-accent: #FFD93D;
      --color-white: #FFFFFF;
      --color-dark: #0A0A0A;
      --color-gray: #0D1B1E;
      --font-display: 'Bebas Neue', 'Oswald', sans-serif;
      --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-family);
      color: var(--color-white);
      line-height: 1.6;
      background: var(--color-dark);
      font-weight: 600;
      min-height: 100vh;
    }

    /* Top bar */
    .portal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      background: rgba(0, 0, 0, 0.5);
      border-bottom: 3px solid var(--color-primary);
    }

    .portal-header h1 {
      font-family: var(--font-display);
      font-size: 1.5rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .portal-header a {
      text-decoration: none;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .user-email {
      color: var(--color-primary);
      font-size: 0.9rem;
    }

    .btn-logout {
      padding: 8px 20px;
      font-family: var(--font-display);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border: 2px solid var(--color-secondary);
      background: transparent;
      color: var(--color-secondary);
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-logout:hover {
      background: var(--color-secondary);
      color: white;
    }

    /* Loading state */
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      font-family: var(--font-display);
      font-size: 1.3rem;
      letter-spacing: 0.1em;
      color: var(--color-primary);
    }

    /* Portal content */
    .portal-content {
      display: none;
      max-width: 1000px;
      margin: 0 auto;
      padding: 50px 20px;
    }

    .portal-welcome {
      text-align: center;
      margin-bottom: 50px;
    }

    .portal-welcome h2 {
      font-family: var(--font-display);
      font-size: clamp(2rem, 5vw, 3rem);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 10px;
      text-shadow: 0 0 20px rgba(0, 212, 232, 0.4);
    }

    .portal-welcome p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.1rem;
    }

    .portal-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
      margin-bottom: 50px;
    }

    .portal-card {
      background: rgba(0, 0, 0, 0.4);
      border: 2px solid rgba(0, 212, 232, 0.3);
      padding: 35px 30px;
      transition: all 0.3s;
    }

    .portal-card:hover {
      border-color: var(--color-primary);
      box-shadow: 0 0 30px rgba(0, 212, 232, 0.2);
    }

    .portal-card h3 {
      font-family: var(--font-display);
      font-size: 1.4rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-secondary);
      margin-bottom: 12px;
    }

    .portal-card p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.95rem;
    }

    .coming-soon {
      display: inline-block;
      margin-top: 12px;
      font-family: var(--font-display);
      font-size: 0.8rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-accent);
    }

    /* Set password section */
    .set-password-section {
      max-width: 480px;
      margin: 0 auto;
      padding: 35px 30px;
      background: rgba(0, 0, 0, 0.4);
      border: 2px solid rgba(255, 127, 80, 0.3);
    }

    .set-password-section h3 {
      font-family: var(--font-display);
      font-size: 1.3rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }

    .set-password-section .desc {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
      margin-bottom: 20px;
    }

    .set-password-section input {
      width: 100%;
      padding: 12px 14px;
      font-family: var(--font-family);
      font-size: 1rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 127, 80, 0.4);
      color: var(--color-white);
      outline: none;
      margin-bottom: 12px;
      transition: border-color 0.3s;
    }

    .set-password-section input:focus {
      border-color: var(--color-secondary);
    }

    .set-password-section input::placeholder { color: rgba(255, 255, 255, 0.4); }

    .btn-set-pw {
      width: 100%;
      padding: 12px;
      font-family: var(--font-display);
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border: 2px solid var(--color-secondary);
      background: transparent;
      color: var(--color-secondary);
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-set-pw:hover {
      background: var(--color-secondary);
      color: white;
    }

    .pw-message {
      margin-top: 12px;
      font-size: 0.9rem;
      display: none;
    }

    .pw-message.success { display: block; color: var(--color-primary); }
    .pw-message.error { display: block; color: var(--color-secondary); }

    .has-password-note {
      color: var(--color-primary);
      font-size: 0.9rem;
    }

    @media (max-width: 600px) {
      .portal-header {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <!-- Loading state -->
  <div id="loading" class="loading">Loading...</div>

  <!-- Header (hidden until auth) -->
  <header class="portal-header" id="portal-header" style="display: none;">
    <a href="/"><h1>Hawaii AI Summit</h1></a>
    <div class="header-right">
      <span class="user-email" id="user-email"></span>
      <button class="btn-logout" id="logout-btn">Logout</button>
    </div>
  </header>

  <!-- Portal content (hidden until auth) -->
  <div class="portal-content" id="portal-content">
    <div class="portal-welcome">
      <h2>Welcome, Attendee</h2>
      <p>Your hub for summit materials, schedule details, and connections.</p>
    </div>

    <div class="portal-grid">
      <div class="portal-card">
        <h3>Event Schedule</h3>
        <p>Detailed session schedule with room assignments and speaker bios.</p>
        <span class="coming-soon">Coming Soon</span>
      </div>
      <div class="portal-card">
        <h3>Workshop Materials</h3>
        <p>Pre-event prep guides and post-event resources for your track.</p>
        <span class="coming-soon">Coming Soon</span>
      </div>
      <div class="portal-card">
        <h3>Attendee Directory</h3>
        <p>Connect with fellow attendees before the event.</p>
        <span class="coming-soon">Coming Soon</span>
      </div>
    </div>

    <!-- Set password section -->
    <div class="set-password-section" id="set-password-section">
      <h3>Set a Password</h3>
      <p class="desc">Optional: set a password so you can log in without a magic link next time.</p>
      <form id="set-password-form">
        <input type="password" id="new-password" placeholder="Choose a password (min 6 characters)" minlength="6" required>
        <input type="password" id="confirm-password" placeholder="Confirm password" minlength="6" required>
        <button type="submit" class="btn-set-pw">Set Password</button>
      </form>
      <div id="pw-message" class="pw-message"></div>
    </div>
  </div>

  <!-- Firebase SDK (compat) -->
  <script src="https://www.gstatic.com/firebasejs/11.3.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/11.3.0/firebase-auth-compat.js"></script>
  <script>
    // TODO: Replace with your Firebase project config (same as login.html)
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
    };
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    const loadingDiv = document.getElementById('loading');
    const portalHeader = document.getElementById('portal-header');
    const portalContent = document.getElementById('portal-content');
    const setPasswordSection = document.getElementById('set-password-section');

    function showPortal(user) {
      loadingDiv.style.display = 'none';
      portalHeader.style.display = 'flex';
      portalContent.style.display = 'block';
      document.getElementById('user-email').textContent = user.email;

      // Check if user already has a password linked
      const hasPassword = user.providerData.some(p => p.providerId === 'password');
      if (hasPassword) {
        setPasswordSection.innerHTML = '<p class="has-password-note">You have a password set. You can log in with your email and password next time.</p>';
      }
    }

    // Handle magic link sign-in
    if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please confirm your email address');
      }
      if (email) {
        auth.signInWithEmailLink(email, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            // Clean up URL (remove sign-in parameters)
            window.history.replaceState({}, document.title, '/portal');
            showPortal(result.user);
          })
          .catch((error) => {
            loadingDiv.textContent = 'Sign-in link expired or invalid. Please request a new one.';
            setTimeout(() => { window.location.href = '/login'; }, 3000);
          });
      } else {
        window.location.href = '/login';
      }
    } else {
      // Not a magic link - check if already logged in
      auth.onAuthStateChanged((user) => {
        if (user) {
          showPortal(user);
        } else {
          window.location.href = '/login';
        }
      });
    }

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
      auth.signOut().then(() => {
        window.location.href = '/';
      });
    });

    // Set password
    document.getElementById('set-password-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw = document.getElementById('new-password').value;
      const confirm = document.getElementById('confirm-password').value;
      const msgDiv = document.getElementById('pw-message');

      if (pw !== confirm) {
        msgDiv.textContent = 'Passwords do not match.';
        msgDiv.className = 'pw-message error';
        return;
      }

      try {
        const user = auth.currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, pw);
        await user.linkWithCredential(credential);
        msgDiv.textContent = 'Password set! You can use it to log in next time.';
        msgDiv.className = 'pw-message success';
        document.getElementById('set-password-form').style.display = 'none';
      } catch (err) {
        if (err.code === 'auth/provider-already-linked') {
          msgDiv.textContent = 'You already have a password set.';
          msgDiv.className = 'pw-message error';
        } else {
          msgDiv.textContent = 'Failed to set password. Please try again.';
          msgDiv.className = 'pw-message error';
        }
      }
    });
  </script>
</body>
</html>
```

**Step 2: Verify locally**

```bash
npx netlify-cli dev
# Open http://localhost:8888/portal
# Without auth, should redirect to /login
```

**Step 3: Commit**

```bash
git add portal.html
git commit -m "feat: add attendee portal with magic link completion and password setup"
```

---

### Task 4: Add Login Link to index.html

**Files:**
- Modify: `index.html` (footer-bottom section, around line 1790)

**Step 1: Add "Attendee Login" link to the footer**

In `index.html`, find the `footer-bottom` div (line ~1790) and add a login link between the motto and copyright:

```html
<!-- Replace the existing footer-bottom div with: -->
<div class="footer-bottom">
  <p style="margin-bottom: 20px;">
    <a href="/login" style="color: var(--color-primary); font-family: var(--font-display); font-size: 1rem; letter-spacing: 0.15em; text-transform: uppercase; transition: color 0.3s;">Attendee Login</a>
  </p>
  <p class="footer-motto"><em>Ma ka hana ka ʻike</em> &mdash; Learn by doing</p>
  <p class="footer-copyright">&copy; 2026 Hawaii Island AI Summit. All rights reserved.</p>
</div>
```

**Step 2: Verify**

```bash
npx netlify-cli dev
# Open http://localhost:8888
# Scroll to footer - verify "Attendee Login" link appears and links to /login
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add attendee login link to footer"
```

---

### Task 5: Update netlify.toml for Clean URLs

**Files:**
- Modify: `netlify.toml`

**Step 1: Add redirect for clean /login and /portal URLs**

Netlify already serves `.html` files, but add explicit pretty URL support so `/login` maps to `login.html` and `/portal` maps to `portal.html`:

```toml
# Add these redirects to netlify.toml:

# Clean URLs for auth pages
[[redirects]]
  from = "/login"
  to = "/login.html"
  status = 200

[[redirects]]
  from = "/portal"
  to = "/portal.html"
  status = 200
```

Also ensure the `[functions]` config was added in Task 1.

**Step 2: Commit**

```bash
git add netlify.toml
git commit -m "feat: add clean URL redirects for login and portal pages"
```

---

### Task 6: End-to-End Verification

**Prerequisites:** Firebase project configured (see Prerequisites section at top), Luma API key and event ID set in Netlify env vars.

**Step 1: Replace Firebase config placeholders**

In both `login.html` and `portal.html`, replace the `YOUR_*` placeholders in `firebaseConfig` with actual values from Firebase Console > Project Settings > General > Your apps > Web app.

**Step 2: Deploy to Netlify and test the full flow**

```bash
git push origin main
# Wait for Netlify deploy
```

1. Visit `https://hawaiiaisummit.com/login`
2. Enter an email that IS registered on Luma
3. Verify "Check your email" success message appears
4. Check email for Firebase magic link
5. Click the link - should arrive at `/portal` and be logged in
6. Try setting a password
7. Log out
8. Log back in with password
9. Test with an email NOT on Luma - should see "not registered" message

**Step 3: Final commit with Firebase config**

```bash
git add login.html portal.html
git commit -m "feat: configure Firebase for production"
```

---

## Notes

- **Firebase config values are safe to commit** - they are designed to be public. Security is enforced by Firebase Auth rules, not by hiding the config.
- **Luma API key must stay in Netlify env vars** - never commit it to the repo.
- **The Luma guest check paginates** through all guests. For events with hundreds of guests, this may take a couple seconds. The UI shows "Checking registration..." during this time.
- **`fetchSignInMethodsForEmail`** is used to detect if a user has set a password, so we can show the password form directly on return visits. Note: this requires "Email enumeration protection" to be disabled in Firebase Console > Authentication > Settings (it's disabled by default for new projects).
