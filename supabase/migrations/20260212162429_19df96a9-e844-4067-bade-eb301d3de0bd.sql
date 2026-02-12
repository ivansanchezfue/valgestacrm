
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
