export class AuthController {
  authService;
  constructor(authService) {
    this.authService = authService;
  }
  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email e senha são obrigatórios." });
      }
      const usuario = await this.authService.autenticarUsuario(email, password);
      if (!usuario)
        return res.status(401).json({ error: "Credenciais inválidas." });
      return res.json(this.authService.criarSessao(usuario));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno ao autenticar." });
    }
  };
  cadastrar = async (req, res) => {
    try {
      const { nome, email, password, telefone } = req.body;
      if (!nome || !email || !password) {
        return res
          .status(400)
          .json({ error: "Nome, email e senha são obrigatórios." });
      }
      const resultado = await this.authService.cadastrarUsuario({
        nome,
        email,
        telefone,
        senha: password,
      });
      if ("erro" in resultado)
        return res
          .status("conflito" in resultado ? 409 : 400)
          .json({ error: resultado.erro });
      return res
        .status(201)
        .json(this.authService.criarSessao(resultado.usuario));
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro interno ao cadastrar usuário." });
    }
  };
  google = async (req, res) => {
    if (typeof req.body.idToken !== "string" || !req.body.idToken)
      return res.status(400).json({ error: "Token Google é obrigatório." });
    try {
      const resultado = await this.authService.autenticarComGoogle(
        req.body.idToken,
      );
      if ("erro" in resultado)
        return res
          .status(resultado.motivo === "googleNaoConfigurado" ? 503 : 401)
          .json({ error: resultado.erro });
      return res
        .status(201)
        .json(this.authService.criarSessao(resultado.usuario));
    } catch (error) {
      console.error(error);
      return res
        .status(401)
        .json({ error: "Não foi possível validar o login com Google." });
    }
  };
}
