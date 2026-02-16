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
