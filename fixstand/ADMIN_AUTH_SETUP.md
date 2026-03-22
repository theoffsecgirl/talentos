# Protección de /admin

Este proyecto protege únicamente `/admin` con usuario y contraseña mediante variables de entorno:

- `ADMIN_USER`
- `ADMIN_PASSWORD`

## Dónde se aplica

- Página: `/admin`
- Exportación del admin general: `/api/admin/private/export`
- Eliminación desde el admin general: `/api/admin/private/submissions`

`/sancristobal/admin` queda sin esta protección.
