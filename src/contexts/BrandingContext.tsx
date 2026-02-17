import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SIDEBAR_PRESETS: Record<string, SidebarColors> = {
  "azul-oscuro": {
    label: "Azul Oscuro",
    background: "222 47% 11%",
    accent: "222 40% 16%",
    border: "222 40% 18%",
    primary: "38 92% 50%",
  },
  "gris-pizarra": {
    label: "Gris Pizarra",
    background: "215 28% 17%",
    accent: "215 25% 22%",
    border: "215 22% 25%",
    primary: "38 92% 50%",
  },
  "verde-bosque": {
    label: "Verde Bosque",
    background: "160 30% 12%",
    accent: "160 25% 17%",
    border: "160 22% 20%",
    primary: "45 90% 50%",
  },
  "morado-noche": {
    label: "Morado Noche",
    background: "270 35% 14%",
    accent: "270 30% 19%",
    border: "270 27% 22%",
    primary: "38 92% 50%",
  },
  "rojo-granate": {
    label: "Rojo Granate",
    background: "0 30% 14%",
    accent: "0 25% 19%",
    border: "0 22% 22%",
    primary: "38 92% 50%",
  },
  "azul-marino": {
    label: "Azul Marino",
    background: "210 50% 12%",
    accent: "210 45% 17%",
    border: "210 40% 20%",
    primary: "38 92% 50%",
  },
  "negro-elegante": {
    label: "Negro Elegante",
    background: "0 0% 8%",
    accent: "0 0% 13%",
    border: "0 0% 16%",
    primary: "38 92% 50%",
  },
  "azul-cobalto": {
    label: "Azul Cobalto",
    background: "230 45% 15%",
    accent: "230 40% 20%",
    border: "230 35% 23%",
    primary: "45 90% 55%",
  },
};

interface SidebarColors {
  label: string;
  background: string;
  accent: string;
  border: string;
  primary: string;
}

interface BrandingContextType {
  appName: string;
  faviconUrl: string | null;
  sidebarPreset: string;
  isAdmin: boolean;
  presets: typeof SIDEBAR_PRESETS;
  updateAppName: (name: string) => Promise<void>;
  updateFavicon: (file: File) => Promise<void>;
  updateSidebarPreset: (presetKey: string) => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | null>(null);

export const useBranding = () => {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error("useBranding must be used within BrandingProvider");
  return ctx;
};

const DEFAULT_APP_NAME = "ValgestaCRM";

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [appName, setAppName] = useState(DEFAULT_APP_NAME);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [sidebarPreset, setSidebarPreset] = useState("azul-oscuro");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin role
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  // Load global settings
  useEffect(() => {
    supabase.from("app_settings").select("key, value").is("user_id", null).in("key", ["app_name", "favicon_url"])
      .then(({ data }) => {
        data?.forEach((row) => {
          if (row.key === "app_name" && row.value) setAppName(row.value as string);
          if (row.key === "favicon_url" && row.value) setFaviconUrl(row.value as string);
        });
      });
  }, []);

  // Load user sidebar preference
  useEffect(() => {
    if (!user) return;
    supabase.from("app_settings").select("value").eq("user_id", user.id).eq("key", "sidebar_colors").maybeSingle()
      .then(({ data }) => {
        if (data?.value && typeof data.value === "string" && SIDEBAR_PRESETS[data.value]) {
          setSidebarPreset(data.value);
        }
      });
  }, [user]);

  // Apply document title
  useEffect(() => { document.title = appName; }, [appName]);

  // Apply favicon
  useEffect(() => {
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl || "/favicon.ico";
  }, [faviconUrl]);

  // Apply sidebar colors
  useEffect(() => {
    const preset = SIDEBAR_PRESETS[sidebarPreset];
    if (!preset) return;
    const root = document.documentElement;
    root.style.setProperty("--sidebar-background", preset.background);
    root.style.setProperty("--sidebar-accent", preset.accent);
    root.style.setProperty("--sidebar-border", preset.border);
    root.style.setProperty("--sidebar-primary", preset.primary);
  }, [sidebarPreset]);

  const upsertGlobalSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase.from("app_settings").select("id").is("user_id", null).eq("key", key).maybeSingle();
    if (existing) {
      await supabase.from("app_settings").update({ value: value as any }).eq("id", existing.id);
    } else {
      await supabase.from("app_settings").insert({ key, value: value as any, category: "branding", user_id: null });
    }
  };

  const updateAppName = useCallback(async (name: string) => {
    await upsertGlobalSetting("app_name", name);
    setAppName(name);
  }, []);

  const updateFavicon = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `favicon.${ext}`;
    await supabase.storage.from("branding").upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from("branding").getPublicUrl(path);
    const url = urlData.publicUrl + "?t=" + Date.now();
    await upsertGlobalSetting("favicon_url", url);
    setFaviconUrl(url);
  }, []);

  const updateSidebarPreset = useCallback(async (presetKey: string) => {
    if (!user || !SIDEBAR_PRESETS[presetKey]) return;
    const { data: existing } = await supabase.from("app_settings").select("id").eq("user_id", user.id).eq("key", "sidebar_colors").maybeSingle();
    if (existing) {
      await supabase.from("app_settings").update({ value: presetKey as any }).eq("id", existing.id);
    } else {
      await supabase.from("app_settings").insert({ key: "sidebar_colors", value: presetKey as any, category: "personalization", user_id: user.id });
    }
    setSidebarPreset(presetKey);
  }, [user]);

  return (
    <BrandingContext.Provider value={{ appName, faviconUrl, sidebarPreset, isAdmin, presets: SIDEBAR_PRESETS, updateAppName, updateFavicon, updateSidebarPreset }}>
      {children}
    </BrandingContext.Provider>
  );
};
