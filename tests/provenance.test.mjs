import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtemp,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  findOverlaps,
  normalizeText,
  parseArguments,
} from "../scripts/check-provenance.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const checker = path.join(repoRoot, "scripts", "check-provenance.mjs");
const pin = "3efc603ac474f5a4f77001641d0b2736dc121e85";

test("normalization is case and punctuation insensitive but drops reviewed identifiers", () => {
  assert.equal(
    normalizeText("Alpha, CLAIM_ID! Beta — observed_at."),
    "alpha beta",
  );
});

test("checker detects an identical run of eight normalized words", () => {
  const upstream =
    "A patient researcher records each material finding before drawing any final conclusion.";
  const target =
    "Preface. A PATIENT researcher, records each material finding before drawing any final conclusion!";
  const overlaps = findOverlaps(upstream, target);

  assert.ok(overlaps.some(({ kind }) => kind === "word-run"));
});

test("checker detects a long normalized character match with fewer than eight words", () => {
  const phrase =
    "extraordinaryverification extraordinaryprovenance extraordinaryindependence";
  const overlaps = findOverlaps(`start ${phrase} finish`, `other ${phrase} end`);

  assert.ok(overlaps.some(({ kind }) => kind === "normalized-characters"));
  assert.equal(overlaps.some(({ kind }) => kind === "word-run"), false);
});

test("checker accepts independently worded synthetic material", () => {
  assert.deepEqual(
    findOverlaps(
      "First source wording about a fictional orchard investigation.",
      "A made-up astronomy lesson stores evidence in a local record.",
    ),
    [],
  );
});

test("argument parser requires one external upstream and target paths", () => {
  assert.deepEqual(
    parseArguments(["--upstream", "/tmp/upstream.md", "target-a.md", "target-b.md"]),
    {
      help: false,
      upstream: "/tmp/upstream.md",
      targets: ["target-a.md", "target-b.md"],
    },
  );
  assert.throws(() => parseArguments(["target.md"]), /--upstream is required/);
  assert.throws(
    () => parseArguments(["--upstream", "a.md"]),
    /at least one target/,
  );
});

test("CLI fails copied synthetic text and passes independent text", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "lecture-provenance-"));
  const upstream = path.join(fixture, "external-upstream.md");
  const copied = path.join(fixture, "copied.md");
  const independent = path.join(fixture, "independent.md");
  const sentence =
    "Every fictional lantern receives a durable record before the evening parade begins.";

  await writeFile(upstream, sentence);
  await writeFile(copied, `Introduction. ${sentence}`);
  await writeFile(
    independent,
    "An original classroom exercise compares three imaginary weather stations.",
  );

  const failed = spawnSync(
    process.execPath,
    [checker, "--upstream", upstream, copied],
    { encoding: "utf8" },
  );
  assert.equal(failed.status, 1);
  assert.match(failed.stderr, /FAIL/);

  const passed = spawnSync(
    process.execPath,
    [checker, "--upstream", upstream, independent],
    { encoding: "utf8" },
  );
  assert.equal(passed.status, 0, passed.stderr);
  assert.match(passed.stdout, /PASS/);
});

test("provenance manifest pins source facts and records the author declaration", async () => {
  const provenance = await readFile(path.join(repoRoot, "PROVENANCE.md"), "utf8");

  assert.match(provenance, new RegExp(pin));
  assert.match(
    provenance,
    /plugins\/omo\/skills\/ulw-research\/SKILL\.md/,
  );
  assert.match(
    provenance,
    /f2c4a590c161a2dd74a307fd8a626dfe0d4c4b52b4f38afcef37a202ae72a269/,
  );
  assert.match(provenance, /independently written/i);
  assert.match(provenance, /no upstream authored expression/i);
});

test("third-party notice is an idea-only acknowledgment with pinned links", async () => {
  const notice = await readFile(
    path.join(repoRoot, "THIRD_PARTY_NOTICES.md"),
    "utf8",
  );

  assert.match(notice, new RegExp(pin));
  assert.match(notice, /independently implemented/i);
  assert.match(notice, /fivetaku\/insane-research/);
  assert.match(
    notice,
    /No LazyCodex or insane-research source code, prompt\s+prose, templates, schemas, or other authored expression is included\./i,
  );
  assert.match(notice, /does not imply affiliation or endorsement/i);
  assert.match(notice, /ulw-research\/SKILL\.md/);
  assert.match(notice, /ulw-research\/ATTRIBUTION\.md/);
});

test("owned and present implementation files exclude distinctive upstream expression", async () => {
  const forbidden = [
    "ULW-RESEARCH MODE ENABLED!",
    "Maximum-Saturation Research",
    "The raise law",
    "data-flow-lock",
    "## CLAIMS",
    "call_omo_agent",
    "background_output",
  ];
  const candidates = [
    "PROVENANCE.md",
    "THIRD_PARTY_NOTICES.md",
    "scripts/check-provenance.mjs",
    "references/ultra-research-protocol.md",
    "scripts/research-session.mjs",
    "tests/research-session.test.mjs",
  ];
  const existing = new Set([
    ...(await readdir(repoRoot)),
    ...(await readdir(path.join(repoRoot, "scripts"))).map(
      (entry) => `scripts/${entry}`,
    ),
    ...(await readdir(path.join(repoRoot, "tests"))).map(
      (entry) => `tests/${entry}`,
    ),
    ...(await readdir(path.join(repoRoot, "references"))).map(
      (entry) => `references/${entry}`,
    ),
  ]);

  for (const relativePath of candidates.filter((candidate) =>
    existing.has(candidate),
  )) {
    const source = await readFile(path.join(repoRoot, relativePath), "utf8");
    for (const phrase of forbidden) {
      assert.equal(
        source.includes(phrase),
        false,
        `${relativePath} contains forbidden upstream expression: ${phrase}`,
      );
    }
  }
});
