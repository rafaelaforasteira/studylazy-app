# Checklist de Teste — Beta Android (APK preview)

Use em um aparelho Android real com o APK do perfil `preview` instalado.

## Instalação e inicialização

- [ ] APK instala sem erros (permitir "fontes desconhecidas" se necessário).
- [ ] App abre direto na tela inicial correta (onboarding, welcome ou app).
- [ ] Ícone e nome do app aparecem corretos no launcher.
- [ ] Modo escuro renderiza sem telas brancas/quebradas.

## Modo convidado e progresso local

- [ ] É possível usar o app como convidado (sem login).
- [ ] XP, sequência, histórico e erros persistem após fechar e reabrir o app.
- [ ] As 149 questões oficiais carregam normalmente.

## Autenticação

- [ ] Cadastro com e-mail/senha envia e-mail de confirmação.
- [ ] Login com conta confirmada funciona.
- [ ] Mensagens de erro aparecem em português e sem dados sensíveis.
- [ ] Sem conexão: o app continua utilizável em modo convidado.

## Recuperação de senha (deep link + PKCE)

- [ ] "Esqueci minha senha" envia o e-mail de recuperação.
- [ ] Abrir o link **no mesmo aparelho** abre `studylazy://auth/reset-password`.
- [ ] A nova senha é aceita e o usuário entra na conta.
- [ ] Abrir o link em **outro** aparelho mostra mensagem amigável (PKCE).
- [ ] Link expirado/usado mostra "Solicitar novo link".

## Segurança da conta (autenticado)

- [ ] "Alterar senha" atualiza a senha e mostra confirmação.
- [ ] "Sair deste aparelho" volta ao modo convidado mantendo o progresso local.
- [ ] "Sair de todos os dispositivos" encerra a sessão (testar em 2 aparelhos).
- [ ] "Excluir conta" pede dupla confirmação, remove a conta e limpa o local.
- [ ] Após excluir, não é possível logar com a mesma conta.

## Sincronização de progresso

- [ ] Login em aparelho novo recupera XP/histórico/erros da nuvem.
- [ ] Status de sincronização aparece no card de conta.
- [ ] Logout cancela uploads pendentes (sem erros no console).
- [ ] Conflito de propriedade exibe aviso e ação "Sair desta conta".

## Diagnóstico (telas de dev)

- [ ] `/dev/account-security-health` reflete o estado real da conta.
- [ ] `/dev/android-beta-health` mostra package, scheme, versão e variáveis.
- [ ] Nenhuma tela de diagnóstico exibe tokens, chaves ou payload completo.

## Estabilidade geral

- [ ] Navegação entre abas sem travar.
- [ ] Sessão de estudo completa do início ao fim.
- [ ] Botão "voltar" do Android se comporta de forma previsível.
- [ ] App reabre no estado esperado após ser enviado para segundo plano.
