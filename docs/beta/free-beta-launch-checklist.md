# Checklist de lançamento — Beta gratuito StudyLazy

Use este checklist **manual** antes de convidar usuários reais. Complementa a tela in-app `/dev/beta-launch-checklist` (somente em desenvolvimento).

## Pré-requisitos técnicos

- [ ] Node.js e dependências instaladas (`npm install`)
- [ ] `.env` local com `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] `npx tsc --noEmit` sem erros
- [ ] `npx expo lint` sem erros
- [ ] `npx expo-doctor` 21/21
- [ ] Scripts de regressão passando (ver seção Validação automática)

## Supabase

- [ ] Projeto Supabase criado
- [ ] Tabelas de progresso com RLS ativo
- [ ] Chave **publishable (anon)** no app — nunca `service_role` no cliente
- [ ] Redirect URLs configuradas (ver `docs/account/REDIRECT_URLS.md`)
- [ ] E-mail de confirmação e recuperação testados

## Edge Function

- [ ] `delete-account` implantada (`docs/account/EDGE_FUNCTION_DELETE_ACCOUNT.md`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` apenas no ambiente da função
- [ ] Exclusão testada com conta descartável

## EAS e Android preview

- [ ] `eas.json` com profile `preview` (APK interno)
- [ ] Variáveis Supabase no EAS (`preview`)
- [ ] Build concluído: `eas build --platform android --profile preview`
- [ ] APK baixável e instalável em dispositivo físico
- [ ] Package `com.studylazy.app` correto

## Testes funcionais

### Web

- [ ] `npx expo export --platform web` conclui
- [ ] Onboarding e abas carregam
- [ ] Auth (login/cadastro) com Supabase configurado

### Android

- [ ] App abre sem crash
- [ ] Onboarding completo
- [ ] Modo convidado
- [ ] Login e cadastro
- [ ] Recuperação de senha (deep link `studylazy://auth/reset-password`)
- [ ] Sessões: Matemática, Português, Humanas, Natureza, Inglês/Espanhol
- [ ] Revisão de erros
- [ ] XP, streak e histórico
- [ ] Sistema de vidas: começa com 5; perde 1 ao errar; bloqueia com 0
- [ ] Regeneração de vida (~30 min) ou simulação em `/dev/lives-health`
- [ ] Questão errada volta com prioridade na próxima sessão (badge “Revisão de erro”)
- [ ] Sync com usuário logado
- [ ] Offline após primeiro uso
- [ ] Logout local e global
- [ ] Exclusão de conta (conta teste)

### Conta teste

- [ ] E-mail dedicado para QA (não usar conta pessoal)
- [ ] Senha forte; anotar credenciais em local seguro da equipe

### Convidado

- [ ] Entrar sem login
- [ ] Progresso local persiste
- [ ] Migração ao criar primeira conta (claim)

### Offline

- [ ] Avião mode: estudar e revisar funcionam
- [ ] Sync retoma ao reconectar (usuário logado)

### Sincronização

- [ ] Dois dispositivos ou web + Android com mesma conta
- [ ] XP/histórico convergem sem duplicar
- [ ] Conflito de conta diferente bloqueia envio

### Recuperação de senha

- [ ] E-mail recebido
- [ ] Link abre app no **mesmo aparelho**
- [ ] Nova senha aplicada

### Exclusão de conta

- [ ] Confirmação clara antes de excluir
- [ ] Progresso local limpo após exclusão
- [ ] Re-login impossível com conta removida

## Beta gratuito — sem cobrança

- [ ] Tela `/pro` mostra “Em breve” / lista de espera
- [ ] Nenhum botão “Assinar” ou “Restaurar compra”
- [ ] Nenhum SDK de pagamento no `package.json`
- [ ] Limites Free são informativos (`BETA_SOFT_LIMITS`) — estudo não bloqueado agressivamente

## Bugs conhecidos (preencher antes do lançamento)

| Bug | Severidade | Workaround | Status |
| --- | ---------- | ---------- | ------ |
| _exemplo: teclado cobre campo em telas pequenas_ | baixa | rolar manualmente | aberto |

## Critérios para liberar para **5 usuários**

- [ ] Todos os itens críticos de Abertura e conta marcados
- [ ] Pelo menos uma sessão por matéria testada no Android
- [ ] Sync + logout testados
- [ ] APK preview instalado nos 5 dispositivos ou sideload acordado
- [ ] Canal de feedback definido (WhatsApp, e-mail, formulário)
- [ ] Nenhum bug **crítico** aberto (crash, perda de progresso, auth quebrada)

## Critérios para liberar para **20 usuários**

- [ ] Todos os critérios de 5 usuários
- [ ] Recuperação de senha validada em produção
- [ ] Exclusão de conta validada
- [ ] Teste offline em pelo menos 2 aparelhos
- [ ] Sync validado entre 2 dispositivos
- [ ] Deep link documentado para suporte
- [ ] `docs/beta/known-limitations.md` revisado com usuários beta
- [ ] Monitoramento básico (Sentry ou logs Supabase) opcional mas recomendado

## Validação automática (rodar antes de cada build)

```bash
npx tsx scripts/test-free-beta-readiness.ts
npx tsx scripts/audit-free-beta-readiness.ts
npx tsx scripts/test-account-security.ts
npx tsx scripts/audit-account-security.ts
npx tsx scripts/test-supabase-progress-sync.ts
npx tsx scripts/audit-supabase-progress-sync.ts
npx tsx scripts/test-auth-foundation.ts
npx tsx scripts/test-mvp-critical-flows.ts
npx tsx scripts/audit-question-bank.ts
npx tsc --noEmit
npx expo lint
npx expo-doctor
npx expo export --platform web
```

Remova `dist/` após export web.
