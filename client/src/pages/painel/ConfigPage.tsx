import { useState, useEffect } from "react";
import {
  Save,
  Building,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { postgres } from "@/lib/postgres";

interface Config {
  id?: string;
  nome: string;
  email: string;
  telefone_whatsapp: string;
  telefone_fixo: string;
  endereco: string;
  instagram: string;
  quantidade_cartoes: number;
  texto_rodape: string;

  banner_url: string | null;
  logo_url: string | null;
  imagem_sobre_url: string | null;
  imagem_banner_index_url: string | null;

  texto_hero: string;
  texto_sobre: string;
  whatsapp: string;
}

export default function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    const { data, error } = await postgres.from("config").select("*").single();

    if (error) {
      toast.error("Erro ao carregar configuraÃ§Ãµes");
    } else {
      setConfig(data);
    }

    setLoading(false);
  }

  // ========================= UPLOAD =========================
  async function uploadFile(
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Config
  ) {
    try {
      const file = e.target.files?.[0];
      if (!file || !config) return;

      setUploading(true);

      const ext = file.name.split(".").pop();
      const fileName = `${field}-${Date.now()}.${ext}`;

      // upload
      const { error: uploadError } = await postgres.storage
        .from("config-assets")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        toast.error("Erro ao enviar arquivo");
        console.error(uploadError);
        setUploading(false);
        return;
      }

      // URL pÃºblica
      const { data: publicUrl } = postgres.storage
        .from("config-assets")
        .getPublicUrl(fileName);

      setConfig({
        ...config,
        [field]: publicUrl.publicUrl,
      });

      toast.success("Imagem enviada!");
      setUploading(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro no upload");
      setUploading(false);
    }
  }

  // ========================= REMOVER IMAGEM =========================
  async function removeImage(field: keyof Config) {
    if (!config) return;

    const { error } = await postgres
      .from("config")
      .update({ [field]: null })
      .eq("id", config.id);

    if (error) {
      toast.error("Erro ao remover imagem");
      return;
    }

    setConfig({ ...config, [field]: null });
    toast.success("Imagem removida! Voltou ao padrÃ£o.");
  }

  // ========================= SALVAR =========================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;

    setSaving(true);

    const { error } = await postgres.from("config").upsert(config);

    if (error) toast.error("Erro ao salvar");
    else toast.success("ConfiguraÃ§Ãµes atualizadas!");

    setSaving(false);
  }

  if (loading || !config) {
    return <div className="py-10 text-center text-secondary-500">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form className="space-y-8" onSubmit={handleSubmit}>
        
        {/* ==================== INFO EMPRESA ==================== */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-xl font-semibold text-secondary-500 flex items-center gap-2">
            <Building className="h-5 w-5 text-primary-500" />
            InformaÃ§Ãµes da Empresa
          </h3>

          <div>
            <label className="label">Nome da Empresa</label>
            <input
              type="text"
              value={config.nome}
              onChange={(e) => setConfig({ ...config, nome: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </label>
              <input
                type="text"
                value={config.instagram}
                onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                className="input-field"
                placeholder="@usuario"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp
              </label>
              <input
                type="text"
                value={config.whatsapp}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Telefone Fixo</label>
              <input
                type="text"
                value={config.telefone_fixo}
                onChange={(e) =>
                  setConfig({ ...config, telefone_fixo: e.target.value })
                }
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              EndereÃ§o
            </label>
            <input
              type="text"
              value={config.endereco}
              onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        {/* ==================== UPLOADS ==================== */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
          <h3 className="text-xl font-semibold text-secondary-500">
            Imagens do Site
          </h3>

          <UploadItem
            label="Banner Principal"
            current={config.banner_url}
            field="banner_url"
            uploading={uploading}
            onUpload={uploadFile}
            onRemove={removeImage}
          />

          <UploadItem
            label="Logo do Site"
            current={config.logo_url}
            field="logo_url"
            uploading={uploading}
            onUpload={uploadFile}
            onRemove={removeImage}
          />

          <UploadItem
            label="Imagem da seÃ§Ã£o Sobre"
            current={config.imagem_sobre_url}
            field="imagem_sobre_url"
            uploading={uploading}
            onUpload={uploadFile}
            onRemove={removeImage}
          />

          <UploadItem
            label="Banner da PÃ¡gina Inicial"
            current={config.imagem_banner_index_url}
            field="imagem_banner_index_url"
            uploading={uploading}
            onUpload={uploadFile}
            onRemove={removeImage}
          />
        </div>

        {/* ==================== TEXTOS ==================== */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-xl font-semibold text-secondary-500">
            Textos do Site
          </h3>

          <div>
            <label className="label">Texto do Hero</label>
            <textarea
              className="input-field"
              rows={3}
              value={config.texto_hero}
              onChange={(e) =>
                setConfig({ ...config, texto_hero: e.target.value })
              }
            />
          </div>

          <div>
            <label className="label">Texto Sobre</label>
            <textarea
              className="input-field"
              rows={3}
              value={config.texto_sobre}
              onChange={(e) =>
                setConfig({ ...config, texto_sobre: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || uploading}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            {saving ? "Salvando..." : "Salvar ConfiguraÃ§Ãµes"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ===========================================================
   COMPONENTE DE UPLOAD
   =========================================================== */

function UploadItem({
  label,
  current,
  field,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  current: string | null;
  field: keyof Config;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, field: keyof Config) => void;
  onRemove: (field: keyof Config) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="label flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-gray-400" />
        {label}
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => onUpload(e, field)}
        className="input-field"
      />

      {uploading && <p className="text-primary-500 text-sm">Enviando...</p>}

      {current && (
        <div className="mt-2 space-y-2">
          <img
            src={current}
            className="h-32 rounded-lg object-cover border"
          />

          <button
            type="button"
            onClick={() => onRemove(field)}
            className="flex items-center gap-2 text-red-500 text-sm underline"
          >
            <Trash2 className="h-4 w-4" />
            Remover e voltar ao padrÃ£o
          </button>
        </div>
      )}
    </div>
  );
}

