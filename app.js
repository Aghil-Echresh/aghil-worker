let messageCount = 0;


/* =========================
   INITIALIZE
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadSettings();

    renderMemory();

    updateStats();

    addLog(
      "Aghil Worker initialized"
    );

  }
);


/* =========================
   SETTINGS
========================= */

function saveWorkerSettings() {

  const settings = {

    name:
      document.getElementById(
        "workerName"
      ).value,

    mission:
      document.getElementById(
        "workerMission"
      ).value,

    personality:
      document.getElementById(
        "personality"
      ).value

  };

  localStorage.setItem(
    "aghil_worker_settings",
    JSON.stringify(settings)
  );

  addLog(
    "Worker settings saved"
  );

  alert(
    "تنظیمات با موفقیت ذخیره شد ✅"
  );
}


function loadSettings() {

  const saved =
    localStorage.getItem(
      "aghil_worker_settings"
    );

  if (!saved) return;

  try {

    const settings =
      JSON.parse(saved);

    document.getElementById(
      "workerName"
    ).value =
      settings.name || "Aghil Worker";

    document.getElementById(
      "workerMission"
    ).value =
      settings.mission || "";

    document.getElementById(
      "personality"
    ).value =
      settings.personality || "friendly";

  } catch (error) {

    console.error(error);

  }

}


/* =========================
   TOOLS
========================= */

function toggleTool(tool) {

  const checkbox =
    document.getElementById(
      tool + "Tool"
    );

  const enabled =
    checkbox.checked;

  addLog(
    `${tool} tool ${enabled ? "enabled" : "disabled"}`
  );
}


/* =========================
   CHAT
========================= */

function handleEnter(event) {

  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {

    event.preventDefault();

    sendMessage();

  }

}


async function sendMessage() {

  const input =
    document.getElementById(
      "messageInput"
    );

  const text =
    input.value.trim();

  if (!text) return;

  addMessage(
    text,
    "user"
  );

  input.value = "";

  messageCount++;

  updateStats();

  addLog(
    "User message received"
  );


  /*
   * اگر Worker واقعی فعال شده باشد،
   * پیام به Backend ارسال می‌شود.
   */

  if (
    AGHIL_CONFIG.api.enabled &&
    AGHIL_CONFIG.api.workerUrl
  ) {

    await sendToBackend(text);

    return;
  }


  /*
   * نسخه Demo
   */

  setTimeout(() => {

    const response =
      generateLocalResponse(text);

    addMessage(
      response,
      "bot"
    );

    messageCount++;

    updateStats();

  }, 500);

}


/* =========================
   BACKEND
========================= */

async function sendToBackend(text) {

  try {

    const response =
      await fetch(
        AGHIL_CONFIG.api.workerUrl +
        AGHIL_CONFIG.api.endpoint,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            message: text,

            worker:
              getWorkerSettings(),

            memory:
              Memory.getAll()

          })

        }
      );


    if (!response.ok) {

      throw new Error(
        "Backend request failed"
      );

    }


    const data =
      await response.json();


    addMessage(
      data.reply ||
      "پاسخی دریافت نشد.",
      "bot"
    );

    messageCount++;

    updateStats();


  } catch (error) {

    console.error(error);

    addMessage(
      "اتصال به Worker برقرار نشد ❌",
      "bot"
    );

    addLog(
      "Backend connection failed"
    );

  }

}


/* =========================
   LOCAL AI DEMO
========================= */

function generateLocalResponse(text) {

  const message =
    text.toLowerCase();


  if (
    message.includes("سلام")
  ) {

    return `
      سلام عقیل جان 🌷<br>
      Aghil Worker آماده‌ست.
      بگو چه کاری انجام بدم؟
    `;

  }


  if (
    message.includes("واتساپ") ||
    message.includes("whatsapp")
  ) {

    return `
      📱 اتصال WhatsApp در نسخه بعدی فعال می‌شود.
      <br><br>
      فعلاً هسته Worker آماده است.
    `;

  }


  if (
    message.includes("حافظه")
  ) {

    return `
      🧠 حافظه فعلی من
      ${Memory.getAll().length}
      مورد دارد.
    `;

  }


  if (
    message.includes("ذخیره")
  ) {

    Memory.add(text);

    renderMemory();

    updateStats();

    return `
      🧠 ذخیره شد.
      این مورد را در حافظه محلی Worker نگه داشتم.
    `;

  }


  return `
    🤖 پیام دریافت شد:
    <br><br>
    «${escapeHtml(text)}»
    <br><br>
    فعلاً در حالت Demo هستم.
    در مرحله بعد مغز AI واقعی به من وصل می‌شود.
  `;

}


/* =========================
   MESSAGES
========================= */

function addMessage(
  text,
  type
) {

  const chat =
    document.getElementById(
      "chat"
    );


  const message =
    document.createElement(
      "div"
    );

  message.className =
    `message ${type}`;


  const avatar =
    document.createElement(
      "div"
    );

  avatar.className =
    "avatar";

  avatar.textContent =
    type === "user"
      ? "👤"
      : "🤖";


  const bubble =
    document.createElement(
      "div"
    );

  bubble.className =
    "bubble";

  bubble.innerHTML =
    text;


  message.appendChild(
    avatar
  );

  message.appendChild(
    bubble
  );


  chat.appendChild(
    message
  );


  chat.scrollTop =
    chat.scrollHeight;
}


/* =========================
   MEMORY
========================= */

function renderMemory() {

  const container =
    document.getElementById(
      "memoryList"
    );

  const memories =
    Memory.getAll();


  document.getElementById(
    "memoryCount"
  ).textContent =
    memories.length;


  if (!memories.length) {

    container.innerHTML =
      `
        <div class="empty">
          هنوز چیزی ذخیره نشده است.
        </div>
      `;

    return;
  }


  container.innerHTML =
    memories
      .slice()
      .reverse()
      .map(item => {

        return `
          <div class="memory-item">
            🧠
            ${escapeHtml(item.text)}
          </div>
        `;

      })
      .join("");

}


function clearMemory() {

  if (
    !confirm(
      "همه حافظه پاک شود؟"
    )
  ) return;


  Memory.clear();

  renderMemory();

  updateStats();

  addLog(
    "Memory cleared"
  );

}


/* =========================
   STATS
========================= */

function updateStats() {

  document.getElementById(
    "messageCount"
  ).textContent =
    messageCount;


  document.getElementById(
    "memoryCount"
  ).textContent =
    Memory.getAll().length;
}


/* =========================
   LOG
========================= */

function addLog(text) {

  const logs =
    document.getElementById(
      "logs"
    );


  const item =
    document.createElement(
      "div"
    );

  item.className =
    "log";


  const time =
    new Date()
      .toLocaleTimeString(
        "fa-IR",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      );


  item.innerHTML =
    `
      <span>●</span>
      ${escapeHtml(text)}
      <small> ${time}</small>
    `;


  logs.prepend(item);
}


/* =========================
   WORKER SETTINGS
========================= */

function getWorkerSettings() {

  const saved =
    localStorage.getItem(
      "aghil_worker_settings"
    );

  if (!saved) {

    return {

      name: "Aghil Worker",

      mission:
        "مدیریت سفارش‌ها و پاسخ‌گویی هوشمند",

      personality:
        "friendly"

    };

  }


  try {

    return JSON.parse(saved);

  } catch {

    return {};

  }

}


/* =========================
   SECURITY
========================= */

function escapeHtml(text) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    text;

  return div.innerHTML;
}