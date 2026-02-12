

# Plan: Confirmacion de Lectura, Indicador de No Leidos y Badge en Sidebar

## Resumen

Anadir un sistema completo de estados de mensaje (entregado/leido) con checks visuales en las burbujas, puntos de aviso en la lista de chats para conversaciones con mensajes sin leer, y un badge en el menu lateral indicando mensajes pendientes.

## 1. Cambio en Base de Datos

Agregar columna `status` a la tabla `internal_messages`:
- Valores: `sent` (enviado), `delivered` (entregado), `read` (leido)
- Default: `delivered` (al insertarse ya se considera entregado)

Tambien se necesita una politica RLS para permitir UPDATE del campo `status` en mensajes de chats donde el usuario participa.

```sql
ALTER TABLE public.internal_messages ADD COLUMN status text NOT NULL DEFAULT 'delivered';

-- Permitir UPDATE solo del status para participantes del chat
CREATE POLICY "Users can update message status in their chats"
  ON public.internal_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM internal_chats
      WHERE internal_chats.id = internal_messages.chat_id
      AND (internal_chats.user1_id = auth.uid() OR internal_chats.user2_id = auth.uid())
    )
  );
```

## 2. Confirmacion de Lectura (Checks en Burbujas)

En `InternalChat.tsx`, para los mensajes enviados por el usuario actual:
- 1 check gris = `delivered` (entregado)
- 2 checks azules = `read` (leido)

Cuando el usuario abre un chat o recibe un mensaje en el chat abierto, se ejecuta un UPDATE masivo marcando como `read` todos los mensajes del otro usuario en ese chat que no esten ya leidos.

Escuchar cambios Realtime en `internal_messages` para evento UPDATE (cambio de status) y actualizar el estado local de los checks en tiempo real.

## 3. Punto de No Leidos en Lista de Chats

En la lista de conversaciones del panel izquierdo de `InternalChat.tsx`:
- Consultar cuantos mensajes tienen `status != 'read'` y `sender_id != user.id` por cada chat
- Mostrar un punto azul junto al nombre de la conversacion si hay mensajes sin leer

## 4. Badge en Sidebar

En `AppSidebar.tsx`:
- Crear un hook o consulta que cuente el total de mensajes no leidos del usuario (mensajes donde `sender_id != user.id` y `status != 'read'` en chats donde participa)
- Suscribirse a cambios Realtime para actualizar el contador
- Mostrar un badge numerico junto al icono/label "Chat" en la navegacion

## Seccion Tecnica

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| Migracion SQL | Anadir columna `status` + politica RLS UPDATE |
| `src/pages/InternalChat.tsx` | Checks en burbujas, marcar como leido al abrir, punto de no leidos en lista |
| `src/components/layout/AppSidebar.tsx` | Badge con contador de mensajes no leidos |
| `src/components/ChatNotificationListener.tsx` | Sin cambios significativos |

### Flujo de estados del mensaje

```text
[Enviar mensaje] --> status = 'delivered' (default)
       |
       v
[Receptor abre el chat] --> UPDATE status = 'read' (todos los no leidos del otro usuario)
       |
       v
[Realtime UPDATE event] --> Emisor ve los checks cambiar a doble check azul
```

### Logica de marcar como leido

Al seleccionar un chat o al recibir un nuevo mensaje en el chat activo:
```text
UPDATE internal_messages
SET status = 'read'
WHERE chat_id = :chatId
  AND sender_id != :userId
  AND status != 'read'
```

### Checks visuales (solo en mensajes propios)

- `delivered`: un icono `Check` en gris (10px)
- `read`: un icono `CheckCheck` en azul (10px)

Ambos se posicionan al lado de la hora en la burbuja del mensaje.

### Badge en sidebar

- Consulta al montar: contar mensajes donde `sender_id != user.id` AND `status != 'read'` en chats del usuario
- Suscripcion Realtime a INSERT y UPDATE en `internal_messages` para recalcular
- Se muestra como un circulo rojo con numero junto al icono de Chat

