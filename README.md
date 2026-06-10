# APP de asistencia de pasantias con QR

Solucion funcional compuesta por:

- `app-alumno`: APP1. El alumno carga DNI/legajo, nombre y apellido, y genera un QR unico.
- `app-responsable`: APP2. El responsable configura el servidor, se identifica y escanea el QR.
- `servidor-google-apps-script`: backend que valida contra Google Sheets y agrega filas en `Asistencias`.
- `assets/logo-ispi-4019.jpg`: logo institucional usado por las dos apps.

La solucion esta pensada para la plantilla `Plantilla_Asistencias_Pasantias_QR.xlsx`, que contiene las hojas `Alumnos`, `Responsables`, `Lugares`, `Asistencias` y `Listas`.

## Flujo

1. La institucion carga alumnos y responsables en Google Sheets.
2. El alumno abre `app-alumno/index.html`, completa DNI/legajo y nombre, y presiona `GENERAR`.
3. El responsable abre `app-responsable/index.html`, carga la URL del servidor Apps Script, la clave y su ID/correo.
4. El responsable escanea el QR del alumno.
5. El servidor busca el alumno en `Alumnos`, valida el responsable en `Responsables` y agrega el registro en `Asistencias`.
6. Si ya existe asistencia del mismo alumno, lugar y fecha, el registro se guarda como `Duplicado`.

## Preparar Google Sheets

1. Subir `Plantilla_Asistencias_Pasantias_QR.xlsx` a Google Drive.
2. Abrirla con Google Sheets.
3. Completar:
   - `Alumnos`: `ID_ALUMNO`, `Apellido y nombre`, `DNI/Legajo`, `ID_LUGAR`, `Lugar asignado`, `Estado`.
   - `Responsables`: `ID_RESPONSABLE`, `Nombre`, `Correo/Login`, `ID_LUGAR`, `Lugar`, `Estado`, `Rol`.
   - `Lugares`: datos del lugar.
4. Usar `Activo` en la columna `Estado` para alumnos y responsables habilitados.

## Instalar el servidor

1. En la planilla de Google Sheets, abrir `Extensiones > Apps Script`.
2. Copiar el contenido de `servidor-google-apps-script/Code.gs`.
3. Copiar tambien `servidor-google-apps-script/appsscript.json` si se edita el manifiesto.
4. En `Code.gs`, cambiar:

```js
SPREADSHEET_ID: "PEGAR_ID_DE_LA_PLANILLA",
ACCESS_KEY: "CAMBIAR_ESTA_CLAVE"
```

El `SPREADSHEET_ID` es la parte central de la URL de la planilla:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

5. Desplegar como web app:
   - Ejecutar como: `Yo`
   - Quien tiene acceso: `Cualquier usuario`
6. Copiar la URL terminada en `/exec`.
7. Probar en el navegador:

```text
https://script.google.com/macros/s/.../exec?action=ping&key=CAMBIAR_ESTA_CLAVE
```

Debe responder `{"ok":true,"message":"Servidor activo."}`.

## Usar APP1

Abrir `app-alumno/index.html` desde el celular o una computadora. Completar:

- DNI o legajo
- Nombre y apellido

Luego presionar `GENERAR`. El QR se puede mostrar en pantalla o descargar como imagen.

## Usar APP2

Abrir `app-responsable/index.html`. Completar una sola vez:

- URL del servidor Apps Script
- Clave de acceso configurada en `Code.gs`
- Responsable autorizado: puede ser `ID_RESPONSABLE` o `Correo/Login`

Presionar `Guardar configuracion` y luego `Escanear QR`.

Para usar la camara desde un celular, conviene publicar las apps en un hosting con HTTPS, por ejemplo GitHub Pages, Netlify o Google Drive/Apps Script. En algunos navegadores, abrir el archivo local puede bloquear la camara.

## Publicar en GitHub Pages

Repositorio sugerido:

```text
https://github.com/bjcbaigo/qrasisispi4019.git
```

Una vez subido y activado GitHub Pages, las apps quedaran en:

```text
https://bjcbaigo.github.io/qrasisispi4019/app-alumno/
https://bjcbaigo.github.io/qrasisispi4019/app-responsable/
```

## Validaciones implementadas

- Rechaza clave de acceso incorrecta.
- Rechaza responsable inexistente o inactivo.
- Rechaza alumno inexistente o inactivo.
- Valida que alumno y responsable pertenezcan al mismo `ID_LUGAR`.
- Registra fecha y hora del servidor.
- Genera `ID_REGISTRO` incremental.
- Marca duplicados por mismo alumno, lugar y fecha.
- Guarda las columnas de `Asistencias` segun la plantilla.

## Nota de seguridad

El QR incluye DNI/legajo y nombre porque la consigna pide que APP1 solicite esos datos. De todos modos, el servidor no confia ciegamente en el QR: busca el alumno real en la hoja `Alumnos` y registra los datos maestros de la planilla.

Para una version mas segura, conviene entregar a cada alumno un token previamente generado por la institucion en la columna `QR/Token` y hacer que APP1 use solo ese token, sin DNI ni nombre dentro del QR.
