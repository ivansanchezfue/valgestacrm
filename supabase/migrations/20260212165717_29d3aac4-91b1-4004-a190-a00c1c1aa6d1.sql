
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

CREATE TRIGGER update_email_accounts_updated_at
  BEFORE UPDATE ON public.email_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
