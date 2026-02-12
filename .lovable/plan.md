
# Plan: Observaciones, Documentos en Clientes y Confirmacion de Eliminacion

## Resumen

Tres mejoras: (1) campo de observaciones en el perfil de cada cliente, (2) subida y gestion de documentos asociados a clientes, (3) dialogo de confirmacion antes de eliminar clientes y contactos.

## 1. Confirmacion de Eliminacion en Clientes y Contactos

Ya existe el componente `DeleteConfirmDialog` pero no se usa en las paginas de Clientes ni Contactos. Actualmente al pulsar "Eliminar" se borra directamente sin confirmacion.

**Cambios:**
- En `Clients.tsx`: reemplazar el `DropdownMenuItem` de eliminar por un `DeleteConfirmDialog` con mensaje personalizado ("¿Estas seguro de eliminar este cliente?")
- En `Contacts.tsx`: lo mismo para contactos
- Se usara el estado `deleteId` para controlar que registro se va a eliminar con un `AlertDialog` controlado (no dentro del dropdown, para evitar problemas de cierre)

## 2. Campo de Observaciones en el Perfil del Cliente

La tabla `clients` ya tiene una columna `notes` (text, nullable). Solo falta exponerla en la UI.

**Cambios:**
- En `EditClientDialog.tsx`: anadir un campo `Textarea` para "Observaciones" que mapee a `notes`, ocupando el ancho completo del formulario
- Actualizar el estado del formulario para incluir `notes`

## 3. Subida de Documentos por Cliente

Se necesita almacenamiento de archivos vinculados a cada cliente.

**Base de datos:**
- Crear un bucket de Storage llamado `client-documents` (publico para lectura, con RLS)
- Crear tabla `client_documents` con columnas: `id`, `client_id`, `file_name`, `file_path`, `file_type`, `file_size`, `uploaded_by`, `created_at`
- RLS: usuarios autenticados pueden CRUD

**Interfaz:**
- En `EditClientDialog.tsx`: anadir una seccion con pestanas (Tabs) separando "Datos" y "Documentos"
- Pestana "Documentos": input de archivo, lista de documentos subidos con nombre/tipo/fecha, boton de descarga y boton de eliminar cada documento
- Formatos aceptados: PDF, JPG, PNG, XML, XLSX, DOC, etc.

## Seccion Tecnica

### Migracion SQL

```sql
-- Bucket de Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', true);

-- Politicas de storage
CREATE POLICY "Authenticated users can upload client documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-documents');

CREATE POLICY "Authenticated users can view client documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'client-documents');

CREATE POLICY "Authenticated users can delete client documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'client-documents');

-- Tabla de metadatos de documentos
CREATE TABLE public.client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  file_size bigint,
  uploaded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users full access client_documents"
  ON public.client_documents FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
```

### Archivos a modificar/crear

| Archivo | Cambio |
|---------|--------|
| Migracion SQL | Crear bucket, tabla `client_documents`, politicas RLS |
| `src/pages/Clients.tsx` | Usar `DeleteConfirmDialog` con AlertDialog controlado |
| `src/pages/Contacts.tsx` | Usar `DeleteConfirmDialog` con AlertDialog controlado |
| `src/components/dialogs/EditClientDialog.tsx` | Anadir Tabs con "Datos" y "Documentos", campo observaciones, subida/listado de archivos |
| `src/hooks/useSupabaseData.ts` | Anadir `client_documents` al tipo `TableName` |

### Flujo de subida de documentos

```text
[Usuario selecciona archivo] --> input type="file"
        |
        v
[Upload a Storage] --> supabase.storage.from('client-documents').upload(path, file)
        |
        v
[Guardar metadatos] --> INSERT en client_documents (file_name, file_path, client_id, etc.)
        |
        v
[Listar documentos] --> SELECT FROM client_documents WHERE client_id = :id
        |
        v
[Descargar] --> supabase.storage.from('client-documents').getPublicUrl(path)
[Eliminar] --> DELETE storage object + DELETE client_documents row
```

### Logica de confirmacion de eliminacion

En lugar de usar `DeleteConfirmDialog` dentro de un `DropdownMenu` (que causa problemas de cierre), se usara un `AlertDialog` controlado por estado:
- `deleteId`: almacena el ID del cliente/contacto a eliminar
- Al pulsar "Eliminar" en el dropdown, se guarda el ID y se abre el AlertDialog
- Al confirmar, se ejecuta la eliminacion y se limpia el estado
