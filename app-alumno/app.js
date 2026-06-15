const form = document.querySelector("#studentForm");
const result = document.querySelector("#result");
const qrNode = document.querySelector("#qrcode");
const payloadText = document.querySelector("#payloadText");
const downloadBtn = document.querySelector("#downloadBtn");
const resetBtn = document.querySelector("#resetBtn");

let lastPayload = "";

function cleanText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function cleanToken(value) {
  return value.trim().replace(/[^A-Za-z0-9._-]/g, "").toUpperCase();
}

function saveCredential(token, nombre) {
  localStorage.setItem("alumno.token", token);
  localStorage.setItem("alumno.nombre", nombre);
}

function loadCredential() {
  return {
    token: localStorage.getItem("alumno.token") || "",
    nombre: localStorage.getItem("alumno.nombre") || ""
  };
}

function renderQr(payload) {
  qrNode.innerHTML = "";
  new QRCode(qrNode, {
    text: payload,
    width: 320,
    height: 320,
    colorDark: "#0f172a",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

function showCredential(token, nombre) {
  const emitido = new Date().toISOString();
  const payload = {
    schema: "asistencia-pasantias/v2",
    token,
    emitido
  };

  lastPayload = JSON.stringify(payload);
  renderQr(lastPayload);

  document.querySelector("#studentName").textContent = nombre;
  document.querySelector("#issuedAt").textContent = `Generado: ${new Date(emitido).toLocaleString()}`;
  payloadText.value = lastPayload;
  form.hidden = true;
  result.hidden = false;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const token = cleanToken(document.querySelector("#token").value);
  const nombre = cleanText(document.querySelector("#nombre").value);

  saveCredential(token, nombre);
  showCredential(token, nombre);
});

downloadBtn.addEventListener("click", () => {
  const canvas = qrNode.querySelector("canvas");
  const image = qrNode.querySelector("img");
  const link = document.createElement("a");
  link.download = "qr-asistencia-pasantias.png";
  link.href = canvas ? canvas.toDataURL("image/png") : image.src;
  link.click();
});

resetBtn.addEventListener("click", () => {
  result.hidden = true;
  form.hidden = false;
  document.querySelector("#token").focus();
});

window.addEventListener("load", () => {
  const saved = loadCredential();
  if (saved.token) document.querySelector("#token").value = saved.token;
  if (saved.nombre) document.querySelector("#nombre").value = saved.nombre;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js");
  }
});
