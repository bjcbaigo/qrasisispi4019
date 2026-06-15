# Decisiones tecnicas

## Arquitectura

La solucion se divide en tres piezas:

- `app-alumno`: credencial digital del alumno.
- `app-responsable`: escaner y registrador usado por tutor/responsable.
- `servidor-google-apps-script`: backend conectado a Google Sheets.

## Publicacion

Las apps se publican en GitHub Pages:

```text
https://bjcbaigo.github.io/qrasisispi4019/app-alumno/
https://bjcbaigo.github.io/qrasisispi4019/app-responsable/
```

GitHub Pages ofrece HTTPS, necesario para que los celulares habiliten camara en APP Tutor.

## PWA

Se agregaron:

- `manifest.webmanifest`
- `service-worker.js`
- icono institucional
- `theme-color`

Esto permite instalar las apps como accesos directos tipo aplicacion desde Android o iPhone.

## Google Sheets

La planilla debe tener:

- `Alumnos`
- `Responsables`
- `Lugares`
- `Asistencias`

La hoja `Responsables` debe sumar la columna:

```text
TOKEN_APP
```

La hoja `Alumnos` ya contiene:

```text
QR/Token
```

## Comunicacion con Apps Script

Se mantiene JSONP porque Google Apps Script y GitHub Pages pueden presentar restricciones CORS en escenarios simples. JSONP permite una integracion directa desde una pagina estatica.

Para una version productiva mas avanzada, conviene reemplazarlo por:

- backend propio con CORS controlado, o
- Apps Script publicado con interfaz mas restringida, o
- autenticacion real con cuentas Google.
