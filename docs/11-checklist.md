# 💈 11 - Checklist do Projeto

# Barbearia Web

---

# 1. Introdução

Este documento apresenta uma lista de verificação das principais atividades e requisitos do projeto Barbearia Web.

O checklist será utilizado durante todo o desenvolvimento para acompanhar:

- implementação;
- qualidade do código;
- segurança;
- acessibilidade;
- documentação;
- preparação da entrega final.

---

# 2. Fundação do Projeto

## Configuração Inicial

- [ ] Repositório Git criado
- [ ] README.md criado
- [ ] Documentação inicial criada
- [ ] Projeto Next.js configurado
- [ ] TypeScript configurado
- [ ] Tailwind CSS configurado
- [ ] ESLint configurado
- [ ] Prettier configurado
- [ ] Variáveis de ambiente configuradas


---

# 3. Estrutura do Projeto


- [ ] Organização de pastas definida
- [ ] Componentes separados corretamente
- [ ] Hooks personalizados organizados
- [ ] Funções auxiliares separadas
- [ ] Código sem arquivos desnecessários


Estrutura esperada:


```
src/

app/

components/

hooks/

lib/

services/

types/

utils/
```


---

# 4. Banco de Dados


## Configuração


- [ ] PostgreSQL configurado
- [ ] Prisma instalado
- [ ] Schema criado
- [ ] Migrações funcionando
- [ ] Banco documentado


---

## Modelos Principais


### Usuário


- [ ] Criado
- [ ] Campos definidos
- [ ] Relacionamentos configurados


### Profissional


- [ ] Criado
- [ ] Campos definidos
- [ ] Relacionamentos configurados


### Serviço


- [ ] Criado
- [ ] Campos definidos
- [ ] Relacionamentos configurados


### Agendamento


- [ ] Criado
- [ ] Status definido
- [ ] Relacionamentos configurados


---

# 5. Backend


## API


- [ ] Rotas organizadas
- [ ] Validação de dados implementada
- [ ] Tratamento de erros implementado
- [ ] Respostas padronizadas


---

# 6. Frontend


## Interface Geral


- [ ] Layout criado
- [ ] Responsividade implementada
- [ ] Componentes reutilizáveis criados
- [ ] Estados de carregamento implementados
- [ ] Mensagens de erro implementadas


---

# 7. Cadastro de Serviços


- [ ] Criar serviço
- [ ] Listar serviços
- [ ] Editar serviço
- [ ] Remover serviço
- [ ] Validar informações


---

# 8. Cadastro de Profissionais


- [ ] Criar profissional
- [ ] Listar profissionais
- [ ] Editar profissional
- [ ] Ativar/desativar profissional


---

# 9. Cadastro de Clientes


- [ ] Criar cliente
- [ ] Editar cliente
- [ ] Consultar cliente
- [ ] Validar dados


---

# 10. Sistema de Agendamento


## Fluxo do Cliente


- [ ] Escolher serviço
- [ ] Escolher profissional
- [ ] Escolher data
- [ ] Exibir horários disponíveis
- [ ] Confirmar agendamento
- [ ] Salvar no banco


---

## Regras


- [ ] Impedir conflito de horários
- [ ] Bloquear horários ocupados
- [ ] Validar disponibilidade
- [ ] Controlar status


---

# 11. Área Administrativa


## Dashboard


- [ ] Criado
- [ ] Indicadores implementados
- [ ] Informações atualizadas


---

## Agenda


- [ ] Visualização dos horários
- [ ] Filtro por profissional
- [ ] Atualização de status


---

# 12. Autenticação


- [ ] Cadastro de usuário
- [ ] Login
- [ ] Logout
- [ ] Proteção de páginas
- [ ] Controle de permissões


Perfis:


- [ ] Cliente
- [ ] Administrador


---

# 13. Segurança


- [ ] Senhas protegidas
- [ ] Validação de entrada
- [ ] Controle de acesso
- [ ] Variáveis sensíveis protegidas
- [ ] Tratamento de erros


---

# 14. Acessibilidade


## Estrutura


- [ ] HTML semântico
- [ ] Labels em formulários
- [ ] Textos alternativos
- [ ] Navegação por teclado


---

## Visual


- [ ] Alto contraste
- [ ] Fonte ajustável
- [ ] Cores acessíveis
- [ ] Não depender apenas de cores


---

## Tecnologias Assistivas


- [ ] Teste com leitor de tela
- [ ] ARIA implementado quando necessário
- [ ] VLibras integrado


---

## Necessidades Específicas


### Pessoas cegas

- [ ] Compatibilidade com leitor de tela


### Baixa visão

- [ ] Controle de fonte
- [ ] Contraste adequado


### Daltonismo

- [ ] Uso de indicadores adicionais


### Limitações motoras

- [ ] Navegação por teclado
- [ ] Botões acessíveis


### Pessoas com dificuldades cognitivas

- [ ] Interface previsível
- [ ] Linguagem simples


---

# 15. Testes


## Funcionais


- [ ] Cadastro funcionando
- [ ] Login funcionando
- [ ] Agendamento funcionando
- [ ] Cancelamento funcionando


---

## Interface


- [ ] Desktop testado
- [ ] Tablet testado
- [ ] Mobile testado


---

## Performance


- [ ] Lighthouse executado
- [ ] Imagens otimizadas
- [ ] Código revisado


---

# 16. Deploy


- [ ] Banco em produção configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Aplicação publicada
- [ ] Domínio configurado


---

# 17. Documentação


- [ ] README atualizado
- [ ] Arquitetura documentada
- [ ] Banco documentado
- [ ] Diagramas atualizados
- [ ] Decisões registradas


---

# 18. Preparação da Banca


- [ ] Sistema funcionando
- [ ] Apresentação criada
- [ ] Demonstração preparada
- [ ] Vídeo de funcionamento gravado
- [ ] Artigo revisado


---

# 19. Checklist Final


Antes da entrega:


- [ ] Todas funcionalidades principais funcionando
- [ ] Banco sem erros
- [ ] Código organizado
- [ ] Documentação completa
- [ ] Projeto publicado
- [ ] Apresentação final revisada


---

# 20. Considerações Finais


Este checklist tem como objetivo garantir que o desenvolvimento do Barbearia Web mantenha qualidade técnica e acadêmica.

Ele deve ser atualizado continuamente durante todas as etapas do projeto.