# APP de asistencia de pasantias con QR

Solucion funcional para registrar asistencia de alumnos en pasantias mediante QR, tutor responsable y Google Sheets.

## Componentes

- `app-alumno`: credencial digital instalable para el alumno.
- `app-responsable`: app instalable para tutor/responsable que escanea y registra.
- `servidor-google-apps-script`: backend conectado a Google Sheets.
- `assets/logo-ispi-4019.jpg`: logo institucional.
- `docs`: documentacion viva del proyecto.
- `packs`: packs de instalacion para alumno y tutor.

## URLs publicadas

```text
https://bjcbaigo.github.io/qrasisispi4019/app-alumno/
https://bjcbaigo.github.io/qrasisispi4019/app-responsable/
```

## Flujo de uso

1. La institucion carga alumnos, tutores y lugares en Google Sheets.
2. Cada alumno recibe un token institucional guardado en `Alumnos!QR/Token`.
3. Cada tutor recibe un token individual guardado en `Responsables!TOKEN_APP`.
4. El alumno instala APP Alumno y carga su token.
5. APP Alumno muestra una credencial QR.
6. El tutor instala APP Tutor y carga la URL del servidor Apps Script y su token.
7. El tutor escanea el QR del alumno.
8. El servidor valida alumno, tutor, lugar y duplicados.
9. La asistencia se registra en la hoja `Asistencias`.

## Preparar Google Sheets

La planilla debe estar convertida a Google Sheets, no abierta solo como archivo `.xlsx`.

Hojas esperadas:

- `Alumnos`
- `Responsables`
- `Lugares`
- `Asistencias`
- `Listas`

Columnas clave:

### Alumnos

```text
ID_ALUMNO | Apellido y nombre | Curso | DNI/Legajo | ID_LUGAR | Lugar asignado | QR/Token | Estado
```

La columna `QR/Token` debe contener el token que usara el alumno en APP Alumno.

### Responsables

```text
ID_RESPONSABLE | Nombre | Correo/Login | ID_LUGAR | Lugar | Estado | Rol | TOKEN_APP
```

Agregar la columna `TOKEN_APP` si no existe. Ese token se entrega al tutor para usar APP Tutor.

### Asistencias

```text
ID_REGISTRO | Fecha | Hora | ID_ALUMNO | Alumno | ID_RESPONSABLE | Responsable | ID_LUGAR | Lugar | Metodo | Estado | Duplicado | Observaciones
```

## Instalar servidor Apps Script

1. Abrir la planilla en Google Sheets.
2. Ir a `Extensiones > Apps Script`.
3. Pegar el contenido de `servidor-google-apps-script/Code.gs`.
4. Configurar:

```js
SPREADSHEET_ID: "PEGAR_ID_DE_LA_PLANILLA",
ACCESS_KEY: "CAMBIAR_ESTA_CLAVE_ADMIN"
```

5. Desplegar como web app:
   - Ejecutar como: `Yo`
   - Acceso: `Cualquier usuario`
6. Copiar la URL terminada en `/exec`.
7. Probar:

```text
https://script.google.com/macros/s/.../exec?action=ping&key=CAMBIAR_ESTA_CLAVE_ADMIN
```

Debe responder:

```json
{"ok":true,"message":"Servidor activo."}
```

## Instalar en celulares

### Alumno

Usar el pack:

```text
packs/pack-alumno/INSTALAR_ALUMNO.md
```

### Tutor

Usar el pack:

```text
packs/pack-tutor/INSTALAR_TUTOR.md
```

## Seguridad aplicada

- El QR del alumno contiene solo token institucional.
- No se incluye DNI ni nombre en el QR.
- El tutor se valida por token individual.
- La fecha y hora se toman del servidor.
- El servidor valida que alumno y tutor pertenezcan al mismo lugar.
- Se marca duplicado si ya existe registro del mismo alumno, lugar y fecha.

Ver mas en:

```text
docs/SEGURIDAD.md
docs/DECISIONES_TECNICAS.md
docs/REGISTRO_FUNCIONAL.md
docs/CONFIGURACION_PLANILLA.md
docs/MANUAL_USUARIO_BORRADOR.md
```
