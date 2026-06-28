# Redirect URLs — Recuperação de Senha (PKCE)

O fluxo "esqueci minha senha" usa **PKCE**. O e-mail de recuperação redireciona
o usuário de volta ao app através de um deep link. Para o Supabase aceitar esse
redirecionamento, as URLs precisam estar cadastradas no painel.

## Deep link do app

- **Scheme:** `studylazy` (definido em `app.json` → `expo.scheme`)
- **Deep link de redefinição:** `studylazy://auth/reset-password`

O app gera a URL em runtime com `expo-linking`:

```ts
Linking.createURL('/auth/reset-password');
// standalone (Android/iOS): studylazy://auth/reset-password
// dev client / Expo Go:      exp://<host>/--/auth/reset-password
// web:                       http://localhost:8081/auth/reset-password
```

## Onde cadastrar (Supabase Dashboard)

`Authentication → URL Configuration`

### Site URL

- Produção web (quando houver): `https://<seu-dominio>`

### Redirect URLs (Additional Redirect URLs)

Adicione **todas** as variantes que você usa:

```
studylazy://auth/reset-password
studylazy://**
exp://**            (apenas para desenvolvimento com Expo Go / dev client)
http://localhost:8081/auth/reset-password   (web em desenvolvimento)
https://<seu-dominio>/auth/reset-password    (web em produção)
```

> Use os padrões com `**` apenas durante o desenvolvimento. Em produção,
> prefira listar as URLs exatas.

## Observações importantes do PKCE

- O `code_verifier` é gerado e guardado no **mesmo aparelho** que solicitou a
  recuperação. Portanto, o link **deve ser aberto no mesmo dispositivo** onde o
  usuário pediu a redefinição. Abrir em outro aparelho falha a troca de código
  (mensagem amigável é exibida e o usuário pode pedir um novo link).
- `detectSessionInUrl: false` no cliente (`src/lib/supabase.ts`): a troca de
  código é feita manualmente em `src/app/auth/reset-password.tsx` via
  `exchangeCodeForSession(code)`.
- `flowType: 'pkce'` está habilitado no cliente.

## Template de e-mail (opcional)

Em `Authentication → Email Templates → Reset Password`, o link padrão
`{{ .ConfirmationURL }}` já respeita o `redirectTo` enviado pelo app. Não é
necessário alterar o template para o fluxo funcionar.
