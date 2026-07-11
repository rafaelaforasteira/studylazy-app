# RevenueCat — Configuração de produtos

Os produtos **não são criados automaticamente** pelo app. Eles precisam existir nas lojas e no RevenueCat antes de testar compra real.

## Entitlement

| Identificador | Descrição |
| ------------- | --------- |
| `pro` | Acesso StudyLazy Pro (única fonte de verdade via RevenueCat) |

Configure em **RevenueCat Dashboard → Entitlements** com o identificador exatamente `pro`.

## Produtos esperados

| ID do produto | Tipo | Uso no app |
| ------------- | ---- | ----------- |
| `studylazy_pro_monthly` | Assinatura mensal | Plano mensal na tela `/pro` |
| `studylazy_pro_annual` | Assinatura anual | Plano anual na tela `/pro` |

Constantes em código: `src/entitlements/revenueCatProducts.ts`.

Você pode usar IDs equivalentes, mas **documente e alinhe** entre Play Console, RevenueCat e o offering `current`.

## Google Play Console

O Google Play organiza assinaturas em:

1. **Produto de assinatura** (ex.: `studylazy_pro_monthly`)
2. **Plano-base** (preço e período)
3. **Ofertas** (opcional: trial, intro)

Passos manuais:

1. Play Console → seu app → **Monetização → Assinaturas**
2. Criar assinatura `studylazy_pro_monthly` com plano-base mensal
3. Criar assinatura `studylazy_pro_annual` com plano-base anual
4. Ativar produtos e vincular ao app em teste interno

## RevenueCat Dashboard

1. **Products**: importar ou criar produtos com os mesmos IDs da Play Store
2. **Entitlements**: vincular produtos ao entitlement `pro`
3. **Offerings**: criar offering (ex.: `default`) como `current`, com packages mensal e anual

## App Store Connect (futuro)

Quando publicar no iOS:

1. Criar assinaturas com os mesmos IDs (ou mapear no RevenueCat)
2. Vincular App Store Connect ao RevenueCat
3. Usar `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` no build iOS

## Teste de compra real

Pré-requisitos:

- [ ] Conta de teste na Google Play (licença de teste)
- [ ] APK/AAB de development build com package `com.studylazy.app`
- [ ] Produtos ativos na Play Console
- [ ] Offering `current` no RevenueCat
- [ ] Chave Android configurada no EAS/local `.env`
- [ ] Usuário **logado** no StudyLazy (compra exige conta)

Sandbox: compras de teste não cobram valor real, mas passam pelo fluxo da loja.

## Web (opcional)

RevenueCat Web Billing requer Stripe conectado no dashboard. Configure `EXPO_PUBLIC_REVENUECAT_WEB_API_KEY` apenas se for oferecer Pro na web.
