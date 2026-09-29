import dotenv from "dotenv";
import { app } from "./app.js";
import { notificacaoService } from "./agendamentos/notificacao.service.js";
dotenv.config();
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  void notificacaoService.processarLembretes().catch(console.error);
  setInterval(
    () => void notificacaoService.processarLembretes().catch(console.error),
    60_000,
  );
});
