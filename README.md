# Master Forge

Master Forge e uma aplicacao web para mestres de RPG criarem, organizarem e evoluirem seus cenarios de campanha.

## Objetivo inicial

- Login e cadastro de usuarios
- Dashboard com lista de cenarios
- Criacao e edicao de cenarios
- Organizacao de nacoes, cidades, vilas e faccoes
- Base preparada para integrar Supabase e PostgreSQL

## Stack inicial

- Next.js
- React
- TypeScript
- Supabase futuramente para Auth e banco de dados
- PostgreSQL futuramente como banco principal

## Rodando localmente

```bash
npm install
npm run dev
```

Depois acesse:

```txt
http://localhost:3000
```

## Rotas iniciais

- `/` - Landing page
- `/login` - Tela de login visual
- `/dashboard` - Dashboard mockado
- `/scenarios/[id]` - Editor inicial de cenario

## Proximos passos

1. Ajustar UI com Tailwind/shadcn
2. Conectar Supabase Auth
3. Criar tabelas de cenarios, nacoes, locais e faccoes
4. Substituir dados mockados por dados reais
5. Criar CRUD completo
