const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.ALLOWED_ORIGIN || "*" },
  pingInterval: 25000,
  pingTimeout: 20000
});

const PORT = process.env.PORT || 3000;
const users = new Map(); // normalized email -> socket id
const identities = new Map(); // socket id -> normalized email

app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_req, res) => res.json({ ok: true, service: "aghil-email-voice-call" }));

function normalizeEmail(value) {
  if (typeof value !== "string") return "";
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
  return email;
}

io.on("connection", socket => {
  socket.emit("server:status", { ok: true });

  socket.on("register", (payload, callback) => {
    const email = normalizeEmail(payload && payload.email);
    if (!email) return typeof callback === "function" && callback({ ok: false, error: "ایمیل معتبر وارد کن." });

    const previous = users.get(email);
    if (previous && previous !== socket.id) {
      io.to(previous).emit("account:replaced");
      identities.delete(previous);
    }
    users.set(email, socket.id);
    identities.set(socket.id, email);
    socket.data.email = email;
    if (typeof callback === "function") callback({ ok: true, email });
    socket.emit("registered", { email });
    io.emit("presence", { online: [...users.keys()] });
  });

  socket.on("call:request", payload => {
    const caller = identities.get(socket.id);
    const targetEmail = normalizeEmail(payload && payload.to);
    if (!caller) return socket.emit("call:error", { message: "اول ایمیلت را ثبت کن." });
    if (!targetEmail) return socket.emit("call:error", { message: "ایمیل مخاطب معتبر نیست." });
    if (targetEmail === caller) return socket.emit("call:error", { message: "نمی‌توانی به ایمیل خودت زنگ بزنی." });
    const targetSocket = users.get(targetEmail);
    if (!targetSocket) return socket.emit("call:error", { message: "این مخاطب الان آنلاین نیست. باید صفحه تماس را باز و ایمیلش را ثبت کند." });
    io.to(targetSocket).emit("call:incoming", { from: caller });
    socket.emit("call:ringing", { to: targetEmail });
  });

  socket.on("call:accept", payload => {
    const caller = identities.get(socket.id);
    const targetEmail = normalizeEmail(payload && payload.from);
    const targetSocket = users.get(targetEmail);
    if (!caller || !targetSocket) return socket.emit("call:error", { message: "تماس‌گیرنده دیگر آنلاین نیست." });
    io.to(targetSocket).emit("call:accepted", { by: caller });
    socket.emit("call:accepted", { by: targetEmail });
  });

  socket.on("call:reject", payload => {
    const rejecter = identities.get(socket.id);
    const callerEmail = normalizeEmail(payload && payload.from);
    const callerSocket = users.get(callerEmail);
    if (callerSocket) io.to(callerSocket).emit("call:rejected", { by: rejecter || "مخاطب" });
  });

  for (const event of ["webrtc:offer", "webrtc:answer", "webrtc:ice"]) {
    socket.on(event, payload => {
      const sender = identities.get(socket.id);
      const targetEmail = normalizeEmail(payload && payload.to);
      const targetSocket = users.get(targetEmail);
      if (!sender || !targetSocket) return socket.emit("call:error", { message: "اتصال مخاطب قطع شده است." });
      io.to(targetSocket).emit(event, { ...payload, from: sender });
    });
  }

  socket.on("call:end", payload => {
    const sender = identities.get(socket.id);
    const peerEmail = normalizeEmail(payload && payload.to);
    const peerSocket = users.get(peerEmail);
    if (peerSocket) io.to(peerSocket).emit("call:ended", { by: sender || "مخاطب" });
  });

  socket.on("disconnect", () => {
    const email = identities.get(socket.id);
    if (email && users.get(email) === socket.id) users.delete(email);
    identities.delete(socket.id);
    io.emit("presence", { online: [...users.keys()] });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Email Voice Call server listening on port ${PORT}`);
});
