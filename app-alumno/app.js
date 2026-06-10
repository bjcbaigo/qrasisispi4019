const form = document.querySelector("#studentForm");
const result = document.querySelector("#result");
const qrNode = document.querySelector("#qrcode");
const payloadText = document.querySelector("#payloadText");
const downloadBtn = document.querySelector("#downloadBtn");

let lastPayload = "";

function cleanText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function cleanDni(value) {
  return value.trim().replace(/[^\dA-Za-z-]/g, "");
}

function randomNonce() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(text) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
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

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const dni = cleanDni(document.querySelector("#dni").value);
  const nombre = cleanText(document.querySelector("#nombre").value);
  const emitido = new Date().toISOString();
  const nonce = randomNonce();
  const token = (await sha256(`PASANTIA|${dni}|${nombre.toUpperCase()}|${nonce}`)).slice(0, 24).toUpperCase();

  const payload = {
    schema: "asistencia-pasantias/v1",
    dni,
    nombre,
    token,
    emitido,
    nonce
  };

  lastPayload = JSON.stringify(payload);
  renderQr(lastPayload);

  document.querySelector("#studentName").textContent = nombre;
  document.querySelector("#studentDni").textContent = `DNI/Legajo: ${dni}`;
  document.querySelector("#issuedAt").textContent = `Generado: ${new Date(emitido).toLocaleString()}`;
  payloadText.value = lastPayload;
  result.hidden = false;
});

downloadBtn.addEventListener("click", () => {
  const canvas = qrNode.querySelector("canvas");
  const image = qrNode.querySelector("img");
  const link = document.createElement("a");
  link.download = "qr-asistencia-pasantias.png";
  link.href = canvas ? canvas.toDataURL("image/png") : image.src;
  link.click();
});
