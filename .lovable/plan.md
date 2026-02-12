
# Plan: 2FA Operativo con Google Authenticator (TOTP)

## Resumen

Implementar autenticacion de dos factores completamente funcional usando la API MFA nativa del backend. El usuario podra activar 2FA desde Seguridad, escanear un QR real, verificar con un codigo de 6 digitos, y en cada inicio de sesion se le pedira el codigo TOTP.

## 1. Pagina de Seguridad - Activar/Desactivar 2FA

Reescribir la seccion 2FA en `SettingsSecurity.tsx`:

- **Activar 2FA**: Al pulsar el switch, llamar a `supabase.auth.mfa.enroll({ factorType: 'totp' })` que devuelve un SVG del QR y un secreto manual.
- **Mostrar QR**: Renderizar el SVG del codigo QR directamente en la pagina junto con la clave secreta en texto (para introduccion manual).
- **Verificar**: El usuario introduce el codigo de 6 digitos de su app. Se llama a `supabase.auth.mfa.challenge()` y luego `supabase.auth.mfa.verify()` para activar el factor.
- **Desactivar 2FA**: Llamar a `supabase.auth.mfa.unenroll({ factorId })` para eliminar el factor.
- **Estado inicial**: Al cargar la pagina, consultar `supabase.auth.mfa.listFactors()` para saber si ya tiene 2FA activo.

Se usara el componente `InputOTP` que ya existe en el proyecto para la entrada del codigo de 6 digitos.

## 2. Login con 2FA

Modificar `Auth.tsx` y `AuthContext.tsx` para soportar el flujo MFA en el login:

- Tras `signInWithPassword`, verificar el nivel de autenticacion (AAL) con `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`.
- Si el usuario tiene factores TOTP verificados y el nivel actual es `aal1` (solo contrasena), mostrar un segundo paso pidiendo el codigo de 6 digitos.
- Llamar a `challenge()` + `verify()` con el codigo introducido para completar el login a nivel `aal2`.
- Solo entonces navegar al dashboard.

## 3. Proteccion de Rutas

Actualizar `AuthContext.tsx` para exponer el estado MFA:
- Nuevo campo `needsMfa: boolean` en el contexto.
- En `Auth.tsx`, si `needsMfa` es true tras el login, mostrar el formulario de codigo TOTP en lugar de redirigir.

## Seccion Tecnica

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/settings/SettingsSecurity.tsx` | Reescribir seccion 2FA: enroll real con QR, verify, unenroll, listFactors |
| `src/pages/Auth.tsx` | Anadir paso 2 de MFA tras login con contrasena |
| `src/contexts/AuthContext.tsx` | Exponer estado MFA y metodo para verificar challenge |

### Flujo de activacion de 2FA (Seguridad)

```text
[Switch ON] --> mfa.enroll({ factorType: 'totp' })
     |
     v
[Mostrar QR SVG + secreto manual]
     |
     v
[Usuario escanea QR en Google Authenticator]
     |
     v
[Introduce codigo 6 digitos] --> mfa.challenge({ factorId })
     |                                    |
     v                                    v
                                   mfa.verify({ factorId, challengeId, code })
     |
     v
[2FA activado - factor verificado]
```

### Flujo de login con 2FA

```text
[Email + Password] --> signInWithPassword()
     |
     v
[mfa.getAuthenticatorAssuranceLevel()]
     |
     +-- currentLevel == 'aal1' AND nextLevel == 'aal2'
     |       |
     |       v
     |   [Mostrar input TOTP de 6 digitos]
     |       |
     |       v
     |   mfa.challenge({ factorId }) --> mfa.verify({ factorId, challengeId, code })
     |       |
     |       v
     |   [Login completo - navegar a /]
     |
     +-- currentLevel == 'aal1' AND nextLevel == 'aal1' (sin 2FA)
             |
             v
         [Login completo - navegar a /]
```

### API de Supabase MFA utilizada

- `supabase.auth.mfa.enroll({ factorType: 'totp' })` - Devuelve `{ id, type, totp: { qr_code, secret, uri } }`
- `supabase.auth.mfa.challenge({ factorId })` - Devuelve `{ id }` (challenge ID)
- `supabase.auth.mfa.verify({ factorId, challengeId, code })` - Verifica el codigo TOTP
- `supabase.auth.mfa.unenroll({ factorId })` - Elimina el factor
- `supabase.auth.mfa.listFactors()` - Lista factores activos
- `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` - Devuelve `{ currentLevel, nextLevel }`
