-- Modelo para visualização no MySQL Workbench (MySQL 8.0).
-- O sistema utiliza PostgreSQL; este script não altera a configuração da aplicação.
-- Os IDs são gerados pela aplicação. Nenhum dado é inserido neste modelo.

CREATE DATABASE IF NOT EXISTS barbearia_diagrama
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE barbearia_diagrama;

CREATE TABLE usuarios (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  nome TEXT NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  telefone TEXT,
  data_nascimento DATETIME(3),
  senha_hash TEXT,
  provedor_auth VARCHAR(191) NOT NULL DEFAULT 'LOCAL',
  google_subject VARCHAR(191) UNIQUE,
  cadastro_concluido BOOLEAN NOT NULL DEFAULT TRUE,
  foto_url TEXT,
  nivel VARCHAR(191) NOT NULL DEFAULT 'Cliente',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  atendimento BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE profissionais (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  email VARCHAR(191) UNIQUE,
  especialidade TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE servicos (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao INT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE agendamentos (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  usuario_id VARCHAR(36) NOT NULL,
  profissional_id VARCHAR(36) NOT NULL,
  servico_id VARCHAR(36) NOT NULL,
  data VARCHAR(10) NOT NULL,
  hora VARCHAR(5) NOT NULL,
  status VARCHAR(191) NOT NULL DEFAULT 'PENDENTE',
  observacao TEXT,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  INDEX agendamentos_profissional_data_hora_idx (profissional_id, data, hora),
  CONSTRAINT agendamentos_usuario_fk FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT agendamentos_profissional_fk FOREIGN KEY (profissional_id)
    REFERENCES profissionais(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT agendamentos_servico_fk FOREIGN KEY (servico_id)
    REFERENCES servicos(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE historicos_agendamentos (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  agendamento_id VARCHAR(36) NOT NULL,
  autor_id VARCHAR(36) NOT NULL,
  tipo TEXT NOT NULL,
  dados_anteriores JSON,
  dados_novos JSON,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT historicos_agendamento_fk FOREIGN KEY (agendamento_id)
    REFERENCES agendamentos(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE profissionais_disponibilidades (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  profissional_id VARCHAR(36) NOT NULL,
  dia_semana INT NOT NULL,
  hora VARCHAR(5) NOT NULL,
  CONSTRAINT disponibilidade_profissional_dia_hora_unica
    UNIQUE (profissional_id, dia_semana, hora),
  CONSTRAINT disponibilidade_profissional_fk FOREIGN KEY (profissional_id)
    REFERENCES profissionais(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE bloqueios_datas (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  data VARCHAR(10) NOT NULL UNIQUE,
  motivo VARCHAR(180) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE config (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  nome VARCHAR(191) NOT NULL DEFAULT 'Barbearia',
  email VARCHAR(191) NOT NULL DEFAULT 'contato@barbearia.com',
  telefone_whatsapp TEXT,
  telefone_fixo TEXT,
  endereco TEXT,
  logo TEXT,
  instagram TEXT,
  tipo_comissao TEXT,
  texto_rodape TEXT,
  img_banner TEXT,
  quantidade_cartoes INT,
  texto_fidelidade TEXT,
  antecedencia_cancelamento_horas INT NOT NULL DEFAULT 24,
  antecedencia_agendamento_minutos INT NOT NULL DEFAULT 30,
  tolerancia_atraso_minutos INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL
) ENGINE=InnoDB;

-- autor_id não possui chave estrangeira no schema Prisma atual.
-- bloqueios_datas e config são tabelas independentes, sem chaves estrangeiras.
-- A migration PostgreSQL também cria índice único parcial para reservas não
-- canceladas; ele não foi reproduzido neste modelo MySQL de visualização.
