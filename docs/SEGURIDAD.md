# Seguridad

## Mejoras aplicadas

- El QR del alumno ya no contiene DNI ni nombre.
- El QR contiene solo un token institucional.
- El servidor no confia en datos escritos por el alumno.
- El alumno real se busca en la hoja `Alumnos` mediante `QR/Token`.
- El tutor se valida por token individual en `Responsables!TOKEN_APP`.
- El registro usa fecha y hora del servidor.
- Se valida que alumno y tutor pertenezcan al mismo `ID_LUGAR`.
- Se marcan posibles duplicados.

## Riesgos residuales

- Si un alumno comparte su token o QR, otra persona podria mostrarlo.
- Si un tutor comparte su token, otro dispositivo podria registrar asistencias.
- JSONP no es ideal para informacion sensible.
- El token queda guardado en el almacenamiento local del celular.

## Recomendaciones operativas

- Generar tokens largos y no faciles de adivinar.
- Revocar token ante perdida de celular.
- No compartir capturas del QR del alumno.
- No compartir token de tutor.
- Revisar duplicados en la hoja `Asistencias`.
- Mantener la planilla con permisos restringidos.

## Formato sugerido de tokens

Alumno:

```text
ALU-A001-2026-X9K2M7
```

Tutor:

```text
TUT-R001-2026-K4P8Z2
```

No usar DNI como token.
