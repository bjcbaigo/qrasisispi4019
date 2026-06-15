const CONFIG = {
  SPREADSHEET_ID: "PEGAR_ID_DE_LA_PLANILLA",
  ACCESS_KEY: "CAMBIAR_ESTA_CLAVE_ADMIN",
  TIME_ZONE: "America/Argentina/Buenos_Aires",
  ALLOW_CROSS_LOCATION: false
};

function doGet(e) {
  const result = handleRequest_(e && e.parameter ? e.parameter : {});
  return output_(result, e && e.parameter && e.parameter.callback);
}

function doPost(e) {
  let params = {};
  try {
    params = JSON.parse(e.postData.contents || "{}");
  } catch (err) {
    return output_({ ok: false, error: "POST JSON invalido." });
  }
  return output_(handleRequest_(params));
}

function handleRequest_(params) {
  try {
    if (params.action === "ping") {
      if (params.key !== CONFIG.ACCESS_KEY) return { ok: false, error: "Clave de administracion invalida." };
      return { ok: true, message: "Servidor activo." };
    }
    if (params.action === "registrar") {
      return registrarAsistencia_(params);
    }
    return { ok: false, error: "Accion no reconocida." };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

function registrarAsistencia_(params) {
  const payload = parsePayload_(params.payload);
  const responsableToken = String(params.responsableToken || "").trim();
  if (!responsableToken) throw new Error("Falta token del tutor.");
  if (!payload.token) throw new Error("QR invalido: falta token de alumno.");

  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const alumnos = readSheet_(ss, "Alumnos");
  const responsables = readSheet_(ss, "Responsables");
  const asistenciasSheet = ss.getSheetByName("Asistencias");
  if (!asistenciasSheet) throw new Error("No existe la hoja Asistencias.");

  const alumno = findAlumnoByToken_(alumnos, payload.token);
  if (!alumno) throw new Error("QR invalido: alumno no encontrado o inactivo.");

  const responsable = findResponsableByToken_(responsables, responsableToken);
  if (!responsable) throw new Error("Tutor no autorizado o inactivo.");

  const alumnoLugarId = get_(alumno, "ID_LUGAR");
  const responsableLugarId = get_(responsable, "ID_LUGAR");
  if (!CONFIG.ALLOW_CROSS_LOCATION && alumnoLugarId && responsableLugarId && alumnoLugarId !== responsableLugarId) {
    throw new Error("El alumno no corresponde al lugar asignado al tutor.");
  }

  const now = new Date();
  const fecha = Utilities.formatDate(now, CONFIG.TIME_ZONE, "dd/MM/yyyy");
  const hora = Utilities.formatDate(now, CONFIG.TIME_ZONE, "HH:mm:ss");
  const lugarId = alumnoLugarId || responsableLugarId;
  const lugar = get_(alumno, "Lugar asignado") || get_(responsable, "Lugar");
  const duplicado = isDuplicate_(asistenciasSheet, get_(alumno, "ID_ALUMNO"), lugarId, fecha);
  const estado = duplicado ? "Duplicado" : "Activo";
  const registroId = nextRegistroId_(asistenciasSheet);

  asistenciasSheet.appendRow([
    registroId,
    fecha,
    hora,
    get_(alumno, "ID_ALUMNO"),
    get_(alumno, "Apellido y nombre"),
    get_(responsable, "ID_RESPONSABLE"),
    get_(responsable, "Nombre"),
    lugarId,
    lugar,
    "QR",
    estado,
    duplicado ? "Si" : "No",
    duplicado ? "Posible duplicado: mismo alumno, lugar y fecha." : "Ingreso normal"
  ]);

  return {
    ok: true,
    idRegistro: registroId,
    alumno: get_(alumno, "Apellido y nombre"),
    responsable: get_(responsable, "Nombre"),
    lugar,
    duplicado
  };
}

function parsePayload_(raw) {
  if (!raw) throw new Error("QR vacio.");
  try {
    const parsed = JSON.parse(raw);
    return {
      schema: String(parsed.schema || "").trim(),
      token: String(parsed.token || parsed.qrToken || "").trim()
    };
  } catch (err) {
    return { schema: "legacy/raw-token", token: String(raw).trim() };
  }
}

function readSheet_(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error("No existe la hoja " + name + ".");
  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map(String);
  return values
    .filter((row) => row.some((cell) => cell !== ""))
    .map((row) => {
      const obj = {};
      headers.forEach((header, index) => obj[header] = row[index]);
      return obj;
    });
}

function findAlumnoByToken_(rows, token) {
  const normalizedToken = normalize_(token);
  return rows.find((row) => {
    if (!isActive_(get_(row, "Estado"))) return false;
    return normalize_(get_(row, "QR/Token")) === normalizedToken;
  });
}

function findResponsableByToken_(rows, token) {
  const normalizedToken = normalize_(token);
  return rows.find((row) => {
    if (!isActive_(get_(row, "Estado"))) return false;
    return normalize_(get_(row, "TOKEN_APP")) === normalizedToken;
  });
}

function isDuplicate_(sheet, idAlumno, idLugar, fecha) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return false;
  const headers = values[0].map(String);
  const col = {};
  headers.forEach((header, index) => col[header] = index);

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowFecha = formatFecha_(row[col["Fecha"]]);
    const rowAlumno = String(row[col["ID_ALUMNO"]] || "").trim();
    const rowLugar = String(row[col["ID_LUGAR"]] || "").trim();
    const rowEstado = String(row[col["Estado"]] || "").trim().toLowerCase();
    if (rowFecha === fecha && rowAlumno === idAlumno && rowLugar === idLugar && rowEstado !== "duplicado") {
      return true;
    }
  }
  return false;
}

function nextRegistroId_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return "REG-0001";
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const max = ids.reduce((acc, value) => {
    const match = String(value || "").match(/REG-(\d+)/i);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return "REG-" + String(max + 1).padStart(4, "0");
}

function formatFecha_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(value, CONFIG.TIME_ZONE, "dd/MM/yyyy");
  }
  return String(value || "").trim();
}

function get_(row, key) {
  return String(row[key] || "").trim();
}

function normalize_(value) {
  return String(value || "").trim().toLowerCase();
}

function isActive_(value) {
  return normalize_(value) === "activo" || normalize_(value) === "activa";
}

function output_(data, callback) {
  const json = JSON.stringify(data);
  if (callback) {
    return ContentService
      .createTextOutput(String(callback).replace(/[^\w.$]/g, "") + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
