export default {

  async fetch(request, env) {

    const url =
      new URL(request.url);


    /* =====================
       CORS
    ===================== */

    const corsHeaders = {

      "Access-Control-Allow-Origin": "*",

      "Access-Control-Allow-Methods":
        "GET, POST, OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type"

    };


    if (
      request.method === "OPTIONS"
    ) {

      return new Response(
        null,
        {
          headers: corsHeaders
        }
      );

    }


    /* =====================
       HEALTH CHECK
    ===================== */

    if (
      request.method === "GET" &&
      url.pathname === "/"
    ) {

      return json(
        {

          ok: true,

          name:
            "Aghil Worker",

          version:
            "1.0.0",

          status:
            "online"

        },
        corsHeaders
      );

    }


    /* =====================
       CHAT API
    ===================== */

    if (
      request.method === "POST" &&
      url.pathname === "/api/chat"
    ) {

      try {

        const body =
          await request.json();


        const message =
          body.message || "";


        if (!message) {

          return json(
            {
              ok: false,
              error:
                "Message is required"
            },
            corsHeaders,
            400
          );

        }


        /*
         * AI واقعی را در نسخه بعدی
         * اینجا وصل می‌کنیم.
         */

        const reply =
          localResponse(message);


        return json(
          {

            ok: true,

            reply,

            worker:
              body.worker || {},

            timestamp:
              new Date().toISOString()

          },
          corsHeaders
        );


      } catch (error) {

        return json(
          {

            ok: false,

            error:
              "Invalid request"

          },
          corsHeaders,
          400
        );

      }

    }


    /* =====================
       NOT FOUND
    ===================== */

    return json(
      {

        ok: false,

        error:
          "Route not found"

      },
      corsHeaders,
      404
    );

  }

};


/* =========================
   LOCAL RESPONSE
========================= */

function localResponse(message) {

  const text =
    message.toLowerCase();


  if (
    text.includes("سلام")
  ) {

    return "سلام 🌷 من Aghil Worker هستم. آماده‌ام.";

  }


  if (
    text.includes("واتساپ") ||
    text.includes("whatsapp")
  ) {

    return "📱 ماژول WhatsApp آماده اتصال است.";

  }


  return `
پیام شما دریافت شد:

${message}

Aghil Worker در حال حاضر در حالت Demo است.
`;

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