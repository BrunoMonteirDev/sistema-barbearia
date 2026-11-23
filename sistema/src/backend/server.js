/** Papel do módulo: Carrega as variáveis de ambiente e inicia o servidor HTTP da API. */
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config();
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
