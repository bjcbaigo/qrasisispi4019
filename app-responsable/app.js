const serverUrl = document.querySelector("#serverUrl");
const accessKey = document.querySelector("#accessKey");
const responsable = document.querySelector("#responsable");
const saveConfig = document.querySelector("#saveConfig");
const startBtn = document.querySelector("#startBtn");
const stopBtn = document.querySelector("#stopBtn");
const statusBox = document.querySelector("#status");
const manualPayload = document.querySelector("#manualPayload");
const manualBtn = document.querySelector("#manualBtn");

let scanner;
let busy = false;

function loadConfig() {
  serverUrl.value = localStorage.getItem("asistencia.serverUrl") || "";
  accessKey.value = localStorage.getItem("asistencia.accessKey") || "";
  responsable.value = localStorage.getItem("asistencia.responsable") || "";
}

function persistConfig() {
  localStorage.setItem("asistencia.serverUrl", serverUrl.value.trim());
  localStorage.setItem("asistencia.accessKey", accessKey.value.trim());
  localStorage.setItem("asistencia.responsable", responsable.value.trim());
  setStatus("Configuracion guardada.", "ok");
}

function setStatus(message, kind = "idle") {
  statusBox.textContent = message;
  statusBox.className = `status ${kind}`;
}

function requireConfig() {
  if (!serverUrl.value.trim() || !accessKey.value.trim() || !responsable.value.trim()) {
    setStatus("Completar URL del servidor, clave y responsable antes de escanear.", "bad");
    return false;
  }
  return true;
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
    key: accessKey.value.trim(),
    responsable: responsable.value.trim(),
    payload: rawPayload
  });

  try {
    const response = await jsonp(`${serverUrl.value.trim()}?${params.toString()}`);
    if (response.ok) {
      const duplicateText = response.duplicado ? " Registro marcado como duplicado." : "";
      setStatus(`Asistencia registrada: ${response.alumno} - ${response.lugar}.${duplicateText}`, response.duplicado ? "warn" : "ok");
    } else {
      setStatus(response.error || "No se pudo registrar la asistencia.", "bad");
    }
  } catch (error) {
    setStatus(error.message, "bad");
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
startBtn.addEventListener("click", startScanner);
stopBtn.addEventListener("click", stopScanner);
manualBtn.addEventListener("click", () => registerPayload(manualPayload.value.trim()));

loadConfig();
