import "./WhatsAppConfigPage.css";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { formatarTelefoneBrasileiro } from "@/utils/telefone";

export default function WhatsAppConfigPage() {
  const [form, setForm] = useState({ telefoneWhatsApp: "", email: "", instagram: "" });
  useEffect(() => {
    void api.configuracoes
      .get()
      .then((config) =>
        setForm({
          telefoneWhatsApp: formatarTelefoneBrasileiro(config.telefoneWhatsApp ?? ""),
          email: config.email ?? "",
          instagram: config.instagram ?? "",
        }),
      )
      .catch((error) => toast.error(error.message));
  }, []);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.configuracoes.update(form);
      toast.success("Dados de contato atualizados.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    }
  };
  return (
    <section className="pagina-contatos-configuracao">
      <h1 className="titulo-contatos-configuracao">Configurações</h1>
      <p className="descricao-contatos-configuracao">
        Defina os contatos e redes sociais exibidos no site.
      </p>
      <form
        onSubmit={save}
        className="formulario-contatos-configuracao"
      >
        <label className="rotulo-contatos-configuracao">
          WhatsApp da barbearia
          <input
            required
            inputMode="tel"
            maxLength={15}
            className="campo-contatos-configuracao"
            placeholder="(00) 00000-0000"
            value={form.telefoneWhatsApp}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                telefoneWhatsApp: formatarTelefoneBrasileiro(event.target.value),
              }))
            }
          />
        </label>
        <label className="rotulo-contatos-configuracao">
          E-mail de contato
          <input
            required
            type="email"
            className="campo-contatos-configuracao"
            placeholder="contato@barbearia.com"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>
        <label className="rotulo-contatos-configuracao">
          Instagram
          <input
            className="campo-contatos-configuracao"
            placeholder="https://instagram.com/sua-barbearia"
            value={form.instagram}
            onChange={(event) =>
              setForm((current) => ({ ...current, instagram: event.target.value }))
            }
          />
          <span className="ajuda-contatos-configuracao">Informe o link completo do perfil.</span>
        </label>
        <button className="botao-salvar-contatos-configuracao">Salvar contatos</button>
      </form>
    </section>
  );
}
