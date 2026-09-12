export default {

  async fetch(request, env) {

    const url = new URL(request.url);

    /* =====================
       CORS
    ===================== */

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    /* =====================
       OPTIONS
    ===================== */

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    /* =====================
       HEALTH CHECK
    ===================== */

    if (
      request.method === "GET" &&
      url.pathname === "/"
    ) {

      return json({
        ok: true,
        name: "Aghil Worker",
        version: "2.0.0",
        status: "online",
        ai: Boolean(env.AI)
      }, corsHeaders);
    }

    /* =====================
       CHAT API
    ===================== */

    if (
      request.method === "POST" &&
      url.pathname === "/api/chat"
    ) {

      try {

        /* -----------------
           Check AI Binding
        ----------------- */

        if (!env.AI) {

          return json({
            ok: false,
            error: "Workers AI binding is not configured"
          }, corsHeaders, 500);

        }

        /* -----------------
           Read JSON
        ----------------- */

        const body = await request.json();

        const message =
          typeof body.message === "string"
            ? body.message.trim()
            : "";

        if (!message) {

          return json({
            ok: false,
            error: "Message is required"
          }, corsHeaders, 400);

        }

        /* -----------------
           Optional history
        ----------------- */

        const history =
          Array.isArray(body.history)
            ? body.history
                .filter(item =>
                  item &&
                  typeof item.content === "string" &&
                  (
                    item.role === "user" ||
                    item.role === "assistant"
                  )
                )
                .slice(-10)
            : [];

        /* -----------------
           System prompt
        ----------------- */

        const systemPrompt = `
تو یک دستیار هوش مصنوعی فارسی‌زبان هستی.

قوانین:
- به فارسی روان و طبیعی پاسخ بده.
- پاسخ‌ها را واضح و کاربردی بنویس.
- اگر کاربر عربی یا انگلیسی صحبت کرد، همان زبان را بفهم و در صورت نیاز پاسخ مناسب بده.
- برای سؤال‌های ساده کوتاه جواب بده.
- برای سؤال‌های فنی، مرحله‌به‌مرحله راهنمایی کن.
- درباره توانایی‌هایی که واقعاً نداری ادعای ساختگی نکن.
- اگر اطلاعات کافی نداری، صادقانه بگو.
- لحن دوستانه و محترمانه داشته باش.
`;

        /* -----------------
           Messages
        ----------------- */

        const messages = [
          {
            role: "system",
            content: systemPrompt
          },
          ...history,
          {
            role: "user",
            content: message
          }
        ];

        /* -----------------
           Workers AI
        ----------------- */

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct-fp8",
          {
            messages,
            max_tokens: 1024,
            temperature: 0.7
          }
        );

        /* -----------------
           Extract response
        ----------------- */

        const reply =
          extractAIResponse(result);

        if (!reply) {

          return json({
            ok: false,
            error: "AI returned an empty response",
            raw: result
          }, corsHeaders, 502);

        }

        /* -----------------
           Final response
        ----------------- */

        return json({

          ok: true,

          reply,

          worker: body.worker || {},

          model:
            "@cf/meta/llama-3.1-8b-instruct-fp8",

          timestamp:
            new Date().toISOString()

        }, corsHeaders);

      } catch (error) {

        console.error(
          "CHAT_ERROR:",
          error
        );

        return json({

          ok: false,

          error:
            "AI request failed",

          message:
            error?.message || String(error)

        }, corsHeaders, 500);

      }

    }

    /* =====================
       NOT FOUND
    ===================== */

    return json({

      ok: false,

      error: "Route not found"

    }, corsHeaders, 404);

  }

};


/* =========================
   EXTRACT AI RESPONSE
========================= */

function extractAIResponse(result) {

  if (!result) {
    return "";
  }

  /* Workers AI message response */

  if (
    typeof result.response === "string"
  ) {
    return result.response.trim();
  }

  /* OpenAI-compatible style */

  if (
    result.choices &&
    result.choices[0] &&
    result.choices[0].message &&
    typeof result.choices[0].message.content === "string"
  ) {

    return result.choices[0]
      .message
      .content
      .trim();

  }

  /* Other possible response format */

  if (
    typeof result.text === "string"
  ) {
    return result.text.trim();
  }

  return "";
}


/* =========================
   JSON RESPONSE
========================= */

function json(
  data,
  corsHeaders = {},
  status = 200
) {

  return new Response(

    JSON.stringify(data),

    {

      status,

      headers: {

        "Content-Type":
          "application/json; charset=UTF-8",

        ...corsHeaders

      }

    }

  );

}
