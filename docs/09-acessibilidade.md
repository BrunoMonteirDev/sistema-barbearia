# 💈 09 - Acessibilidade

# Barbearia Web

---

# 1. Introdução

A acessibilidade é um dos pilares do sistema Barbearia Web.

O objetivo é desenvolver uma aplicação capaz de atender diferentes perfis de usuários, reduzindo barreiras de utilização e permitindo maior autonomia.

O sistema seguirá boas práticas de acessibilidade digital, utilizando como referência as recomendações da:

- WCAG (Web Content Accessibility Guidelines);
- WAI-ARIA;
- HTML semântico.

---

# 2. Objetivos da Acessibilidade

O sistema deve possibilitar o uso por pessoas com:

- deficiência visual;
- deficiência auditiva;
- limitações motoras;
- daltonismo;
- dificuldades cognitivas;
- necessidades relacionadas ao espectro autista.

---

# 3. Diretrizes Utilizadas

A implementação será baseada principalmente nos princípios da WCAG.

A WCAG organiza acessibilidade em quatro princípios:


```
Perceptível

Operável

Compreensível

Robusto
```


---

# 4. Perceptível

Informações devem ser apresentadas de formas que possam ser percebidas por diferentes usuários.

---

# 4.1 Contraste de Cores


O sistema deverá possuir contraste adequado entre:


- texto;
- fundo;
- elementos interativos.


Objetivo:

Facilitar utilização por pessoas com baixa visão.


---

# 4.2 Não utilizar apenas cores


Informações importantes não devem depender somente de cores.


Exemplo incorreto:


```
🟢 Verde = disponível

🔴 Vermelho = ocupado
```


Exemplo correto:


```
✓ Disponível

✕ Horário ocupado
```


---

# 4.3 Controle de tamanho da fonte


O sistema deverá permitir aumento da fonte.


Opções previstas:


```
Normal

Grande

Muito grande
```


Objetivo:

Auxiliar usuários com dificuldade visual.

---

# 5. Operável

O sistema deve permitir interação através de diferentes formas.

---

# 5.1 Navegação por teclado


Toda funcionalidade deve poder ser acessada sem mouse.


Teclas consideradas:


- Tab;
- Enter;
- Espaço;
- Esc.


---

# 5.2 Foco visível


Elementos selecionados pelo teclado devem possuir indicação visual.


Exemplo:


```
Botão selecionado

████
```


---

# 5.3 Evitar dependência de movimentos


Nenhuma função essencial deve depender exclusivamente de:


- arrastar;
- gestos;
- movimentos precisos.


---

# 6. Compatibilidade com Leitores de Tela


O sistema deverá utilizar HTML semântico.


Exemplo:


Utilizar:


```html
<button>
Agendar
</button>
```


Ao invés de:


```html
<div>
Agendar
</div>
```


---

# 6.1 Uso de ARIA


Quando necessário serão utilizados atributos ARIA.


Exemplos:


```html
aria-label

aria-expanded

aria-describedby
```


Objetivo:

Fornecer contexto adicional aos leitores de tela.

---

# 6.2 Textos alternativos


Imagens devem possuir descrição.


Exemplo:


```html
<img 
alt="Foto do profissional João"
/>
```


---

# 7. Compatibilidade com Pessoas Cegas


Recursos previstos:


- navegação por teclado;
- leitores de tela;
- textos descritivos;
- estrutura semântica;
- mensagens claras.


---

# 8. Pessoas com Baixa Visão


Recursos:


- aumento de fonte;
- alto contraste;
- espaçamento adequado;
- evitar textos pequenos.


---

# 9. Pessoas com Daltonismo


O sistema deve considerar diferentes tipos de daltonismo:


- protanopia;
- deuteranopia;
- tritanopia.


Práticas:


- evitar informação somente por cor;
- utilizar ícones;
- utilizar textos auxiliares.


---

# 10. Pessoas Surdas


O sistema deverá disponibilizar recursos visuais.


Exemplos:


- mensagens escritas;
- avisos visuais;
- integração com Libras.


---

# 11. Integração com VLibras


O sistema poderá utilizar integração com o VLibras.


Objetivo:


Permitir tradução de conteúdos textuais para Libras.


Aplicação:


- páginas institucionais;
- instruções;
- mensagens importantes.


---

# 12. Pessoas com Limitações Motoras


O sistema deverá considerar usuários com dificuldade de movimentação.


Práticas:


- botões com tamanho adequado;
- evitar elementos pequenos;
- navegação por teclado;
- áreas de clique maiores.


---

# 13. Acessibilidade Cognitiva


O sistema deverá considerar usuários com dificuldades cognitivas.


Incluindo:


- pessoas com déficit de atenção;
- pessoas no espectro autista;
- usuários com dificuldades de compreensão.


---

# 13.1 Organização previsível


A interface deve manter:


- menus consistentes;
- localização previsível;
- padrões repetidos.


---

# 13.2 Linguagem simples


Mensagens devem evitar termos técnicos.


Exemplo:


Evitar:


```
HTTP 400 Bad Request
```


Utilizar:


```
Não foi possível salvar as informações.
Verifique os dados.
```


---

# 13.3 Redução de estímulos


Evitar:


- animações excessivas;
- efeitos piscantes;
- excesso de informações.


---

# 14. Preferências de Usuário


O sistema poderá disponibilizar configurações pessoais.


Exemplos:


- tamanho da fonte;
- contraste;
- redução de animações.


Essas preferências poderão ser armazenadas localmente.

---

# 15. Acessibilidade em Componentes


Todos componentes devem considerar:


## Botões


- possuir nome acessível;
- funcionar por teclado.


## Formulários


- possuir labels;
- informar erros claramente.


## Modais


- possuir foco controlado;
- permitir fechamento por teclado.


## Tabelas


- possuir cabeçalhos;
- permitir leitura por tecnologias assistivas.

---

# 16. Testes de Acessibilidade


Serão utilizados testes como:


## Testes automáticos


Ferramentas possíveis:


- Lighthouse;
- Axe DevTools.


---

## Testes manuais


Verificar:


- navegação somente pelo teclado;
- funcionamento com leitor de tela;
- contraste;
- tamanho de fonte.


---

# 17. Critérios de Aceitação


O sistema será considerado acessível quando:


✓ Todas ações principais funcionarem por teclado.

✓ Textos possuírem boa legibilidade.

✓ Informações não dependerem somente de cores.

✓ Componentes possuírem identificação adequada.

✓ Usuários conseguirem navegar com tecnologias assistivas.

---

# 18. Evoluções Futuras


Possíveis melhorias:


- comandos por voz;
- inteligência artificial para auxiliar navegação;
- personalização avançada;
- suporte a mais idiomas.


---

# 19. Considerações Finais


A acessibilidade será tratada como parte da arquitetura do sistema e não como uma funcionalidade adicionada posteriormente.

Desde a criação dos componentes até o desenvolvimento das telas, serão consideradas práticas inclusivas para garantir que diferentes usuários possam utilizar o sistema com autonomia.