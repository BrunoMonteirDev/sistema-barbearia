/** Papel do módulo: Valida os contatos informados e escolhe entre criar a primeira configuração ou atualizar a existente. */
export class DadosConfiguracaoInvalidosError extends Error {}
function dadosContatoValidos(body) {
  const telefoneWhatsApp =
    typeof body.telefoneWhatsApp === "string"
      ? body.telefoneWhatsApp.replace(/\D/g, "")
      : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const instagram =
    typeof body.instagram === "string" ? body.instagram.trim() : "";
  if (telefoneWhatsApp.length < 10 || telefoneWhatsApp.length > 11)
    return { erro: "Informe um WhatsApp brasileiro válido com DDD." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { erro: "Informe um e-mail de contato válido." };
  if (instagram) {
    try {
      const url = new URL(instagram);
      if (!["http:", "https:"].includes(url.protocol))
        throw new Error("Protocolo inválido");
    } catch {
      return {
        erro: "Informe o link completo do Instagram ou deixe o campo vazio.",
      };
    }
  }
  return { dados: { telefoneWhatsApp, email, instagram: instagram || null } };
}

export class ConfiguracaoService {
  configuracaoRepository;
  constructor(configuracaoRepository) {
    this.configuracaoRepository = configuracaoRepository;
  }
  buscar() {
    // A leitura de contatos não cria um registro: pode retornar null.
    return this.configuracaoRepository.buscar();
  }
  async salvarContato(body) {
    const resultado = dadosContatoValidos(body);
    if ("erro" in resultado)
      throw new DadosConfiguracaoInvalidosError(resultado.erro);
    const atual = await this.configuracaoRepository.buscar();
    return atual
      ? this.configuracaoRepository.atualizar(atual.id, resultado.dados)
      : this.configuracaoRepository.criar(resultado.dados);
  }
}
