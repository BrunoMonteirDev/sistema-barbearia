export const usuarioPublicoSelect = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  dataNascimento: true,
  cadastroConcluido: true,
  fotoUrl: true,
  nivel: true,
  ativo: true,
  createdAt: true,
  updatedAt: true,
};

export function mapearUsuarioPublico(usuario) {
  const dataNascimento = usuario.dataNascimento
    ? new Date(usuario.dataNascimento).toISOString()
    : null;

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    dataNascimento,
    data_nascimento: dataNascimento,
    cadastroConcluido: usuario.cadastroConcluido,
    fotoUrl: usuario.fotoUrl,
    nivel: usuario.nivel,
    ativo: usuario.ativo,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt,
  };
}
