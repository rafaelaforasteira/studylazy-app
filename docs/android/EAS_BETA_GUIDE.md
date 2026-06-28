# Beta Android com EAS

Guia para gerar o APK de beta interno do StudyLazy. **Nenhum build é executado
automaticamente** — os comandos abaixo são manuais.

## Identificação do app

| Item                | Valor                  | Onde                         |
| ------------------- | ---------------------- | ---------------------------- |
| Nome                | StudyLazy              | `app.json` → `expo.name`     |
| Slug                | studylazy-app          | `app.json` → `expo.slug`     |
| Android package     | `com.studylazy.app`    | `app.json` → `android.package` |
| iOS bundle id       | `com.studylazy.app`    | `app.json` → `ios.bundleIdentifier` |
| Scheme (deep link)  | `studylazy`            | `app.json` → `expo.scheme`   |
| versionCode inicial | `1`                    | `app.json` → `android.versionCode` |

## Perfis de build (`eas.json`)

| Perfil        | Distribuição | Saída Android | Uso                          |
| ------------- | ------------ | ------------- | ---------------------------- |
| `development` | internal     | APK           | Dev client                   |
| `preview`     | internal     | **APK**       | **Beta interno (este passo)** |
| `production`  | store        | app-bundle    | Publicação na Play Store     |

O perfil **`preview` gera APK** (`android.buildType: "apk"`) e usa
`distribution: "internal"` — ideal para distribuir o beta por link/arquivo sem
passar pela loja.

## Variáveis de ambiente (EAS)

O app precisa destas variáveis **públicas** em tempo de build (prefixo
`EXPO_PUBLIC_`, embarcadas no cliente):

| Variável                            | Descrição                          |
| ----------------------------------- | ---------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`          | URL do projeto Supabase            |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave **publishable/anon** (pública) |

> A chave publishable é projetada para o cliente. Mesmo assim, **não** a
> commitamos no repositório nem no `eas.json`. Use variáveis de ambiente
> gerenciadas pelo EAS por ambiente (`development` / `preview` / `production`),
> referenciadas via `"environment"` em cada perfil do `eas.json`.

Crie-as (uma vez por ambiente):

```bash
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://<ref>.supabase.co" --visibility plaintext
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "<publishable-key>" --visibility plaintext
```

Liste para conferir:

```bash
eas env:list --environment preview
```

O `SUPABASE_SERVICE_ROLE_KEY` **não** entra no app — ele vive apenas na Edge
Function (ver `docs/account/EDGE_FUNCTION_DELETE_ACCOUNT.md`).

## Gerar o APK de beta

```bash
# Login
eas login

# (primeira vez) cria o projeto EAS e grava extra.eas.projectId no app.json
eas init

# Build do APK de beta interno
eas build --platform android --profile preview
```

Ao final, o EAS fornece um link para baixar o APK e um QR Code para instalação
em aparelhos de teste.

## Redirect URLs (recuperação de senha)

O deep link `studylazy://auth/reset-password` precisa estar cadastrado no
Supabase. Consulte `docs/account/REDIRECT_URLS.md` para a lista completa de URLs
a adicionar em `Authentication → URL Configuration`.

## Checklist de teste

Antes de distribuir, percorra `docs/android/ANDROID_TEST_CHECKLIST.md`.
