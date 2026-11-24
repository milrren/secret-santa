# Secret Santa (Amigo Secreto) 🎅🎁

Aplicação moderna de Amigo Secreto construída com **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4** e **Zod**, desenvolvida especificamente para tirar o máximo proveito de **Serverless Functions** e **Server Actions** em deploy direto na **Vercel**.

---

## 🚀 Arquitetura Serverless

O projeto divide a lógica de backend e execução em camadas limpas e desacopladas:

```
src/
├── app/
│   ├── api/                     # Serverless Functions (Route Handlers)
│   │   ├── health/route.ts      # Endpoint de verificação de integridade (/api/health)
│   │   └── draw/route.ts        # Endpoint REST para sorteio serverless (/api/draw)
│   ├── globals.css              # Estilos globais Tailwind CSS v4 (@import "tailwindcss")
│   ├── layout.tsx               # Root Layout
│   └── page.tsx                 # Dashboard interativo com Server Action
├── components/                  # Componentes reutilizáveis
├── lib/
│   └── utils.ts                 # Helpers utilitários (cn, formatações)
├── server/
│   ├── actions/
│   │   └── draw-actions.ts      # Server Actions (execução serverless direta da UI)
│   ├── schemas/
│   │   └── participant.ts       # Schemas Zod de validação e tipos TypeScript
│   └── services/
│       └── draw-service.ts      # Regras de negócio puras (Algoritmo de Derangement)
└── types/                       # Definições de tipos compartilhados
```

### ⚡ Vantagens desta estrutura na Vercel:
1. **Server Actions (`src/server/actions/`)**: Executam como lambdas sob demanda acionadas por componentes React, eliminando boilerplate de chamadas `fetch` manuais e garantindo mutações seguras no servidor.
2. **Route Handlers (`src/app/api/`)**: Endpoints HTTP com rotas dinâmicas (`runtime = 'nodejs'`) para integrações externas, webhooks ou consumo por outros clientes.
3. **Core Services (`src/server/services/`)**: A lógica de domínio (sorteio, validações) é 100% desacoplada dos protocolos de transporte (HTTP / RPC), facilitando testes unitários e permitindo fácil acoplamento futuro de banco de dados (ex: Neon, Supabase, Prisma, Drizzle).

---

## 🧭 Roadmap do Produto

O planejamento estratégico detalhado, as etapas de desenvolvimento e a modelagem do banco de dados (Supabase, Auth, Nodemailer, Wishlist) estão documentados no arquivo:
👉 [ROADMAP.md](file:///Users/milrrenmattar/git/secret-santa/ROADMAP.md)

---

## 🛠️ Começando

### Pré-requisitos
- Node.js >= 18 (Recomendado 20+)
- npm ou seu gerenciador de pacotes preferido

### Instalação
```bash
npm install
```

### Executar em Desenvolvimento
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### Build de Produção
```bash
npm run build
npm run start
```

---

## 📡 Endpoints Serverless

### 1. Healthcheck
- **GET** `/api/health`
- Retorna o status do serviço, timestamp e ambiente de execução serverless.

### 2. Sorteio de Amigo Secreto
- **POST** `/api/draw`
- **Body (JSON)**:
  ```json
  {
    "participants": [
      { "id": "1", "name": "Alice", "email": "alice@exemplo.com" },
      { "id": "2", "name": "Bruno", "email": "bruno@exemplo.com" }
    ]
  }
  ```
- **Resposta**:
  ```json
  {
    "success": true,
    "count": 2,
    "matches": [
      {
        "giver": { "id": "1", "name": "Alice", "email": "alice@exemplo.com" },
        "receiver": { "id": "2", "name": "Bruno", "email": "bruno@exemplo.com" }
      },
      {
        "giver": { "id": "2", "name": "Bruno", "email": "bruno@exemplo.com" },
        "receiver": { "id": "1", "name": "Alice", "email": "alice@exemplo.com" }
      }
    ]
  }
  ```

---

## ☁️ Deploy na Vercel

Este repositório está pronto para deploy com **zero configuração adicional**:
1. Conecte o repositório no dashboard da [Vercel](https://vercel.com).
2. O framework preset será detectado automaticamente como **Next.js**.
3. O build command padrão (`next build`) gerará as páginas estáticas e os endpoints serverless automaticamente.
