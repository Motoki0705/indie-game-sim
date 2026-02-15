#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DEFAULT_MODEL = "gemini-2.5-flash-image";
const DEFAULT_ASPECT_RATIO = "1:1";
const DEFAULT_IMAGE_SIZE = "1K";
const MIME_EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

function printUsage() {
  console.log(`Usage:
  node tools/nanobanana-pro-generate.mjs --prompt "..." [options]

Options:
  --prompt <text>        Prompt text (required)
  --out <path>           Output image path (default: images/nanobanana-<timestamp>.<ext>)
  --model <name>         Model name (default: ${DEFAULT_MODEL})
  --aspect <ratio>       Aspect ratio (default: ${DEFAULT_ASPECT_RATIO})
  --size <1K|2K|4K>      Image size (default: ${DEFAULT_IMAGE_SIZE})
  --help                 Show this help
`);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help") {
      args.help = true;
      continue;
    }
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    args[key] = value;
    i += 1;
  }
  return args;
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};

  const raw = fs.readFileSync(envPath, "utf8");
  const env = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function resolveApiKey() {
  const envPath = path.resolve(process.cwd(), ".env");
  const fileEnv = loadEnvFile(envPath);

  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env["gemini-api-key"] ||
    fileEnv.GEMINI_API_KEY ||
    fileEnv.GOOGLE_API_KEY ||
    fileEnv["gemini-api-key"]
  );
}

async function generateImage({ prompt, outPath, model, aspectRatio, imageSize, apiKey }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        aspectRatio,
        imageSize,
      },
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!response.ok) {
    const detail = json?.error?.message || JSON.stringify(json);
    throw new Error(`Gemini API error (${response.status}): ${detail}`);
  }

  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  const textPart = parts.find((p) => typeof p.text === "string");

  if (!imagePart) {
    throw new Error(`No image data returned. Response text: ${textPart?.text || "<none>"}`);
  }

  const mimeType = imagePart.inlineData.mimeType || "image/png";
  const ext = MIME_EXT[mimeType] || ".bin";
  const resolvedOutPath = outPath || path.resolve(process.cwd(), `images/nanobanana-${Date.now()}${ext}`);

  fs.mkdirSync(path.dirname(resolvedOutPath), { recursive: true });
  fs.writeFileSync(resolvedOutPath, Buffer.from(imagePart.inlineData.data, "base64"));

  return {
    outPath: resolvedOutPath,
    text: textPart?.text || "",
    mimeType,
  };
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    printUsage();
    return;
  }

  const prompt = args.prompt;
  if (!prompt) {
    printUsage();
    throw new Error("--prompt is required");
  }

  const apiKey = resolveApiKey();
  if (!apiKey) {
    throw new Error("API key not found. Set GEMINI_API_KEY/GOOGLE_API_KEY or add gemini-api-key to .env");
  }

  const model = args.model || DEFAULT_MODEL;
  const aspectRatio = args.aspect || DEFAULT_ASPECT_RATIO;
  const imageSize = (args.size || DEFAULT_IMAGE_SIZE).toUpperCase();

  const outPath = args.out ? path.resolve(process.cwd(), args.out) : null;

  const result = await generateImage({
    prompt,
    outPath,
    model,
    aspectRatio,
    imageSize,
    apiKey,
  });

  console.log(`Saved: ${result.outPath}`);
  console.log(`MIME: ${result.mimeType}`);
  if (outPath) {
    const requestedExt = path.extname(outPath).toLowerCase();
    const actualExt = MIME_EXT[result.mimeType] || "";
    if (requestedExt && actualExt && requestedExt !== actualExt) {
      console.log(
        `Note: requested extension (${requestedExt}) differs from generated MIME (${result.mimeType}, suggested ${actualExt}).`
      );
    }
  }
  if (result.text) {
    console.log("Model text:");
    console.log(result.text);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
