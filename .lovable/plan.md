

# Plan: Motor de Ejecucion de Automatizaciones

## Problema Detectado

Las automatizaciones se guardan correctamente en la base de datos, pero **no existe ningun mecanismo backend que las ejecute**. Cuando se crea un nuevo cliente, nadie consulta las automatizaciones activas con trigger `new_lead` ni llama a la funcion `send-email`. El boton "Ejecutar ahora" solo muestra un toast visual sin hacer nada real.

Faltan dos piezas criticas:
1. Una funcion backend que procese automatizaciones (lea las reglas, resuelva destinatarios, ejecute acciones)
2. Un mecanismo que dispare esa funcion cuando ocurren eventos (creacion de cliente, etc.)

## Solucion

### 1. Nueva funcion backend: `run-automation`

Crear `supabase/functions/run-automation/index.ts` que:

- Recibe un evento con tipo (`new_lead`, `manual`, etc.) y datos del contexto (ID del cliente, email, nombre)
- Busca todas las automatizaciones activas cuyo `trigger_type` coincida
- Para cada automatizacion, recorre sus acciones en orden:
  - `send_email`: resuelve el destinatario (email del cliente o custom), reemplaza variables `{{nombre}}`, `{{empresa}}`, y llama internamente a la funcion `send-email`
  - `create_task`: inserta una tarea en la tabla `tasks`
  - `update_status`: actualiza el estado del cliente
  - `add_tag`: anade etiqueta al cliente
  - Otras acciones: se registran como pendientes (para futuras implementaciones)

### 2. Disparar automatizaciones desde el frontend

Modificar `Clients.tsx` para que al crear un cliente, llame a `run-automation` con el evento `new_lead` y los datos del cliente recien creado.

Modificar `Automations.tsx` para que el boton "Ejecutar ahora" llame a `run-automation` con el evento `manual`.

### 3. Mejora en `send-email`

Anadir soporte para STARTTLS en la funcion de envio. Actualmente solo distingue entre `ssl` y no-ssl, pero falta el modo `starttls` que es el mas comun en puerto 587.

## Seccion Tecnica

### Archivos a crear/modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/run-automation/index.ts` | Nueva funcion que procesa automatizaciones segun evento |
| `supabase/functions/send-email/index.ts` | Mejorar soporte STARTTLS |
| `src/pages/Clients.tsx` | Llamar a `run-automation` tras crear cliente |
| `src/pages/Automations.tsx` | Conectar boton "Ejecutar ahora" con `run-automation` |
| `supabase/config.toml` | No se modifica (auto-gestionado), pero se necesita `verify_jwt = false` para la funcion |

### Flujo de ejecucion

```text
[Cliente creado en Clients.tsx]
       |
       v
[POST /run-automation { event: "new_lead", client: { id, name, email } }]
       |
       v
[run-automation lee automations WHERE trigger_type='new_lead' AND is_active=true]
       |
       v
[Para cada automatizacion, recorre actions[]]
       |
       +-- send_email --> lee email_accounts, reemplaza variables, POST /send-email
       +-- create_task --> INSERT INTO tasks
       +-- update_status --> UPDATE clients SET status
       +-- add_tag --> UPDATE clients SET tags
```

### Reemplazo de variables en emails

La funcion `run-automation` reemplazara las siguientes variables en asunto y cuerpo:
- `{{nombre}}` -> nombre del cliente
- `{{email}}` -> email del cliente
- `{{empresa}}` -> nombre del cliente (si es empresa)
- `{{fecha}}` -> fecha actual

### Configuracion STARTTLS en send-email

```text
ssl_mode = "ssl"      -> tls: true (conexion SSL directa)
ssl_mode = "starttls" -> tls: false + pool: false (inicia sin cifrado, negocia TLS)
ssl_mode = "none"     -> tls: false
```

