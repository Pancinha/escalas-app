# EscalaFarma

Sistema web de gestão de escalas de trabalho desenvolvido para a **Essencyal Farma**. Substitui o controle manual em planilhas Excel por uma interface digital centralizada, acessível por toda a equipe.

---

## Funcionalidades

- **Dashboard** com visão geral do dia: ausências, cobertura por setor e escalas recentes
- **Escalas mensais** em grade interativa (funcionários × dias), com marcação de ocorrências por célula
- **Gestão de funcionários**: cadastro, edição e desativação por setor
- **Gestão de setores**: criação com cor personalizada e cobertura mínima configurável
- **Feriados**: cadastro de feriados nacionais e locais com destaque automático na grade
- **Tipos de ocorrência**: Folga, Atestado, Férias, Afastamento, Treinamento, Turno na Filial
- **Status de escala**: Rascunho → Publicada → Bloqueada
- **Autenticação** com proteção de rotas, JWT e bloqueio automático por tentativas excessivas de login

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| Estilização | Tailwind CSS v4 + Radix UI |
| ORM | Prisma 7 |
| Banco de dados | SQLite (arquivo local via `@libsql/client`) |
| Autenticação | NextAuth v5 (JWT) |
| Runtime | Node.js ≥ 18 |

---

## Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior

---

## Instalação e execução local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/escalas-app.git
cd escalas-app

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com seus valores (veja a seção abaixo)

# 4. Crie o banco de dados
npx prisma db push

# 5. Popule com dados iniciais
npm run db:seed

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:3000**

Login padrão após o seed:
- Email: `admin@essencyal.com`
- Senha: `admin123`

> Troque a senha após o primeiro acesso em produção.

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Caminho do banco SQLite
DATABASE_URL="file:./dev.db"

# Chave secreta para assinar os tokens JWT (use uma string longa e aleatória)
# Gere com: openssl rand -base64 32
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# URL pública do sistema (sem barra no final)
NEXTAUTH_URL="http://localhost:3000"
```

Em produção, substitua `NEXTAUTH_URL` pela URL real do servidor e gere um `NEXTAUTH_SECRET` seguro.

---

## Scripts disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento (Turbopack)
npm run build        # Gera a build de produção
npm run start        # Inicia o servidor de produção
npm run lint         # Verifica o código com ESLint

npm run db:push      # Aplica o schema no banco sem gerar migration
npm run db:migrate   # Gera e aplica uma nova migration
npm run db:seed      # Popula o banco com dados iniciais
npm run db:studio    # Abre o Prisma Studio (interface visual do banco)
```

---

## Estrutura do projeto

```
src/
├── app/
│   ├── api/                  # API Routes (back-end)
│   │   ├── auth/             # Endpoints de autenticação (NextAuth)
│   │   ├── dashboard/        # Estatísticas do painel
│   │   ├── employees/        # CRUD de funcionários
│   │   ├── sectors/          # CRUD de setores
│   │   ├── schedules/        # CRUD de escalas e entradas
│   │   ├── holidays/         # CRUD de feriados
│   │   ├── occurrence-types/ # Tipos de ocorrência
│   │   └── units/            # Unidades
│   ├── dashboard/            # Página do painel
│   ├── escalas/              # Lista, criação e editor de escalas
│   ├── funcionarios/         # Gestão de funcionários
│   ├── setores/              # Gestão de setores
│   ├── configuracoes/        # Feriados e tipos de ocorrência
│   └── login/                # Tela de autenticação
├── components/
│   ├── layout/               # Sidebar, Header, AppLayout
│   ├── schedule/             # Grade de escala, célula, seletor de ocorrência
│   ├── employees/            # Dialog de formulário de funcionário
│   ├── sectors/              # Dialog de formulário de setor
│   └── ui/                   # Componentes base (Button, Card, Dialog…)
├── lib/
│   ├── db.ts                 # Instância do Prisma (SQLite)
│   ├── auth.ts               # Configuração do NextAuth
│   ├── rate-limit.ts         # Proteção contra brute force
│   └── utils.ts              # Helpers de data, formatação e estilos
├── middleware.ts              # Proteção de rotas (redireciona para /login)
└── types/                    # Tipos TypeScript globais
prisma/
├── schema.prisma             # Modelos do banco
├── migrations/               # Histórico de migrations
└── seed.ts                   # Dados iniciais
```

---

## Modelo de dados

```
User          — usuários do sistema (ADMIN / MANAGER / VIEWER)
Unit          — unidades/filiais da farmácia
Sector        — setores (Gestão, Loja, Call, Expedição…)
Employee      — funcionários vinculados a setor e unidade
OccurrenceType — tipos de marcação na grade (Folga, Férias, Atestado…)
Holiday       — feriados nacionais e locais
Schedule      — escala mensal (ano + mês + unidade)
ScheduleEntry — cada célula da grade (funcionário + data + ocorrência)
AuditLog      — histórico de alterações
```

---

## Deploy em produção

O sistema é **full stack** e exige um servidor Node.js ativo. Não é compatível com hospedagem compartilhada nem com deploy estático.

### Opções recomendadas

| Plataforma | Complexidade | Observação |
|---|---|---|
| **Railway** | Baixa | Deploy via GitHub, volume persistente para o SQLite, SSL automático |
| **Fly.io** | Média | Volume persistente, free tier generoso |
| **DigitalOcean / Hostinger VPS** | Alta | Controle total; requer configuração manual de Nginx + PM2 |
| **Vercel** | — | **Não recomendado** — filesystem read-only impede o SQLite |

### Deploy em VPS (resumo)

```bash
# No servidor
git clone https://github.com/seu-usuario/escalas-app.git
cd escalas-app
npm install
npm run build
npx prisma db push
npm run db:seed

# Iniciar com PM2
npm install -g pm2
pm2 start "npm run start" --name escalas-app
pm2 startup && pm2 save
```

Configure o Nginx como proxy reverso na porta 3000 e obtenha SSL com Certbot (Let's Encrypt).

### Pontos obrigatórios antes de ir ao ar

- [ ] Gerar `NEXTAUTH_SECRET` seguro: `openssl rand -base64 32`
- [ ] Configurar `NEXTAUTH_URL` com o domínio real
- [ ] Trocar a senha do admin padrão
- [ ] Configurar backup automático do arquivo `dev.db` (cron job diário)
- [ ] Habilitar HTTPS com certificado válido

---

## Licença

Uso interno — Essencyal Farma. Todos os direitos reservados.
