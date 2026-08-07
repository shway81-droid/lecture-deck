#!/usr/bin/env node

import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const MIN_MATCH_WORDS = 8;
export const MIN_MATCH_CHARS = 60;

export const GENERIC_IDENTIFIER_ALLOWLIST = new Set([
  "intent_id",
  "claim_id",
  "observation_id",
  "observed_at",
  "valid_at",
  "claim_valid_at",
  "last_seen",
  "true",
  "violated",
  "unknown",
  "supported",
  "partial",
  "refuted",
  "unresolved",
]);

const WORD_PATTERN = /[\p{L}\p{N}_-]+/gu;

export function normalizeTokens(text, allowlist = GENERIC_IDENTIFIER_ALLOWLIST) {
  const normalized = text.normalize("NFKC").toLowerCase();
  return [...normalized.matchAll(WORD_PATTERN)]
    .map(([token]) => token)
    .filter((token) => !allowlist.has(token));
}

export function normalizeText(text, allowlist = GENERIC_IDENTIFIER_ALLOWLIST) {
  return normalizeTokens(text, allowlist).join(" ");
}

function firstMatchingWindow(source, target, size) {
  if (source.length < size || target.length < size) {
    return null;
  }

  const sourceWindows = new Set();
  for (let index = 0; index <= source.length - size; index += 1) {
    sourceWindows.add(source.slice(index, index + size).join("\u0000"));
  }

  for (let index = 0; index <= target.length - size; index += 1) {
    const candidate = target.slice(index, index + size);
    if (sourceWindows.has(candidate.join("\u0000"))) {
      return candidate.join(" ");
    }
  }
  return null;
}

function firstMatchingCharacters(source, target, size) {
  if (source.length < size || target.length < size) {
    return null;
  }

  const sourceWindows = new Set();
  for (let index = 0; index <= source.length - size; index += 1) {
    sourceWindows.add(source.slice(index, index + size));
  }

  for (let index = 0; index <= target.length - size; index += 1) {
    const candidate = target.slice(index, index + size);
    if (sourceWindows.has(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function findOverlaps(upstreamText, targetText) {
  const upstreamTokens = normalizeTokens(upstreamText);
  const targetTokens = normalizeTokens(targetText);
  const upstreamNormalized = upstreamTokens.join(" ");
  const targetNormalized = targetTokens.join(" ");
  const overlaps = [];

  const wordRun = firstMatchingWindow(
    upstreamTokens,
    targetTokens,
    MIN_MATCH_WORDS,
  );
  if (wordRun) {
    overlaps.push({
      kind: "word-run",
      threshold: MIN_MATCH_WORDS,
      excerpt: wordRun,
    });
  }

  const characterRun = firstMatchingCharacters(
    upstreamNormalized,
    targetNormalized,
    MIN_MATCH_CHARS,
  );
  if (characterRun) {
    overlaps.push({
      kind: "normalized-characters",
      threshold: MIN_MATCH_CHARS,
      excerpt: characterRun,
    });
  }

  return overlaps;
}

export function parseArguments(argv) {
  let upstream;
  const targets = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      return { help: true, upstream, targets };
    }
    if (argument === "--upstream") {
      if (upstream !== undefined) {
        throw new Error("--upstream may be provided only once");
      }
      upstream = argv[index + 1];
      if (!upstream || upstream.startsWith("--")) {
        throw new Error("--upstream requires a file path");
      }
      index += 1;
      continue;
    }
    if (argument.startsWith("--")) {
      throw new Error(`unknown option: ${argument}`);
    }
    targets.push(argument);
  }

  if (!upstream) {
    throw new Error("--upstream is required");
  }
  if (targets.length === 0) {
    throw new Error("at least one target path is required");
  }
  return { help: false, upstream, targets };
}

async function readRegularFile(filePath, label) {
  const details = await stat(filePath);
  if (!details.isFile()) {
    throw new Error(`${label} is not a regular file: ${filePath}`);
  }
  return readFile(filePath, "utf8");
}

export async function checkFiles({ upstream, targets }) {
  const upstreamPath = await realpath(upstream);
  const targetPaths = await Promise.all(targets.map((target) => realpath(target)));
  const upstreamText = await readRegularFile(upstreamPath, "upstream");
  const results = [];

  for (const targetPath of targetPaths) {
    if (targetPath === upstreamPath) {
      throw new Error(`target must not be the upstream file: ${targetPath}`);
    }
    const targetText = await readRegularFile(targetPath, "target");
    results.push({
      target: targetPath,
      overlaps: findOverlaps(upstreamText, targetText),
    });
  }
  return { upstream: upstreamPath, results };
}

function printHelp() {
  console.log(`Usage:
  node scripts/check-provenance.mjs --upstream PATH TARGET [TARGET...]

The upstream file must be supplied externally. It is never downloaded,
generated, or stored by this command. The check fails on an identical run of
${MIN_MATCH_WORDS} normalized words or ${MIN_MATCH_CHARS} normalized characters.`);
}

async function main(argv) {
  let options;
  try {
    options = parseArguments(argv);
    if (options.help) {
      printHelp();
      return 0;
    }

    const report = await checkFiles(options);
    let failed = false;
    for (const result of report.results) {
      if (result.overlaps.length === 0) {
        console.log(`PASS ${result.target}`);
        continue;
      }
      failed = true;
      for (const overlap of result.overlaps) {
        console.error(
          `FAIL ${result.target}: ${overlap.kind} >= ${overlap.threshold}: ${JSON.stringify(overlap.excerpt)}`,
        );
      }
    }
    return failed ? 1 : 0;
  } catch (error) {
    console.error(`provenance check error: ${error.message}`);
    return 2;
  }
}

const invokedPath = process.argv[1]
  ? path.resolve(process.argv[1])
  : undefined;
const modulePath = path.resolve(fileURLToPath(import.meta.url));
if (invokedPath === modulePath) {
  process.exitCode = await main(process.argv.slice(2));
}
