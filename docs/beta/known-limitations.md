# Limitações conhecidas — Beta gratuito StudyLazy

Documento para usuários beta e equipe interna. Atualize conforme novas limitações forem descobertas.

## Produto e pagamento

- **Sem pagamento real** nesta versão. Não há assinatura, cartão ou cobrança pela loja.
- **StudyLazy Pro** é conceito futuro. A tela `/pro` é informativa (lista de espera).
- Limites do plano gratuito existem na estrutura do app, mas durante o beta interno o estudo **não é bloqueado de forma agressiva** (`BETA_SOFT_LIMITS`).

## Plataformas

- **Android preview (APK)** via EAS — principal alvo do beta.
- **Web** suportada para desenvolvimento e testes; experiência mobile é a referência.
- **iOS** ainda não disponível (sem build App Store / TestFlight).

## Conteúdo

- **149 questões oficiais** ENEM (2023 + amostra 2024).
- **Inglês e Espanhol**: 4 questões oficiais cada — sessões de idioma retornam no máximo 4 itens.
- **Questões visuais** (gráficos, imagens complexas) podem ter renderização imperfeita; revisão visual pendente.
- Sem novas provas além do banco oficial atual nesta versão.

## Conta e e-mail

- Autenticação via **Supabase Auth** (e-mail/senha).
- E-mails transacionais (confirmação, recuperação) dependem da configuração do projeto Supabase.
- **Validação de produção de e-mail** (SPF, DKIM, domínio customizado) pode ainda estar pendente — e-mails podem ir para spam.
- Recuperação de senha exige abrir o link no **mesmo aparelho** em que solicitou o reset (deep link `studylazy://`).

## Sincronização

- Sync **offline-first**: progresso local é preservado; nuvem atualiza quando online.
- Apenas **progresso derivado seguro** é sincronizado — nunca enunciados, gabaritos ou tokens.
- Conta diferente no mesmo aparelho pode gerar conflito de propriedade (bloqueio intencional).
- Convidado que cria conta depois: progresso local migra na primeira sync (claim).

## Segurança

- Exclusão de conta é **permanente** via Edge Function server-side.
- Logout local mantém progresso neste aparelho; logout global encerra sessões em todos os dispositivos.

## Testes ainda necessários

- [ ] Matriz de dispositivos Android (fabricantes, versões OS)
- [ ] Rede instável / modo avião prolongado
- [ ] Deep link em cold start vs app em background
- [ ] Cadastro com e-mail real em produção
- [ ] Volume: 20+ usuários simultâneos (opcional)

## O que NÃO é limitação (funciona)

- Onboarding completo
- Modo convidado
- Sessões por matéria
- Revisão de erros
- XP, streak e histórico local
- Motor inteligente de seleção de questões
- Escolha Inglês/Espanhol

## Próximas entregas (pós-beta gratuito)

1. Polimento visual e acessibilidade
2. Mais questões oficiais
3. StudyLazy Pro com pagamento real (futuro)
4. iOS
5. E-mail transacional em domínio próprio
