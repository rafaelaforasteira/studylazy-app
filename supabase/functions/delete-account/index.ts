// Supabase Edge Function: delete-account
//
// Exclui de forma segura a conta do usuário AUTENTICADO que chamou a função.
// O service role NUNCA é exposto ao cliente — ele existe apenas neste ambiente
// de servidor (Deno) e é lido de variáveis de ambiente.
//
// Fluxo:
//   1. Lê o JWT do header Authorization (Bearer) enviado pelo app.
//   2. Valida o token e descobre o user.id com a chave anônima (sem privilégio).
//   3. Usa o service role para apagar os dados do usuário e, por fim, o usuário
//      no Auth (admin.deleteUser). RLS garante que cada um só apague o próprio.
//
// Deploy e variáveis: ver docs/account/EDGE_FUNCTION_DELETE_ACCOUNT.md
//
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
    return json({ error: 'Server not configured' }, 500);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return json({ error: 'Missing authorization' }, 401);
  }

  // Cliente "como usuário": valida o token e identifica o chamador.
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData?.user) {
    return json({ error: 'Invalid session' }, 401);
  }
  const userId = userData.user.id;

  // Cliente administrativo: privilégios de service role (somente no servidor).
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // Remove os dados de aplicação do usuário antes de apagar o usuário.
    await adminClient.from('user_sync_state').delete().eq('user_id', userId);
    await adminClient.from('profiles').delete().eq('id', userId);

    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      return json({ error: 'Failed to delete account' }, 500);
    }
  } catch (_error) {
    return json({ error: 'Failed to delete account' }, 500);
  }

  return json({ status: 'deleted' }, 200);
});
