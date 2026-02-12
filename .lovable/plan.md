

# Plan: Chat Interno Mejorado + Eliminar Inbox

## Resumen

Corregir el chat interno para que funcione con mensajeria en tiempo real, indicador de "escribiendo...", notificaciones popup de nuevos mensajes, y eliminar la pagina Inbox del CRM.

## 1. Eliminar Inbox

- Borrar `src/pages/Inbox.tsx`
- Eliminar la ruta `/inbox` de `App.tsx`
- Eliminar el enlace "Inbox" del sidebar en `AppSidebar.tsx`

## 2. Chat Interno - Correccion Tiempo Real

El codigo actual ya tiene suscripcion Realtime pero con problemas:
- Mensajes duplicados (no hay deduplicacion)
- No hay fallback si Realtime falla

Cambios en `InternalChat.tsx`:
- Deduplicar mensajes por `id` al recibir via Realtime
- Anadir polling de respaldo con backoff exponencial (2s inicial, max 30s)
- Verificar que envio y eliminacion funcionan correctamente

## 3. Indicador "Escribiendo..."

Usar Supabase Realtime Broadcast (no requiere tablas adicionales):
- Cuando el usuario escribe, enviar un evento `typing` al canal del chat
- El otro usuario escucha ese evento y muestra "Escribiendo..." debajo del header
- El indicador desaparece automaticamente tras 3 segundos sin eventos

## 4. Notificacion Popup de Nuevo Mensaje

Crear un componente global `ChatNotificationListener` que:
- Se monta en `AppLayout.tsx` (fuera del chat)
- Escucha INSERT en `internal_messages` donde el usuario actual participa en el chat
- Si el usuario NO esta en la ruta `/chat` o el chat abierto es diferente, muestra un toast con el nombre del remitente y preview del mensaje
- Al hacer clic en el toast, navega a `/chat` y selecciona la conversacion

## Seccion Tecnica

### Archivos a modificar/crear

| Archivo | Accion |
|---------|--------|
| `src/pages/Inbox.tsx` | Eliminar |
| `src/App.tsx` | Quitar ruta `/inbox` e import |
| `src/components/layout/AppSidebar.tsx` | Quitar enlace Inbox |
| `src/pages/InternalChat.tsx` | Reescribir con Realtime robusto, typing indicator, deduplicacion |
| `src/components/ChatNotificationListener.tsx` | Crear - listener global de notificaciones |
| `src/components/layout/AppLayout.tsx` | Montar ChatNotificationListener |

### Realtime robusto (InternalChat.tsx)

```text
Suscripcion postgres_changes INSERT -> internal_messages (filtrado por chat_id)
  + deduplicacion por msg.id
  + polling fallback cada 2-30s con backoff
```

### Typing indicator (Broadcast)

```text
Canal: typing:{chat_id}
Evento broadcast "typing" con { user_id }
Timeout 3s para ocultar indicador
Envio con debounce de 1s al escribir
```

### Notificacion global (ChatNotificationListener)

```text
Suscripcion postgres_changes INSERT -> internal_messages
Filtro: solo mensajes donde sender_id != usuario actual
Si ruta actual != /chat o chat seleccionado != chat del mensaje:
  -> toast.info con nombre del remitente y preview
  -> onClick: navigate('/chat') con state para abrir conversacion
```

Para obtener el nombre del remitente, se consultara la tabla `profiles` y se mantendra un cache local.

