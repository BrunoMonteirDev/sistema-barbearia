import dotenv from 'dotenv'
import { app } from './app'
import { notificacaoService } from './services/notificacao.service'

dotenv.config()

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  void notificacaoService.processarLembretes().catch(console.error)
  setInterval(() => void notificacaoService.processarLembretes().catch(console.error), 60_000)
})
