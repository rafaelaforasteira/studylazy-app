# Pacote de importação — ENEM 2023 D1 Caderno 1 Azul

Este pacote contém:

```text
docs/imports/enem/2023/filter-manifest.json
docs/imports/enem/2023/filter-manifest.ts
docs/imports/enem/2023/filter-report.md
docs/prompts/IMPORT_ENEM_2023_FULL_TEXT.md
```

## 1. Extraia na raiz do projeto

Projeto esperado:

```text
C:\Users\Windows\Desktop\studylazy-app
```

Ao extrair, permita mesclar a pasta `docs`.

## 2. Adicione os PDFs oficiais

Crie:

```text
docs/sources/enem/2023/d1-c1-azul/
```

Adicione:

```text
prova.pdf
gabarito.pdf
```

Sem esses PDFs, o manifesto fornece IDs e gabaritos, mas não contém os enunciados completos.

## 3. Confira os arquivos

No PowerShell:

```powershell
cd C:\Users\Windows\Desktop\studylazy-app

Get-ChildItem .\docs\imports\enem\2023
Get-ChildItem .\docs\prompts
Get-ChildItem .\docs\sources\enem\2023\d1-c1-azul
```

## 4. Crie uma branch

```powershell
git status
git branch --show-current

git switch main
git pull origin main
git switch -c feature/enem-2023-full-text-import
```

Não troque de branch se houver alterações ainda não salvas.

## 5. Abra o prompt no Cursor

Arquivo:

```text
docs/prompts/IMPORT_ENEM_2023_FULL_TEXT.md
```

No Agent, anexe:

```text
@docs/prompts/IMPORT_ENEM_2023_FULL_TEXT.md
@docs/imports/enem/2023/filter-manifest.json
@docs/imports/enem/2023/filter-report.md
@docs/sources/enem/2023/d1-c1-azul/prova.pdf
@docs/sources/enem/2023/d1-c1-azul/gabarito.pdf
```

Peça ao Agent:

```text
Execute integralmente as instruções do arquivo
@docs/prompts/IMPORT_ENEM_2023_FULL_TEXT.md.
```

## 6. Não faça commit antes da revisão

Primeiro execute e confira:

```powershell
npx tsx scripts/audit-enem-2023-full-text.ts
npx tsx scripts/audit-question-bank.ts
npx tsc --noEmit
npx expo lint
npx expo export --platform web
```

Depois revise visualmente a rota de desenvolvimento criada pelo Cursor.
