# Edge Function: `delete-account`

Exclusão **segura e permanente** da conta do usuário autenticado. A função roda
no servidor (Deno) e usa o **service role** apenas nesse ambiente — a chave
nunca é embarcada no app.

> Este repositório **não** faz deploy automático. Os comandos abaixo são para
> execução manual quando você decidir publicar.

## Arquivo

```
supabase/functions/delete-account/index.ts
```

## Variáveis de ambiente (Function Secrets)

A função lê estas variáveis no ambiente de execução do Supabase:

| Variável                    | Origem                                   | Observação                              |
| --------------------------- | ---------------------------------------- | --------------------------------------- |
| `SUPABASE_URL`              | Injetada automaticamente pelo Supabase   | URL do projeto                          |
| `SUPABASE_ANON_KEY`         | Injetada automaticamente pelo Supabase   | Valida o JWT do chamador (sem privilégio) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** que você define manualmente   | NUNCA vai para o cliente / repositório  |

`SUPABASE_URL` e `SUPABASE_ANON_KEY` já são providos pela plataforma. Defina o
service role como secret:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<seu-service-role-key>
```

## Deploy manual

```bash
# 1. Login e link do projeto (uma vez)
supabase login
supabase link --project-ref <project-ref>

# 2. Deploy da função
supabase functions deploy delete-account

# 3. (opcional) Logs em tempo real
supabase functions logs delete-account --follow
```

> A função exige JWT válido (verify_jwt padrão do Supabase). Mantenha a
> verificação de JWT habilitada — o app envia o token da sessão atual.

## Como o app chama

`src/store/authStore.ts` → `deleteAccount()` invoca:

```ts
supabase.functions.invoke('delete-account');
```

O `supabase-js` anexa automaticamente o `Authorization: Bearer <access_token>`
da sessão ativa. A função identifica o usuário pelo token e apaga **somente** a
própria conta:

1. `user_sync_state` (linhas do usuário);
2. `profiles` (linha do usuário);
3. `auth.users` via `admin.deleteUser(userId)`.

Em caso de RLS com `on delete cascade` configurado nas tabelas, os passos 1 e 2
são redundantes, mas mantê-los torna a função robusta a configurações parciais.

## Segurança

- O cliente **nunca** executa exclusão diretamente nem possui o service role.
- A função só apaga o usuário **dono do token** — não aceita `userId` por
  parâmetro.
- Ao concluir, o app cancela uploads de sincronização, limpa o progresso local
  e encerra a sessão (`src/components/auth/AccountCard.tsx`).
