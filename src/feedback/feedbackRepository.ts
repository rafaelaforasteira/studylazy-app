/**
 * Repository isolado para feedback do beta.
 * Não compartilha fluxo com a sync de progresso.
 * Falha graciosamente se a tabela ainda não existir.
 */
import { isNetworkError } from '../lib/authErrors';
import { supabase } from '../lib/supabase';
import type { FeedbackEntry } from './feedbackTypes';

export type FeedbackInsertResult =
  | { ok: true }
  | { ok: false; kind: 'network' | 'unavailable' | 'unknown'; message: string };

function warnDev(message: string) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`[feedback] ${message}`);
  }
}

function toRow(entry: FeedbackEntry) {
  return {
    id: entry.id,
    user_id: entry.userId,
    guest_id: entry.guestId,
    kind: entry.kind,
    score: entry.score,
    nps_group: entry.npsGroup,
    comment: entry.comment,
    improvement: entry.improvement,
    screen: entry.screen,
    platform: entry.platform,
    app_version: entry.appVersion,
    created_at: entry.createdAt,
  };
}

/**
 * Insere um feedback em `user_feedback`.
 * Nunca envia enunciados, tokens ou payload de progresso.
 */
export async function insertUserFeedback(
  entry: FeedbackEntry
): Promise<FeedbackInsertResult> {
  if (!supabase) {
    return {
      ok: false,
      kind: 'unavailable',
      message: 'Supabase não configurado.',
    };
  }

  try {
    const { error } = await supabase.from('user_feedback').insert(toRow(entry));

    if (error) {
      const message = error.message ?? 'Falha ao enviar feedback.';
      // Tabela ausente / RLS / schema — não quebra o app.
      if (
        /relation .* does not exist|Could not find the table|schema cache/i.test(
          message
        )
      ) {
        warnDev('Tabela user_feedback ausente — feedback permanece pendente.');
        return { ok: false, kind: 'unavailable', message };
      }
      warnDev(`Insert falhou: ${message}`);
      return {
        ok: false,
        kind: isNetworkError({ message }) ? 'network' : 'unknown',
        message,
      };
    }

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro inesperado no feedback.';
    warnDev(message);
    return {
      ok: false,
      kind: isNetworkError({ message }) ? 'network' : 'unknown',
      message,
    };
  }
}
