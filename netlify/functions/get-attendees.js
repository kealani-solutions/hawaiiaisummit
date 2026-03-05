exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const LUMA_API_KEY = process.env.LUMA_API_KEY;
  const LUMA_EVENT_ID = process.env.LUMA_EVENT_ID;

  if (!LUMA_API_KEY || !LUMA_EVENT_ID) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  try {
    const baseUrl = `https://api.lu.ma/public/v1/event/get-guests?event_api_id=${LUMA_EVENT_ID}&approval_status=approved`;
    const allGuests = [];
    let nextCursor = null;

    // Paginate through all guests
    do {
      const url = nextCursor ? `${baseUrl}&pagination_cursor=${nextCursor}` : baseUrl;
      const response = await fetch(url, {
        headers: { 'x-luma-api-key': LUMA_API_KEY },
      });

      if (!response.ok) {
        return { statusCode: 502, headers, body: JSON.stringify({ error: 'Failed to fetch attendees' }) };
      }

      const data = await response.json();
      const entries = data.entries || [];

      for (const entry of entries) {
        const g = entry.guest || {};
        const answers = g.registration_answers || [];

        // Find track preference from registration answers
        const trackAnswer = answers.find((a) => a.question_id === 'c1bz86b5');
        let lumaTrack = null;
        if (trackAnswer) {
          const val = trackAnswer.value || '';
          if (val.startsWith('Builders')) lumaTrack = 'builders';
          else if (val.startsWith('Leaders')) lumaTrack = 'leaders';
          // "Not sure yet" or anything else stays null
        }

        // Collect all registration answers as key-value pairs
        var registrationAnswers = {};
        for (const a of answers) {
          registrationAnswers[a.label] = a.value || '';
        }

        allGuests.push({
          name: g.name || g.user_name || [g.user_first_name, g.user_last_name].filter(Boolean).join(' ') || '',
          email: (g.email || g.user_email || '').toLowerCase(),
          lumaTrack: lumaTrack,
          registrationAnswers: Object.keys(registrationAnswers).length > 0 ? registrationAnswers : null,
        });
      }

      nextCursor = data.next_cursor;
    } while (nextCursor);

    // Filter out guests with no name and sort alphabetically
    const namedGuests = allGuests.filter((g) => g.name.trim());
    namedGuests.sort((a, b) => a.name.localeCompare(b.name));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ attendees: namedGuests }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
