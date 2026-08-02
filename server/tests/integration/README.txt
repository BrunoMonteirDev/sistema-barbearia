TESTES DE INTEGRAÇÃO

1. Inicie o banco exclusivo: docker compose -f docker-compose.test.yml up -d.
2. Copie .env.test.example para .env.test. A URL padrão usa a porta 5433.
3. Sincronize o schema atual: na pasta server, defina DATABASE_URL com o valor
   de DATABASE_URL_TEST e execute npx prisma db push. Isto é seguro apenas para
   este banco descartável; o histórico antigo não possui a migration inicial.
4. Execute, na raiz: npm run test:integration.

O container usa banco, usuário e volume próprios. Ele não compartilha porta,
volume ou URL com o PostgreSQL de desenvolvimento ou com a Evolution API.

A suíte se recusa a iniciar quando DATABASE_URL_TEST estiver ausente, for igual à
DATABASE_URL de desenvolvimento ou não tiver "test" no nome do banco.
