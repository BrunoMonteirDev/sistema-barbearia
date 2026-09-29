# Regras da refatoração

## Preservação e prioridade

Preservar as funcionalidades existentes. Antes de alterar uma regra, compreender por que ela existe; complexidade, por si só, não justifica removê-la.

Priorizar autenticação, usuário/cliente, profissionais, serviços, agendamentos, disponibilidade, administração, notificações/WhatsApp e os demais domínios reais identificados no projeto.

Regras críticas devem continuar protegidas no backend. O frontend pode validar para melhorar a experiência, mas não é a única proteção para autenticação, autorização, conflitos, disponibilidade, criação de registros, dados obrigatórios e regras de agendamento.

## Simplificação permitida

Reduzir duplicações, funções grandes, condicionais difíceis, arquivos com muitas responsabilidades, JSX excessivamente complexo, código morto, imports não usados, logs de debug e código antigo comentado. Não criar abstrações desnecessárias.

Não alterar o banco apenas para traduzir nomes. Mudanças estruturais no schema ou migrations só ocorrerão se forem realmente necessárias. Não fazer atualização geral de bibliotecas nem adicionar dependências quando o projeto já resolver o problema com clareza.

## Testes automatizados

Os testes automatizados atuais não fazem parte do escopo final do projeto. Nas etapas apropriadas, identificar e remover com segurança arquivos `.test.*`, `.spec.*`, `__tests__`, mocks, fixtures, scripts e dependências exclusivas de testes. Antes de remover uma dependência, confirmar que ela não é usada pela aplicação.

Não criar novos testes automatizados. A remoção de testes não significa remover validações da aplicação: segurança, validações e tratamento de erros devem permanecer.
