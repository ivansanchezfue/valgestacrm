

# Plan: Chat Interno Funcional entre Usuarios del CRM

## Resumen

Crear un sistema de chat interno completamente funcional que permita a los usuarios del CRM comunicarse entre si, buscar destinatarios, enviar mensajes en tiempo real y eliminar conversaciones.

## Cambios en la Base de Datos

Se crearan dos nuevas tablas dedicadas al chat interno (separadas de las tablas `conversations`/`messages` existentes que son para el inbox omnicanal):

- **`internal_chats`**: Almacena los hilos de conversacion entre dos usuarios
  - `id`, `user1_id`, `user2_id`, `last_message`, `last_message_at`, `created_at`
  
- **`internal_messages`**: Almacena los mensajes individuales
  - `id`, `chat_id` (FK a internal_chats), `sender_id`, `body`, `created_at`

Se habilitara **realtime** en ambas tablas para que los mensajes aparezcan instantaneamente.

Politicas RLS: los usuarios solo podran ver y modificar chats en los que participan.

## Cambios en la Interfaz

### Nueva pagina: Chat Interno (ruta `/chat`)

Reemplazara la funcionalidad actual del Inbox (que seguira existiendo para el omnicanal). Se anadira un nuevo enlace "Chat" en el sidebar.

**Panel izquierdo - Lista de conversaciones:**
- Barra de busqueda con desplegable (Popover + Command) que consulta la tabla `profiles` para encontrar usuarios del CRM
- Al seleccionar un usuario, se crea o abre la conversacion existente
- Cada conversacion muestra avatar, nombre y ultimo mensaje
- Menu de tres puntos (DropdownMenu) en cada conversacion con opcion "Eliminar conversacion"

**Panel derecho - Area de chat:**
- Cabecera con nombre del usuario y menu de opciones
- Area de mensajes con scroll, burbujas diferenciadas (enviado vs recibido)
- Campo de texto con boton de enviar funcional
- Los mensajes se cargan desde `internal_messages` y se actualizan en tiempo real via Supabase Realtime

### Funcionalidades clave:
1. **Enviar mensajes**: El boton Send inserta en `internal_messages` y actualiza `last_message` en `internal_chats`
2. **Eliminar conversaciones**: El menu de tres puntos ejecuta un DELETE en `internal_chats` (cascade elimina mensajes)
3. **Buscar usuarios**: Un componente Command/Popover consulta `profiles` y permite iniciar nuevas conversaciones
4. **Tiempo real**: Suscripcion a cambios en `internal_messages` para recibir mensajes instantaneamente

## Seccion Tecnica

### Migracion SQL

```sql
CREATE TABLE public.internal_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES public.profiles(id),
  user2_id uuid NOT NULL REFERENCES public.profiles(id),
  last_message text,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

CREATE TABLE public.internal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.internal_chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id),
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS policies: users can only access their own chats
-- Realtime enabled on both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_messages;
```

### Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| `src/pages/InternalChat.tsx` | Crear - Pagina completa del chat interno |
| `src/App.tsx` | Modificar - Anadir ruta `/chat` |
| `src/components/layout/AppSidebar.tsx` | Modificar - Anadir enlace "Chat" al menu |
| Migracion SQL | Crear tablas `internal_chats` e `internal_messages` |

### Flujo de datos

```text
[Buscar usuario] --> profiles table
        |
        v
[Crear/abrir chat] --> internal_chats (upsert)
        |
        v
[Cargar mensajes] --> internal_messages (SELECT WHERE chat_id)
        |
        v
[Enviar mensaje] --> INSERT internal_messages + UPDATE internal_chats.last_message
        |
        v
[Realtime] --> supabase.channel('internal_messages').on('postgres_changes')
        |
        v
[Eliminar chat] --> DELETE internal_chats (CASCADE borra mensajes)
```

### Componentes UI utilizados
- `Command` + `Popover` para el buscador de usuarios
- `DropdownMenu` para el menu de tres puntos (con opcion eliminar)
- `ScrollArea` para el area de mensajes
- `Input` + `Button` para enviar mensajes
- `AlertDialog` para confirmar eliminacion

La pagina de Inbox existente se mantiene intacta para el sistema omnicanal.

