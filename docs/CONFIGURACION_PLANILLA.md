# Configuracion de la planilla

## Hoja Alumnos

La columna `QR/Token` debe contener un token unico por alumno.

Ejemplo:

```text
ID_ALUMNO | Apellido y nombre | Curso | DNI/Legajo | ID_LUGAR | Lugar asignado | QR/Token              | Estado
A001      | Perez, Juan       | 1 ano | 12345      | L001     | Empresa XX     | ALU-A001-2026-X9K2M7 | Activo
```

El alumno cargara ese token en APP Alumno.

## Hoja Responsables

Agregar una columna nueva al final:

```text
TOKEN_APP
```

Ejemplo:

```text
ID_RESPONSABLE | Nombre         | Correo/Login   | ID_LUGAR | Lugar      | Estado | Rol       | TOKEN_APP
R001           | Responsable XX | resp@local.com | L001     | Empresa XX | Activo | Validador | TUT-R001-2026-K4P8Z2
```

El tutor cargara ese token en APP Tutor.

### Si Google Sheets muestra "No valido" en TOKEN_APP

Puede ocurrir si la columna `TOKEN_APP` hereda una validacion de datos de otra columna, por ejemplo una lista desplegable pensada para `Rol`, `Estado` u otra columna.

Solucion:

1. Seleccionar toda la columna `TOKEN_APP`.
2. Ir a `Datos > Validacion de datos`.
3. Eliminar la regla aplicada a esa columna, o cambiarla a texto libre.
4. Verificar que `TOKEN_APP` no tenga lista desplegable.
5. Cargar nuevamente el token, por ejemplo:

```text
RES-R001-2026-X9K2
```

La columna `TOKEN_APP` debe aceptar texto libre. No debe usar la lista de roles ni estados.

## Reglas recomendadas

- Un token por alumno.
- Un token por tutor.
- No usar DNI como token.
- No repetir tokens.
- Si se pierde un celular, cambiar el token correspondiente en la planilla.
- Mantener `Estado = Activo` solo para alumnos y tutores habilitados.

## Formula opcional para detectar tokens repetidos

En una columna auxiliar de `Alumnos`, se puede usar:

```text
=COUNTIF($G:$G,G2)>1
```

En `Responsables`, ajustando la columna donde este `TOKEN_APP`:

```text
=COUNTIF($H:$H,H2)>1
```
