#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DEFAULT_MANIFEST = "docs/image-gen/jobs/assets-manifest.json";
const DEFAULT_MODEL = "gemini-3-pro-image-preview";
const DEFAULT_SIZE = "1K";
const DEFAULT_CONCURRENCY = 4;
const MIME_EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

function printUsage() {
  console.log(`Usage:
  node tools/image-gen/build-and-run.mjs [options]

Options:
  --manifest <path>       Manifest JSON path (default: ${DEFAULT_MANIFEST})
  --job <id1,id2,...>     Run only specified job_id values
  --model <name>          Override model for all jobs
  --size <1K|2K|4K>       Override image size for all jobs
  --aspect <ratio>        Override aspect ratio for all jobs (e.g. 1:1, 16:9)
  --concurrency <n>       Parallel job count (default: ${DEFAULT_CONCURRENCY})
  --dry-run               Build prompts only (no API call)
  --print-prompts         Print full prompt text
  --help                  Show this help
`);
}

function parseArgs(argv) {
  const args = { dryRun: false, printPrompts: false };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help") {
      args.help = true;
      continue;
    }
    if (key === "dry-run") {
      args.dryRun = true;
      continue;
    }
    if (key === "print-prompts") {
      args.printPrompts = true;
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

function parseComponentFile(raw) {
  const lines = raw.split(/\r?\n/);
  const meta = {};
  const sections = {};
  let currentSection = null;

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim().toLowerCase();
      if (!sections[currentSection]) sections[currentSection] = [];
      continue;
    }

    if (!currentSection) {
      const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.+)$/);
      if (kv) {
        meta[kv[1].trim()] = kv[2].trim();
      }
      continue;
    }

    if (line.trim().length > 0) {
      sections[currentSection].push(line.trim());
    }
  }

  return {
    meta,
    sections: Object.fromEntries(
      Object.entries(sections).map(([k, v]) => [k, v.join(" ")])
    ),
  };
}

