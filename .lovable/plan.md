

# Plan: Cierre de sesion automatico por inactividad (10 minutos)

## Resumen

Crear un hook `useInactivityTimeout` que detecte la inactividad del usuario (sin clicks, movimientos de raton ni teclas) y cierre la sesion automaticamente tras 10 minutos. Se integrara en el `AuthProvider` para que aplique a toda la aplicacion cuando hay sesion activa.

## Como funciona

- Se monitorizan eventos del navegador: `mousemove`, `mousedown`, `keydown`, `touchstart`, `scroll`
- Cada evento reinicia un temporizador de 10 minutos (600.000 ms)
- Si el temporizador llega a cero sin actividad, se ejecuta `signOut()` automaticamente
- Se muestra un aviso con toast indicando que la sesion se cerro por inactividad
- Solo se activa cuando hay un usuario autenticado

## Seccion Tecnica

### Archivos a crear/modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useInactivityTimeout.ts` | Nuevo hook que gestiona el temporizador de inactividad |
| `src/contexts/AuthContext.tsx` | Integrar el hook dentro del provider, activandolo solo cuando `user` no es null |

### Hook useInactivityTimeout

```text
Parametros: { timeout: number, onTimeout: () => void, enabled: boolean }

Al montar (si enabled=true):
  - Registrar listeners en window para mousemove, mousedown, keydown, touchstart, scroll
  - Iniciar setTimeout de 10 min
  - Cada evento -> clearTimeout + nuevo setTimeout
  - Al expirar -> llamar onTimeout()

Al desmontar:
  - Limpiar todos los listeners y el timeout
```

### Integracion en AuthContext

Dentro del componente `AuthProvider`, usar el hook pasandole `signOut` como callback y `!!user` como `enabled`. Asi solo se activa el temporizador cuando hay sesion.
