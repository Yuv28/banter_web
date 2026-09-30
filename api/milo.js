// api/milo.js
//
// Vercel serverless function. The browser calls /api/milo; this runs on
// Vercel's servers, adds the secret Anthropic API key, and forwards the
// request to Anthropic. The key lives in a Vercel Environment Variable
// (ANTHROPIC_API_KEY) and is NEVER sent to the browser — that's the whole
// reason this function exists instead of calling Anthropic from the app.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server is missing ANTHROPIC_API_KEY. Add it in Vercel → Settings → Environment Variables.",
    });
  }

  try {
    const { system, messages } = req.body || {};

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        system,
        messages,
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      // Pass Anthropic's error status through so the app can show a retry.
      return res.status(anthropicRes.status).json(data);
    }

    // Return the raw Anthropic response; the app reads data.content[].text.
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Milo request failed", detail: String(err) });
  }
}
