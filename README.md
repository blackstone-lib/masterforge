# Master Forge

Master Forge é uma aplicação web para mestres de RPG criarem, organizarem e evoluírem seus cenários de campanha.

## Estado atual

- Autenticação com Supabase.
- Dashboard conectado ao banco com criação e exclusão de cenários.
- Editor modular de cenário com seções configuráveis.
- CRUD de nações, assentamentos, locais, facções, personagens, eventos de linha do tempo e entradas de lore.
- Drawer lateral para criação e edição de registros.
- Cards resumidos no editor com modal de detalhes.
- Atlas read-only para consulta, busca global e abertura de detalhes em modal.

## Stack

- Next.js
- React
- TypeScript
- Supabase Auth
- Supabase/PostgreSQL

## Rodando localmente

```bash
npm install
npm run dev
```

Depois acesse:

```txt
http://localhost:3000
```

## Variáveis de ambiente

Crie um arquivo `.env.local` com:

```txt
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Também é aceito:

```txt
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Rotas principais

- `/` - Landing page
- `/login` - Login e cadastro
- `/dashboard` - Dashboard de cenários
- `/scenarios/[id]` - Editor do cenário
- `/scenarios/[id]/atlas` - Atlas read-only do cenário
- `/scenarios/[id]/session` - Redireciona para o Atlas enquanto o modo sessão real não existe

## Próximos passos recomendados

1. Criar um modo sessão próprio, separado do Atlas.
2. Adicionar controle visual para segredos do mestre.
3. Melhorar os tipos específicos de cada entidade.
4. Criar filtros avançados por relação: nação, local, facção, personagem e evento.
5. Migrar estilos inline gradualmente para componentes reutilizáveis.