function inferAspectFromSizeHint(sizeHint) {
  const supported = [
    { label: "1:1", value: 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:4", value: 3 / 4 },
    { label: "16:9", value: 16 / 9 },
    { label: "9:16", value: 9 / 16 },
  ];

  if (!sizeHint) return "1:1";
  const match = sizeHint.match(/^(\d+)x(\d+)$/i);
  if (!match) return "1:1";
  const w = Number(match[1]);
  const h = Number(match[2]);
  if (!w || !h) return "1:1";

  const ratio = w / h;
  let best = supported[0];
  let bestDiff = Math.abs(best.value - ratio);
  for (const candidate of supported.slice(1)) {
    const diff = Math.abs(candidate.value - ratio);
    if (diff < bestDiff) {
      best = candidate;
      bestDiff = diff;
    }
  }
  return best.label;
}

function buildPrompt({ contextTexts, component }) {
  const intent = component.sections.intent || "";
  const shapeRules = component.sections.shape_rules || "";
  const mustNot = component.sections.must_not || "";
  const acceptance = component.sections.acceptance || "";

  return [
    "You are generating one production-ready game UI asset.",
    "",
    "[GLOBAL_CONTEXT]",
    ...contextTexts,
    "",
    "[COMPONENT_SPEC]",
    `component_id: ${component.meta.component_id || "unknown"}`,
    `target_path: ${component.meta.target_path || "unknown"}`,
    `size_hint: ${component.meta.size_hint || "unspecified"}`,
    `intent: ${intent}`,
    `shape_rules: ${shapeRules}`,
    `must_not: ${mustNot}`,
    `acceptance: ${acceptance}`,
    "",
    "[OUTPUT_CONTRACT]",
    "- Output exactly one asset centered in frame.",
    "- Keep pixel-perfect edges.",
    "- No text labels, logos, or watermark.",
    "- Prefer transparent background unless component implies a solid base.",
    "- Match the component intent and constraints strictly.",
  ].join("\n");
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
  if (!imagePart) {
    throw new Error("No image data returned.");
  }

  const mimeType = imagePart.inlineData.mimeType || "image/png";
  const ext = MIME_EXT[mimeType] || ".bin";

  const requestedExt = path.extname(outPath).toLowerCase();
  let resolvedOutPath = outPath;
  if (requestedExt && MIME_EXT[mimeType] && requestedExt !== MIME_EXT[mimeType]) {
    resolvedOutPath = `${outPath}${ext}`;
  }

  fs.mkdirSync(path.dirname(resolvedOutPath), { recursive: true });
  fs.writeFileSync(resolvedOutPath, Buffer.from(imagePart.inlineData.data, "base64"));

  return { outPath: resolvedOutPath, mimeType };
}

function withVariantSuffix(targetPath, index, total) {
  if (total <= 1) return targetPath;
  const ext = path.extname(targetPath);
  const base = targetPath.slice(0, -ext.length);
  return `${base}_v${index}${ext}`;
}

async function runWithConcurrency(tasks, concurrency) {
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const current = index;
      index += 1;
      await tasks[current]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printUsage();
    return;
  }

  const manifestPath = path.resolve(process.cwd(), args.manifest || DEFAULT_MANIFEST);
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const selected = new Set(
    (args.job || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

  const jobs = (manifest.jobs || []).filter((job) => {
    if (selected.size === 0) return true;
    return selected.has(job.job_id);
  });

  if (jobs.length === 0) {
    throw new Error("No jobs selected.");
  }

  const apiKey = resolveApiKey();
  if (!args.dryRun && !apiKey) {
    throw new Error("API key not found. Set GEMINI_API_KEY/GOOGLE_API_KEY or add it to .env");
  }

  const concurrency = Math.max(1, Number(args.concurrency || DEFAULT_CONCURRENCY));
  const failures = [];

  const tasks = jobs.flatMap((job) => {
    const variants = Math.max(1, Number(job.n || 1));
    return Array.from({ length: variants }, (_, idx) => async () => {
      const variant = idx + 1;
      const componentPath = path.resolve(process.cwd(), job.component_file);
      if (!fs.existsSync(componentPath)) {
        throw new Error(`[${job.job_id}] component file not found: ${componentPath}`);
      }

      const componentRaw = fs.readFileSync(componentPath, "utf8");
      const component = parseComponentFile(componentRaw);

      const contextRefs = job.context_refs || manifest.default_context_refs || [];
      const contextTexts = contextRefs.map((ref) => {
        const absolute = path.resolve(process.cwd(), ref);
        if (!fs.existsSync(absolute)) {
          throw new Error(`[${job.job_id}] context file not found: ${ref}`);
        }
        return fs.readFileSync(absolute, "utf8").trim();
      });

      const prompt = buildPrompt({ contextTexts, component });
      const model = args.model || job.model || DEFAULT_MODEL;
      const size = (args.size || job.size || DEFAULT_SIZE).toUpperCase();
      const aspect = args.aspect || job.aspect || inferAspectFromSizeHint(component.meta.size_hint);
      const target = withVariantSuffix(job.target_image, variant, variants);
      const outPath = path.resolve(process.cwd(), target);

      if (args.printPrompts || args.dryRun) {
        console.log(`\n[${job.job_id}][v${variant}]`);
        console.log(`out: ${target}`);
        console.log(`model: ${model}, aspect: ${aspect}, size: ${size}`);
        if (args.printPrompts) {
          console.log("--- prompt ---");
          console.log(prompt);
          console.log("--- end prompt ---");
        }
      }

      if (args.dryRun) return;

      try {
        const result = await generateImage({
          prompt,
          outPath,
          model,
          aspectRatio: aspect,
          imageSize: size,
          apiKey,
        });
        console.log(`[ok] ${job.job_id} v${variant} -> ${path.relative(process.cwd(), result.outPath)} (${result.mimeType})`);
      } catch (err) {
        failures.push({ jobId: job.job_id, variant, error: String(err.message || err) });
        console.error(`[failed] ${job.job_id} v${variant}: ${err.message || err}`);
      }
    });
  });

  await runWithConcurrency(tasks, concurrency);

  if (failures.length > 0) {
    console.error(`\nCompleted with ${failures.length} failure(s).`);
    for (const f of failures) {
      console.error(`- ${f.jobId} v${f.variant}: ${f.error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`\nCompleted ${tasks.length} generation task(s).`);
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
