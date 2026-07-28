-- StudyLazy beta: tabela de feedback / NPS
-- Execute manualmente no SQL Editor do Supabase.
-- O app NÃO aplica esta migration automaticamente.

create table if not exists public.user_feedback (
  id text primary key,
  user_id uuid references auth.users (id) on delete set null,
  guest_id text,
  kind text not null check (kind in ('nps', 'bug', 'suggestion', 'general')),
  score integer check (score is null or (score >= 0 and score <= 10)),
  nps_group text check (
    nps_group is null
    or nps_group in ('detractor', 'passive', 'promoter')
  ),
  comment text,
  improvement text,
  screen text,
  platform text,
  app_version text,
  created_at timestamptz not null default now()
);

create index if not exists user_feedback_created_at_idx
  on public.user_feedback (created_at desc);

create index if not exists user_feedback_user_id_idx
  on public.user_feedback (user_id);

alter table public.user_feedback enable row level security;

-- Usuário autenticado pode inserir apenas linhas com o próprio user_id.
drop policy if exists "user_feedback_insert_own" on public.user_feedback;
create policy "user_feedback_insert_own"
  on public.user_feedback
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Usuário autenticado lê apenas o próprio feedback.
drop policy if exists "user_feedback_select_own" on public.user_feedback;
create policy "user_feedback_select_own"
  on public.user_feedback
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Feedback anônimo (convidado): insert sem user_id, com guest_id.
-- Observação: em produção, considere rate limiting no Edge Function se abuso.
drop policy if exists "user_feedback_insert_guest" on public.user_feedback;
create policy "user_feedback_insert_guest"
  on public.user_feedback
  for insert
  to anon
  with check (user_id is null and guest_id is not null);

-- Observações:
-- 1) Crie a tabela antes de liberar o beta com sync de feedback.
-- 2) Se a tabela não existir, o app mantém feedbacks como pending localmente.
-- 3) Nunca armazene enunciados de questões, tokens ou senhas nesta tabela.
-- 4) Para análise interna, use o painel /dev/feedback-dashboard (dados locais)
--    ou o Table Editor do Supabase (somente equipe).
