
# Plan: Cuentas de Correo Completas + Motor de Automatizaciones Avanzado

## Resumen

Dos grandes bloques: (1) sistema completo de cuentas de correo con soporte POP3/IMAP/SMTP, certificado SSL/TLS y persistencia en base de datos, y (2) motor de automatizaciones totalmente configurable con editor visual, multiples triggers, acciones encadenadas, filtros, programacion y vinculacion con cuentas de correo y plantillas.

---

## Bloque 1: Cuentas de Correo Persistentes

### Base de datos

Crear tabla `email_accounts` con todos los campos necesarios:

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid PK | Identificador |
| email | text | Direccion de correo |
| display_name | text | Nombre para mostrar en "From" |
| type | text | "gmail", "outlook", "imap" |
| status | text | "connected", "error", "testing" |
| imap_host | text | Servidor IMAP |
| imap_port | int | Puerto IMAP (993 por defecto) |
| pop3_host | text | Servidor POP3 (alternativa a IMAP) |
| pop3_port | int | Puerto POP3 (995 por defecto) |
| smtp_host | text | Servidor SMTP |
| smtp_port | int | Puerto SMTP (587 por defecto) |
| username | text | Usuario de autenticacion |
| password_encrypted | text | Contrasena (almacenada cifrada) |
| ssl_mode | text | "none", "ssl", "starttls" |
| incoming_protocol | text | "imap" o "pop3" |
| is_default | boolean | Cuenta predeterminada para envios |
| created_by | uuid | Usuario que la creo |
| created_at | timestamptz | Fecha creacion |
| updated_at | timestamptz | Fecha actualizacion |

RLS: usuarios autenticados pueden CRUD.

### Interfaz (SettingsEmailAccounts.tsx)

Reescritura completa con persistencia real:

- **Formulario de alta completo** con pestanas OAuth / Manual:
  - Pestana Manual: campos para email, nombre para mostrar, usuario, contrasena
  - Selector de protocolo entrante: IMAP o POP3
  - Campos de servidor y puerto para entrante (IMAP/POP3) y saliente (SMTP)
  - **Selector de seguridad SSL**: Ninguna, SSL/TLS, STARTTLS (con descripcion de cada opcion)
  - Puertos se auto-ajustan al cambiar el modo SSL (ej: IMAP 993 para SSL, 143 para ninguno)
  - Checkbox "Cuenta predeterminada"
- **Listado** con indicador de estado, protocolo, modo SSL
- **Edicion**: boton para editar cada cuenta (abre el mismo formulario pre-rellenado)
- **Eliminacion**: con dialogo de confirmacion
- **Boton probar conexion** (visual, prepara la logica para futura integracion con edge function)

### Edge Function: send-email

Crear `supabase/functions/send-email/index.ts` que:
- Recibe: `{ accountId, to, subject, body, html? }`
- Lee la cuenta de correo de la BD
- Usa la libreria Deno SMTP para enviar el email con la configuracion SSL correspondiente
- Devuelve exito o error
- Se usara desde las automatizaciones

---

## Bloque 2: Motor de Automatizaciones Avanzado

### Ampliacion de la tabla automations

La tabla `automations` ya existe con columnas `trigger_type`, `trigger_config` (jsonb), `actions` (jsonb). Se aprovechan estas columnas jsonb para almacenar configuraciones ricas sin necesidad de migrar la estructura.

### Dialogo de Creacion/Edicion de Automatizaciones

Nuevo componente `EditAutomationDialog.tsx` con formulario completo en secciones:

**Seccion 1 - Informacion basica:**
- Nombre de la automatizacion
- Descripcion

**Seccion 2 - Trigger (Cuando se dispara):**

Tipos de trigger disponibles:
| Trigger | Descripcion | Configuracion |
|---------|-------------|---------------|
| new_lead | Nuevo lead/cliente creado | Filtro por tipo de cliente, sector |
| status_change | Cambio de estado de cliente | Estado origen y destino |
| service_renewal | Servicio proximo a vencer | Dias antes del vencimiento (7, 15, 30, 60) |
| service_expired | Servicio vencido | Dias despues del vencimiento |
| task_overdue | Tarea vencida sin completar | Prioridad minima |
| task_completed | Tarea completada | Filtro por tipo |
| no_response | Sin respuesta del cliente | Dias sin actividad (3, 7, 14, 30) |
| contact_birthday | Cumpleanos del contacto | Dias antes |
| scheduled | Ejecucion programada | Frecuencia: diaria, semanal, mensual, dia y hora |
| manual | Ejecucion manual | Sin configuracion |

Cada trigger muestra campos de configuracion dinamicos segun su tipo.

**Seccion 3 - Condiciones/Filtros (Opcional):**
- Filtrar por etiquetas del cliente
- Filtrar por sector
- Filtrar por estado del cliente
- Filtrar por servicio asignado

