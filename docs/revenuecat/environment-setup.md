# RevenueCat — Variáveis de ambiente

O StudyLazy usa **chaves públicas** do RevenueCat (prefixo `EXPO_PUBLIC_`). Nunca commite chaves reais nem use secret keys no app.

## Arquivo local

Copie `.env.example` para `.env` e preencha:

```text
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=
EXPO_PUBLIC_REVENUECAT_WEB_API_KEY=
```

| Variável | Uso |
| -------- | --- |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | Builds Android (Google Play) |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | Builds iOS (futuro App Store) |
| `EXPO_PUBLIC_REVENUECAT_WEB_API_KEY` | Web (RevenueCat Web Billing, opcional) |

Se a chave da plataforma atual estiver ausente, o app **não quebra**: a tela Pro mostra fallback "Em breve" e os limites Free continuam com soft override do beta.

## EAS Environment

Configure por ambiente (`preview`, `production`):

```bash
eas env:create --environment preview --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value "<sua-chave-android>" --visibility plaintext
eas env:create --environment preview --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value "<sua-chave-ios>" --visibility plaintext
eas env:create --environment preview --name EXPO_PUBLIC_REVENUECAT_WEB_API_KEY --value "<sua-chave-web>" --visibility plaintext
```

Liste para conferir:

```bash
eas env:list --environment preview
```

## Onde obter as chaves

1. [RevenueCat Dashboard](https://app.revenuecat.com/) → Project → **API keys**
2. Use a **public** API key de cada plataforma (não a secret key)
3. Android: chave do app Google Play
4. iOS: chave do app Apple (quando disponível)
5. Web: chave Web Billing (se usar assinatura na web)

## Desenvolvimento

- **Expo Go**: o SDK roda em Preview API Mode — compras reais exigem **development build** (EAS `preview`).
- Logs do RevenueCat aparecem apenas em `__DEV__` e **nunca** incluem chaves.

## Segurança

- Não sincronizamos recibos, tokens de loja ou payloads de pagamento via Supabase.
- Apenas estado derivado seguro é persistido localmente: `plan`, `source: revenuecat`, `entitlementCheckedAt`.
