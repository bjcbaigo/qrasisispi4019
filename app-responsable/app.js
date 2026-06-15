const serverUrl = document.querySelector("#serverUrl");
const responsableToken = document.querySelector("#responsableToken");
const saveConfig = document.querySelector("#saveConfig");
const clearConfig = document.querySelector("#clearConfig");
const startBtn = document.querySelector("#startBtn");
const stopBtn = document.querySelector("#stopBtn");
const statusBox = document.querySelector("#status");
const manualPayload = document.querySelector("#manualPayload");
const manualBtn = document.querySelector("#manualBtn");
const historyList = document.querySelector("#historyList");

let scanner;
let busy = false;

function loadConfig() {
  serverUrl.value = localStorage.getItem("asistencia.serverUrl") || "";
  responsableToken.value = localStorage.getItem("asistencia.responsableToken") || "";
}

function persistConfig() {
  localStorage.setItem("asistencia.serverUrl", serverUrl.value.trim());
  localStorage.setItem("asistencia.responsableToken", responsableToken.value.trim());
  setStatus("Configuracion guardada.", "ok");
}

function clearSavedConfig() {
  localStorage.removeItem("asistencia.serverUrl");
  localStorage.removeItem("asistencia.responsableToken");
  serverUrl.value = "";
  responsableToken.value = "";
  setStatus("Configuracion borrada.", "warn");
}

function setStatus(message, kind = "idle") {
  statusBox.textContent = message;
  statusBox.className = `status ${kind}`;
}

function requireConfig() {
  if (!serverUrl.value.trim() || !responsableToken.value.trim()) {
    setStatus("Completar URL del servidor y token del tutor antes de escanear.", "bad");
    return false;
  }
  return true;
}

function addHistory(message, kind) {
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
  item.className = kind;
  historyList.prepend(item);
  while (historyList.children.length > 8) {
    historyList.lastElementChild.remove();
  }
}

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `qrCallback_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const script = document.createElement("script");
    const sep = url.includes("?") ? "&" : "?";
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Tiempo de espera agotado."));
    }, 15000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("No se pudo conectar con el servidor."));
    };

    script.src = `${url}${sep}callback=${encodeURIComponent(callbackName)}`;
    document.body.appendChild(script);
  });
}

async function registerPayload(rawPayload) {
  if (busy || !requireConfig()) return;
  busy = true;
  setStatus("Enviando registro a Google Sheets...", "warn");

  const params = new URLSearchParams({
    action: "registrar",
    responsableToken: responsableToken.value.trim(),
    payload: rawPayload
  });

  try {
    const response = await jsonp(`${serverUrl.value.trim()}?${params.toString()}`);
    if (response.ok) {
      const duplicateText = response.duplicado ? " Registro marcado como duplicado." : "";
      const message = `${response.alumno} - ${response.lugar}${response.duplicado ? " - duplicado" : ""}`;
      setStatus(`Asistencia registrada: ${response.alumno} - ${response.lugar}.${duplicateText}`, response.duplicado ? "warn" : "ok");
      addHistory(message, response.duplicado ? "warn" : "ok");
    } else {
      setStatus(response.error || "No se pudo registrar la asistencia.", "bad");
      addHistory(response.error || "Registro rechazado", "bad");
    }
  } catch (error) {
    setStatus(error.message, "bad");
    addHistory(error.message, "bad");
  } finally {
    busy = false;
  }
}

async function startScanner() {
  if (!requireConfig()) return;
  if (!window.Html5Qrcode) {
    setStatus("No se cargo la libreria de camara. Revisar conexion a internet.", "bad");
    return;
  }

  scanner = scanner || new Html5Qrcode("reader");
  startBtn.disabled = true;
  stopBtn.disabled = false;
  setStatus("Camara activa. Apuntar al QR del alumno.", "warn");

  try {
    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      async (decodedText) => {
        await stopScanner();
        await registerPayload(decodedText);
      }
    );
  } catch (error) {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    setStatus(`No se pudo iniciar la camara: ${error}`, "bad");
  }
}

async function stopScanner() {
  if (scanner && scanner.isScanning) {
    await scanner.stop();
  }
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

saveConfig.addEventListener("click", persistConfig);
clearConfig.addEventListener("click", clearSavedConfig);
startBtn.addEventListener("click", startScanner);
stopBtn.addEventListener("click", stopScanner);
manualBtn.addEventListener("click", () => registerPayload(manualPayload.value.trim()));

loadConfig();
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}