**Seccion 4 - Acciones (Que hacer):**

Se pueden anadir multiples acciones en cadena. Tipos:

| Accion | Descripcion | Configuracion |
|--------|-------------|---------------|
| send_email | Enviar email | Cuenta de correo (select de email_accounts), plantilla o asunto/cuerpo manual, destinatarios (cliente, contacto, email personalizado) |
| send_bulk_email | Enviar email masivo | Cuenta de correo, plantilla, filtro de destinatarios (todos los clientes, por etiqueta, por sector, por estado) |
| create_task | Crear tarea | Titulo, descripcion, prioridad, asignado |
| create_event | Crear evento calendario | Titulo, fecha, descripcion |
| notify | Notificacion interna | Mensaje, destinatario(s) del equipo |
| send_whatsapp | Enviar WhatsApp | Plantilla, destinatario |
| send_telegram | Enviar Telegram | Mensaje, destinatario |
| update_status | Cambiar estado del cliente | Nuevo estado |
| add_tag | Anadir etiqueta al cliente | Etiqueta |
| wait | Esperar tiempo | Minutos/horas/dias antes de la siguiente accion |

Cada accion tiene su propio formulario de configuracion con selects, inputs y areas de texto. Las acciones se muestran como lista ordenada con botones de mover arriba/abajo y eliminar.

**Seccion 5 - Programacion (para trigger "scheduled"):**
- Frecuencia: una vez, diaria, semanal, mensual
- Dia de la semana (si semanal)
- Dia del mes (si mensual)
- Hora de ejecucion

### Pagina de Automatizaciones (Automations.tsx)

Reescritura completa:
- **Buscador** para filtrar automatizaciones por nombre
- **Listado mejorado**: cada tarjeta muestra nombre, estado, trigger, resumen de acciones, ultima ejecucion
- **Menu contextual** por automatizacion: Editar, Duplicar, Eliminar (con confirmacion)
- **Switch** para activar/desactivar
- **Boton "Ejecutar ahora"** para triggers manuales
- **Badge** con contador de acciones configuradas

---

## Seccion Tecnica

### Migracion SQL

```sql
CREATE TABLE public.email_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  display_name text DEFAULT '',
  type text NOT NULL DEFAULT 'imap',
  status text NOT NULL DEFAULT 'connected',
  incoming_protocol text DEFAULT 'imap',
  imap_host text,
  imap_port integer DEFAULT 993,
  pop3_host text,
  pop3_port integer DEFAULT 995,
  smtp_host text,
  smtp_port integer DEFAULT 587,
  username text,
  password_encrypted text,
  ssl_mode text DEFAULT 'ssl',
  is_default boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users full access email_accounts"
  ON public.email_accounts FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
```

### Archivos a crear/modificar

| Archivo | Cambio |
|---------|--------|
| Migracion SQL | Crear tabla `email_accounts` con RLS |
| `src/hooks/useSupabaseData.ts` | Anadir "email_accounts" al tipo TableName |
| `src/pages/settings/SettingsEmailAccounts.tsx` | Reescritura completa con persistencia, SSL, POP3, edicion, eliminacion |
| `src/pages/Automations.tsx` | Reescritura completa con buscador, menu contextual, duplicar, ejecutar |
| `src/components/dialogs/EditAutomationDialog.tsx` | Nuevo: dialogo completo de creacion/edicion con todas las secciones |
| `supabase/functions/send-email/index.ts` | Nuevo: edge function para envio de correos via SMTP |

### Flujo de envio de email desde automatizacion

```text
[Automatizacion activa con accion send_email]
       |
       v
[Leer email_account por ID de la accion]
       |
       v
[Leer plantilla o usar asunto/cuerpo manual]
       |
       v
[Reemplazar variables: {{nombre}}, {{servicio}}, {{fecha}}]
       |
       v
[Llamar edge function send-email con config SMTP + SSL]
       |
       v
[SMTP connect con ssl_mode -> enviar -> respuesta]
```

### Estructura del jsonb de acciones (ejemplo)

```json
[
  {
    "type": "send_email",
    "config": {
      "account_id": "uuid-de-cuenta",
      "template_id": "uuid-o-null",
      "subject": "Asunto manual",
      "body": "Cuerpo manual con {{nombre}}",
      "to": "client_email"
    }
  },
  {
    "type": "wait",
    "config": { "duration": 2, "unit": "days" }
  },
  {
    "type": "create_task",
    "config": {
      "title": "Seguimiento de {{nombre}}",
      "priority": "alta",
      "assignee": "admin"
    }
  }
]
```

### Estructura del jsonb de trigger_config (ejemplo scheduled)

```json
{
  "event": "scheduled",
  "frequency": "weekly",
  "day_of_week": 1,
  "hour": 9,
  "minute": 0,
  "filters": {
    "client_status": ["activo"],
    "tags": ["premium"]
  }
}
```
