# Registro funcional del proyecto

## Version 2 - 15/06/2026

### Objetivo

Registrar asistencia de alumnos en pasantias mediante QR, con validacion realizada por un tutor/responsable y escritura automatica en Google Sheets.

### Funcionalidades implementadas

- APP Alumno funciona como credencial digital instalable.
- APP Alumno solicita token institucional y nombre visible.
- El QR del alumno contiene solo el token institucional, no DNI ni nombre.
- APP Alumno guarda token y nombre en el celular mediante almacenamiento local.
- APP Tutor funciona como PWA instalable.
- APP Tutor solicita URL del servidor Apps Script y token del tutor.
- APP Tutor escanea QR con camara del celular.
- APP Tutor permite carga manual del contenido QR para contingencia.
- APP Tutor muestra estado de registro: correcto, duplicado o error.
- APP Tutor mantiene historial local de ultimos registros del dia.
- Servidor Apps Script valida el token del alumno contra la columna `QR/Token`.
- Servidor Apps Script valida el token del tutor contra la columna `TOKEN_APP`.
- Servidor registra fecha y hora desde el servidor, no desde el celular.
- Servidor marca duplicados por alumno, lugar y fecha.

### Pendiente recomendado

- Agregar columna `TOKEN_APP` en la hoja `Responsables`.
- Generar tokens institucionales para alumnos y tutores.
- Crear manual final en PDF con capturas reales.
- Probar camara en celulares Android y iPhone usando GitHub Pages.
- Probar registro real contra Google Sheets ya convertida a formato nativo de Google.

## Version 1

- APP Alumno generaba QR con DNI, nombre y token local.
- APP Tutor usaba clave compartida y responsable escrito manualmente.
- Servidor validaba alumno por DNI, ID o token.

La version 2 mejora seguridad al evitar datos sensibles dentro del QR y al reemplazar la clave compartida por token individual de tutor.
