# Objetivo da refatoração

Preparar o sistema de agendamento da barbearia para apresentação como TCC, preservando seu funcionamento real e tornando sua estrutura mais clara para manutenção e explicação oral.

As prioridades são, nesta ordem: funcionamento correto; segurança; compreensão do código; facilidade de explicação na apresentação; arquitetura organizada; padronização; e redução de complexidade desnecessária.

O resultado deve ser didático sem se tornar artificialmente simples. Não haverá overengineering: cada funcionalidade deverá possuir um fluxo que possa ser acompanhado facilmente no código, respeitando React, Express, Prisma e as demais tecnologias realmente utilizadas.

Como referência, um fluxo pode seguir:

`View → Controller → Serviço/regra de negócio → Model/persistência → Banco de dados`

Esse fluxo será adaptado quando a tecnologia oferecer uma forma mais adequada. A arquitetura não deve criar camadas apenas para cumprir um padrão.
