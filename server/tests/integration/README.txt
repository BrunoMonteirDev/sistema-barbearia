TESTES DE INTEGRAÇÃO

1. Crie um banco PostgreSQL exclusivo, por exemplo: barbearia_test.
2. Copie .env.test.example para .env.test e informe DATABASE_URL_TEST.
3. Aplique as migrations no banco de testes usando DATABASE_URL_TEST como DATABASE_URL.
4. Execute, na raiz: npm run test:integration.

A suíte se recusa a iniciar quando DATABASE_URL_TEST estiver ausente, for igual à
DATABASE_URL de desenvolvimento ou não tiver "test" no nome do banco.
