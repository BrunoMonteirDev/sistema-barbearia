import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

dotenv.config()

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL não foi configurada.')
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

async function main() {
  const senhaHash = await bcrypt.hash('123456', 10)

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@barbearia.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@barbearia.com',
      telefone: '(44) 99999-0000',
      senhaHash,
      nivel: 'Administrador',
      ativo: true
    }
  })

  const cliente = await prisma.usuario.upsert({
    where: { email: 'cliente@barbearia.com' },
    update: {},
    create: {
      nome: 'Cliente Exemplo',
      email: 'cliente@barbearia.com',
      telefone: '(44) 98888-1111',
      senhaHash,
      nivel: 'Cliente',
      ativo: true
    }
  })

  const profissional = await prisma.profissional.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nome: 'Carlos',
      telefone: '(44) 97777-2222',
      email: 'carlos@barbearia.com',
      especialidade: 'Barba e cabelo',
      ativo: true
    }
  })

  const servico = await prisma.servico.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      nome: 'Corte clássico',
      descricao: 'Corte tradicional com acabamento',
      duracao: 45,
      preco: 40,
      ativo: true
    }
  })

  const configuracao = await prisma.configuracao.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      nome: 'Barbearia Exemplo',
      email: 'contato@barbearia.com',
      telefoneWhatsApp: '(44) 99999-9999',
      endereco: 'Rua das Barbearias, 100',
      tipoComissao: 'fixa',
      textoRodape: 'Atendimento com excelência.'
    }
  })

  await prisma.disponibilidadeProfissional.createMany({
    data: [1, 2, 3, 4, 5].flatMap(diaSemana =>
      ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'].map(hora => ({
        profissionalId: profissional.id,
        diaSemana,
        hora,
      }))
    ),
    skipDuplicates: true,
  })

  console.log({ admin, cliente, profissional, servico, configuracao })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
