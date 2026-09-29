# Estratégia de validação

Como os testes automatizados não serão mantidos no resultado final, cada etapa importante deverá ser validada por ferramentas disponíveis e por verificações manuais.

Quando aplicável, executar build, TypeScript/typecheck, lint, compilação, inicialização, verificação de imports, rotas, console e comunicação entre frontend e backend. Uma etapa não será concluída se a aplicação não compilar ou se a refatoração introduzir erros.

Também realizar verificações funcionais manuais adaptadas ao que existe no sistema:

- cadastro, login, logout, autenticação e senha;
- profissionais e seus horários;
- serviços;
- criação de agendamento, disponibilidade e conflito de horários;
- escolha sem preferência;
- confirmação de repetição;
- cancelamento e alteração/remarcação;
- área do cliente;
- painel administrativo;
- notificações e integração Evolution, quando configuradas.

Registrar apenas falhas ou decisões relevantes no status, sem transformá-lo em log extenso.
