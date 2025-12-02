```ts
import fs from "node:fs";
import path from "node:path";

async function loadKeys(filePath: string): Promise<Set<string>> {
  const raw = await fs.promises.readFile(filePath, "utf8");
  const keys = new Set<string>();

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    if (key.length > 0) {
      keys.add(key);
    }
  }

  return keys;
}

async function main() {
  const projectRoot = process.cwd();
  const examplePath = path.join(projectRoot, ".env.example");
  const envPath = path.join(projectRoot, ".env");

  if (!fs.existsSync(examplePath)) {
    console.error("Could not find .env.example at the project root.");
    console.error("Make sure you are running this script from the repository root.");
    process.exit(1);
  }

  const expectedKeys = await loadKeys(examplePath);

  if (expectedKeys.size === 0) {
    console.log("No keys found in .env.example (nothing to check).");
    return;
  }

  if (!fs.existsSync(envPath)) {
    console.log("No .env file found at the project root.");
    console.log("Create one by copying .env.example and filling in the values.");
    console.log("");
    console.log("Example:");
    console.log("  cp .env.example .env");
    return;
  }

  const actualKeys = await loadKeys(envPath);

  const missing: string[] = [];
  const extra: string[] = [];

  for (const key of expectedKeys) {
    if (!actualKeys.has(key)) {
      missing.push(key);
    }
  }

  for (const key of actualKeys) {
    if (!expectedKeys.has(key)) {
      extra.push(key);
    }
  }

  console.log("=== .env consistency check ===");
  console.log(`Expected keys (from .env.example): ${expectedKeys.size}`);
  console.log(`Actual keys   (from .env)       : ${actualKeys.size}`);
  console.log("");

  if (missing.length === 0 && extra.length === 0) {
    console.log("✅ All keys from .env.example are present in .env, and there are no extra keys.");
    return;
  }

  if (missing.length > 0) {
    console.log("⚠ Missing keys in .env (present in .env.example but not in .env):");
    for (const key of missing) {
      console.log(`  - ${key}`);
    }
    console.log("");
  }

  if (extra.length > 0) {
    console.log("ℹ Extra keys in .env (not listed in .env.example):");
    for (const key of extra) {
      console.log(`  - ${key}`);
    }
    console.log("");
  }

  console.log("If you just created your .env from .env.example,");
  console.log("check that all required keys are present and spelled correctly.");
}

main().catch((error) => {
  console.error("Unexpected error while checking .env:", error);
  process.exit(1);
});
