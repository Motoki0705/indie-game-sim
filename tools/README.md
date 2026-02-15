# Image Generation Tools

## Nano Banana Pro CLI

`tools/nanobanana-pro-generate.mjs` は `.env` の API キーを使って Gemini 画像モデルへプロンプト送信し、画像ファイルを保存します。

対応キー:
- `GEMINI_API_KEY`
- `GOOGLE_API_KEY`
- `gemini-api-key`

実行例:

```bash
node tools/nanobanana-pro-generate.mjs \
  --prompt "pixel-art style game button icon, rounded square, transparent background" \
  --out frontend/src/assets/ui-game/icons/button_test.png
```

オプション:
- `--model` (default: `gemini-3-pro-image-preview`)
- `--aspect` (default: `1:1`)
- `--size` (default: `1K`)

## Manifest Builder + Batch Runner

`tools/image-gen/build-and-run.mjs` は `docs/image-gen/jobs/assets-manifest.json` を読み、
`default_context_refs` + `component_file` からプロンプトを組み立てて画像生成します。

ドライラン（API未実行）:

```bash
node tools/image-gen/build-and-run.mjs --dry-run
```

特定ジョブのみ:

```bash
node tools/image-gen/build-and-run.mjs --job asset.panels.header_frame --dry-run --print-prompts
```

実行（並列4）:

```bash
node tools/image-gen/build-and-run.mjs --concurrency 4
```

主なオプション:
- `--manifest`
- `--job`
- `--model`
- `--size`
- `--aspect`
- `--concurrency`
- `--dry-run`
- `--print-prompts`
