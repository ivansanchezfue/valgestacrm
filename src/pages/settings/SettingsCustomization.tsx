import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Check, Palette, Building2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBranding } from "@/contexts/BrandingContext";
import { toast } from "sonner";

const SettingsCustomization = () => {
  const navigate = useNavigate();
  const { appName, faviconUrl, sidebarPreset, isAdmin, presets, updateAppName, updateFavicon, updateSidebarPreset } = useBranding();
  const [nameInput, setNameInput] = useState(appName);
  const [savingName, setSavingName] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      await updateAppName(nameInput.trim());
      toast.success("Nombre actualizado");
    } catch { toast.error("Error al guardar"); }
    finally { setSavingName(false); }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Solo se permiten imágenes"); return; }
    if (file.size > 512 * 1024) { toast.error("Máximo 512KB"); return; }
    setUploadingFavicon(true);
    try {
      await updateFavicon(file);
      toast.success("Favicon actualizado");
    } catch { toast.error("Error al subir favicon"); }
    finally { setUploadingFavicon(false); }
  };

  const handlePresetSelect = async (key: string) => {
    try {
      await updateSidebarPreset(key);
      toast.success("Colores del menú actualizados");
    } catch { toast.error("Error al guardar preferencia"); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Personalización</h1>
          <p className="text-muted-foreground mt-0.5">Configura la apariencia de la aplicación</p>
        </div>
      </div>

      {/* Admin: App Name & Favicon */}
      {isAdmin && (
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Marca (Admin)
          </h3>
          <div className="bg-card rounded-xl border p-6 space-y-6">
            {/* App Name */}
            <div className="space-y-2">
              <Label>Nombre de la aplicación</Label>
              <div className="flex gap-2">
                <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Nombre de la app" className="max-w-xs" />
                <Button onClick={handleSaveName} disabled={savingName || nameInput === appName}>
                  {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Se mostrará en el login y en el menú lateral</p>
            </div>

            {/* Favicon */}
            <div className="space-y-2">
              <Label>Favicon</Label>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                  {faviconUrl ? (
                    <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </div>
                <div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} />
                  <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadingFavicon}>
                    {uploadingFavicon ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Subir favicon
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">PNG, ICO o SVG. Máx 512KB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Palette className="h-4 w-4" /> Colores del menú
        </h3>
        <div className="bg-card rounded-xl border p-6">
          <p className="text-sm text-muted-foreground mb-4">Elige un tema para el menú lateral</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(presets).map(([key, preset]) => {
              const isActive = sidebarPreset === key;
              return (
                <button
                  key={key}
                  onClick={() => handlePresetSelect(key)}
                  className={`relative rounded-xl border-2 p-3 transition-all duration-150 text-left ${
                    isActive ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  {/* Color preview */}
                  <div className="flex gap-1.5 mb-2">
                    <div className="h-6 w-6 rounded-full" style={{ background: `hsl(${preset.background})` }} />
                    <div className="h-6 w-6 rounded-full" style={{ background: `hsl(${preset.accent})` }} />
                    <div className="h-6 w-6 rounded-full" style={{ background: `hsl(${preset.primary})` }} />
                  </div>
                  <p className="text-xs font-medium text-foreground">{preset.label}</p>
                  {isActive && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                      <Check className="h-3 w-3 text-accent-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsCustomization;
