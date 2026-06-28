import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../../components/ui/PrimaryButton';
import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { maskEmail, maskId } from '../../lib/authFlow';
import { useAppHydration } from '../../hooks/use-app-hydration';
import { useAuthStore } from '../../store/authStore';
import { useSyncStore } from '../../store/syncStore';
import {
  buildLocalPayload,
  fetchRemoteForDiagnostics,
  syncNow,
} from '../../sync/syncCoordinator';
import { estimatePayloadSize } from '../../sync/syncSerializer';

export default function SyncHealthScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }
  return <SyncHealthContent />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function SyncHealthContent() {
  const hydrated = useAppHydration();
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);

  const sync = useSyncStore();

  const [remoteInfo, setRemoteInfo] = useState<string>('—');
  const [serializeInfo, setSerializeInfo] = useState<string>('—');
  const [copied, setCopied] = useState(false);

  const payload = buildLocalPayload();
  const payloadSize = estimatePayloadSize(payload);

  function buildDiagnostic() {
    return [
      `authenticated: ${session ? 'sim' : 'não'}`,
      `hydrated: ${hydrated ? 'sim' : 'não'}`,
      `status: ${sync.status}`,
      `conflictKind: ${sync.conflictKind}`,
      `deviceId: ${maskId(sync.deviceId)}`,
      `ownerUserId: ${maskId(sync.localOwnerUserId)}`,
      `userId: ${maskId(user?.id)}`,
      `email: ${maskEmail(user?.email)}`,
      `revision: ${sync.lastKnownRevision ?? '—'}`,
      `lastSyncedAt: ${sync.lastSyncedAt ?? '—'}`,
      `lastAttemptAt: ${sync.lastAttemptAt ?? '—'}`,
      `isDirty: ${sync.isDirty}`,
      `initialSyncDone: ${sync.hasCompletedInitialSync}`,
      `schemaVersion: ${payload.version}`,
      `payloadBytes: ~${payloadSize}`,
      `sessions: ${payload.progress.history.length}`,
      `performance: ${Object.keys(payload.progress.questionPerformance).length}`,
      `mistakes: ${payload.mistakes.items.length}`,
      `recentIds: ${payload.progress.recentQuestionIds.length}`,
      `lastError: ${sync.error ?? '—'}`,
      `remote: ${remoteInfo}`,
    ].join('\n');
  }

  async function handleFetchRemote() {
    setRemoteInfo('buscando…');
    const info = await fetchRemoteForDiagnostics();
    setRemoteInfo(
      `perfil=${info.profileExists ? 'sim' : 'não'} snapshot=${
        info.snapshotExists ? 'sim' : 'não'
      } rev=${info.revision ?? '—'}`
    );
  }

  function handleSimulateSerialize() {
    const sample = buildLocalPayload();
    setSerializeInfo(
      `ok • ${estimatePayloadSize(sample)} bytes • ${sample.progress.history.length} sessões`
    );
  }

  async function handleCopy() {
    const text = buildDiagnostic();
    const clipboard = (globalThis as { navigator?: { clipboard?: { writeText?: (value: string) => Promise<void> } } })
      ?.navigator?.clipboard;
    if (clipboard?.writeText) {
      try {
        await clipboard.writeText(text);
      } catch {
        // Ignora falha de clipboard em ambientes sem suporte.
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Sync Health</Text>
      <Text style={styles.subtitle}>/dev/sync-health</Text>

      <View style={styles.card}>
        <Row label="Status" value={session ? 'autenticado' : 'convidado'} />
        <Row label="Stores hidratados" value={hydrated ? 'sim' : 'não'} />
        <Row label="Sync status" value={sync.status} />
        <Row label="Conflito" value={sync.conflictKind} />
        <Row label="Device ID" value={maskId(sync.deviceId)} />
        <Row label="Owner ID" value={maskId(sync.localOwnerUserId)} />
        <Row label="User ID" value={maskId(user?.id)} />
        <Row label="E-mail" value={maskEmail(user?.email)} />
        <Row label="Revision local" value={String(sync.lastKnownRevision ?? '—')} />
        <Row label="lastSyncedAt" value={sync.lastSyncedAt ?? '—'} />
        <Row label="lastAttemptAt" value={sync.lastAttemptAt ?? '—'} />
        <Row label="isDirty" value={String(sync.isDirty)} />
        <Row label="initialSync" value={String(sync.hasCompletedInitialSync)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Snapshot local</Text>
        <Row label="Schema version" value={String(payload.version)} />
        <Row label="Payload (aprox.)" value={`~${payloadSize} bytes`} />
        <Row label="Sessões" value={String(payload.progress.history.length)} />
        <Row
          label="Desempenhos"
          value={String(Object.keys(payload.progress.questionPerformance).length)}
        />
        <Row label="Erros" value={String(payload.mistakes.items.length)} />
        <Row
          label="IDs recentes"
          value={String(payload.progress.recentQuestionIds.length)}
        />
        <Row label="Último erro" value={sync.error ?? '—'} />
        <Row label="Remoto" value={remoteInfo} />
        <Row label="Serialização" value={serializeInfo} />
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Sincronizar agora"
          variant="secondary"
          onPress={() => void syncNow()}
        />
        <PrimaryButton
          label="Buscar remoto"
          variant="secondary"
          onPress={() => void handleFetchRemote()}
        />
        <PrimaryButton
          label="Simular serialização"
          variant="secondary"
          onPress={handleSimulateSerialize}
        />
        <PrimaryButton
          label={copied ? 'Copiado!' : 'Copiar diagnóstico'}
          variant="secondary"
          onPress={() => void handleCopy()}
        />
      </View>

      <Text style={styles.note}>
        Nunca exibe tokens, chaves, payload integral, e-mail completo ou
        conteúdo das questões.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  blocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  blockedText: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
  },
  title: { color: colors.text.primary, ...typography.title },
  subtitle: { color: colors.text.muted, ...typography.bodySmall },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text.primary,
    ...typography.label,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: {
    color: colors.text.secondary,
    ...typography.bodySmall,
    flexShrink: 1,
  },
  rowValue: {
    color: colors.text.primary,
    ...typography.bodySmall,
    fontWeight: '700',
    textAlign: 'right',
    flexShrink: 1,
  },
  actions: { gap: spacing.sm },
  note: {
    color: colors.text.muted,
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
