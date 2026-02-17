
# Plan: Personalizacion de la Aplicacion Web

## Resumen

Crear una nueva seccion de ajustes "Personalizacion" que permita:
- **Administradores**: cambiar el nombre de la app y subir un favicon personalizado (configuracion global)
- **Todos los usuarios**: personalizar los colores del menu lateral (configuracion por usuario)

## Arquitectura

### Almacenamiento de datos

Se usara la tabla existente `app_settings` para guardar las preferencias:

| Clave | Tipo | Quien puede modificar |
|-------|------|----------------------|
| `app_name` | global (user_id = NULL) | Solo admin |
| `favicon_url` | global (user_id = NULL) | Solo admin |
| `sidebar_colors` | por usuario (user_id = auth.uid()) | Cada usuario |

El favicon se subira al bucket `branding` que ya existe en el storage.

Las politicas RLS ya existentes cubren estos permisos:
- Admins pueden insertar/actualizar/eliminar configuraciones globales
- Cada usuario puede gestionar sus propias configuraciones
- Todos los autenticados pueden leer configuraciones globales

### Contexto global: BrandingContext

Un nuevo contexto React que:
1. Al montar, lee las configuraciones globales (`app_name`, `favicon_url`) de `app_settings`
2. Lee las configuraciones de usuario (`sidebar_colors`) de `app_settings`
3. Aplica los colores del sidebar como CSS custom properties en el `document.documentElement`
4. Actualiza el `<title>` del documento y el `<link rel="icon">` dinamicamente
5. Expone funciones para actualizar cada configuracion

### Colores personalizables del menu

Los usuarios podran elegir entre presets de color para el menu lateral (sidebar). Cada preset define las variables CSS:
- `--sidebar-background`
- `--sidebar-accent`
- `--sidebar-border`
- `--sidebar-primary`

Se ofrecen 6-8 presets predefinidos (azul oscuro actual, gris, verde, morado, rojo, etc.) con un selector visual de circulos de color.

## Seccion Tecnica

### Archivos a crear

| Archivo | Descripcion |
|---------|-------------|
| `src/contexts/BrandingContext.tsx` | Contexto que carga y aplica nombre, favicon y colores del sidebar |
| `src/pages/settings/SettingsCustomization.tsx` | Pagina de ajustes de personalizacion con formulario admin (nombre + favicon) y selector de colores para todos |

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Envolver con `BrandingProvider`, anadir ruta `/settings/customization` |
| `src/pages/SettingsPage.tsx` | Anadir entrada "Personalizacion" en la seccion "Cuenta" |
| `src/pages/Auth.tsx` | Usar `useBranding()` para mostrar el nombre dinamico y favicon |
| `src/components/layout/AppSidebar.tsx` | Usar `useBranding()` para mostrar el nombre dinamico |
| `src/components/layout/AppLayout.tsx` | Usar `useBranding()` para el nombre en header movil |
| `index.html` | Anadir un `<link rel="icon">` por defecto (se actualizara dinamicamente) |

### Flujo del BrandingContext

```text
BrandingProvider monta
  |
  +-- useQuery("app_settings", { filters: { user_id: null } })  --> app_name, favicon_url
  +-- useQuery("app_settings", { filters: { user_id: auth.uid() } }) --> sidebar_colors
  |
  +-- useEffect: document.title = appName
  +-- useEffect: link[rel="icon"].href = faviconUrl
  +-- useEffect: document.documentElement.style.setProperty("--sidebar-background", ...)
```

### Pagina SettingsCustomization

La pagina tendra dos secciones:

**Seccion 1 - Marca (solo visible para admins)**
- Campo de texto para el nombre de la app
- Boton para subir favicon (sube al bucket `branding`, guarda la URL publica en `app_settings`)
- Preview del favicon actual

**Seccion 2 - Colores del Menu (visible para todos)**
- Grid de presets de color como circulos clicables
- Preview en miniatura del sidebar con los colores seleccionados
- Boton guardar

### Deteccion de rol admin

Se consultara la tabla `user_roles` para verificar si el usuario actual tiene rol `admin`:

```text
SELECT role FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
```

### Presets de colores del sidebar

```text
Azul Oscuro (default): sidebar-bg: 222 47% 11%, accent: 222 40% 16%
Gris Pizarra:          sidebar-bg: 215 28% 17%, accent: 215 25% 22%
Verde Bosque:          sidebar-bg: 160 30% 12%, accent: 160 25% 17%
Morado Noche:          sidebar-bg: 270 35% 14%, accent: 270 30% 19%
Rojo Granate:          sidebar-bg: 0 30% 14%,   accent: 0 25% 19%
Azul Marino:           sidebar-bg: 210 50% 12%, accent: 210 45% 17%
```

### Aplicacion de colores

Los colores del sidebar se aplican como inline CSS custom properties en `:root` via JavaScript, sobreescribiendo los valores por defecto definidos en `index.css`. Esto funciona tanto en modo claro como oscuro porque las variables del sidebar son independientes del tema.

La clase `.sidebar-gradient` en `index.css` se actualizara para usar `var(--sidebar-background)` en vez de valores hardcodeados.
