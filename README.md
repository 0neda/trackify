# Trackify

Sistema de gerenciamento de tarefas colaborativo construído com Next.js e NestJS.

## Tecnologias

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, HeroUI
- **Backend**: NestJS, Prisma, PostgreSQL
- **Autenticação**: JWT
- **Deploy**: Vercel

## Configuração

### Backend

1. Instale as dependências:
```bash
cd backend
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Execute as migrações:
```bash
npx prisma migrate dev
```

4. Inicie o servidor:
```bash
npm run start:dev
```

### Frontend

1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Funcionalidades

- Autenticação e registro de usuários
- Criação e gerenciamento de tarefas
- Sistema de status (TODO, IN_PROGRESS, REVIEW, BLOCKED, DONE, CANCELLED)
- Sistema de prioridades (LOW, MEDIUM, HIGH, URGENT)
- Controle de acesso a tarefas
- Dependências entre tarefas
- Interface drag-and-drop para organização de tarefas

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

MIT License
