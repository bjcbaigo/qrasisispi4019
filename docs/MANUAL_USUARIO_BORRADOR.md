# Manual de usuario - borrador

## Alumno

1. Abrir la URL de APP Alumno.
2. Agregar la app a la pantalla principal.
3. Ingresar el token institucional entregado por la institucion.
4. Ingresar nombre visible para la credencial.
5. Presionar `GUARDAR Y MOSTRAR QR`.
6. Al llegar al lugar de pasantia, mostrar el QR al tutor.

## Tutor

1. Abrir la URL de APP Tutor.
2. Agregar la app a la pantalla principal.
3. Ingresar la URL del servidor Apps Script.
4. Ingresar el token de tutor entregado por la institucion.
5. Presionar `Guardar`.
6. Presionar `Escanear QR`.
7. Apuntar la camara al QR del alumno.
8. Verificar el mensaje:
   - verde: asistencia registrada.
   - amarillo: asistencia registrada como duplicada.
   - rojo: registro rechazado o error.

## Administrador

1. Convertir la plantilla Excel a Google Sheets.
2. Completar alumnos, responsables y lugares.
3. Agregar tokens en `Alumnos!QR/Token`.
4. Agregar tokens en `Responsables!TOKEN_APP`.
5. Pegar `Code.gs` en Apps Script.
6. Configurar `SPREADSHEET_ID` y `ACCESS_KEY`.
7. Desplegar Apps Script como web app.
8. Entregar URL de APP Alumno, URL de APP Tutor, tokens de alumnos y tokens de tutores.
