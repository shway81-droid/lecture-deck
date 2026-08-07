import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildInstallPlan,
  parseInstallArgs,
  verifyInstall,
} from "../scripts/install.mjs";
import { REQUIRED_ASSETS } from "../scripts/setup.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");

test("installer maps agent and scope choices to pinned skills arguments", () => {
  const globalBoth = buildInstallPlan({
    agent: "both",
    scope: "global",
    cwd: repoRoot,
  });
  assert.deepEqual(globalBoth.agents, ["codex", "claude-code"]);
  assert.deepEqual(globalBoth.args, [
    "--yes",
    "skills@1.5.20",
    "add",
    "NewTurn2017/lecture-deck",
    "--skill",
    "lecture-deck",
    "--global",
    "--agent",
    "codex",
    "--agent",
    "claude-code",
    "--copy",
    "--yes",
  ]);

  const localClaude = buildInstallPlan({
    agent: "claude",
    scope: "local",
    cwd: repoRoot,
  });
  assert.deepEqual(localClaude.agents, ["claude-code"]);
  assert.equal(localClaude.args.includes("--global"), false);
  assert.deepEqual(localClaude.args.slice(-4), [
    "--agent",
    "claude-code",
    "--copy",
    "--yes",
  ]);
});

test("installer accepts concise aliases and rejects unsupported values", () => {
  assert.deepEqual(
    parseInstallArgs([
      "--agent",
      "all",
      "--local",
      "--yes",
      "--no-tui",
    ]),
    {
      agent: "both",
      dryRun: false,
      help: false,
      json: false,
      scope: "local",
      tui: false,
      yes: true,
    },
  );
  assert.equal(
    parseInstallArgs(["--agent", "claude-code", "--global"]).agent,
    "claude",
  );
  assert.throws(
    () => parseInstallArgs(["--agent", "cursor"]),
    /both, codex, claude/,
  );
  assert.throws(
    () => parseInstallArgs(["--scope", "workspace"]),
    /global, local/,
  );
});

test("dry-run JSON exposes the exact plan without installing", () => {
  const result = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, "scripts", "install.mjs"),
      "--agent",
      "codex",
      "--scope",
      "local",
      "--yes",
      "--dry-run",
      "--json",
    ],
    { cwd: repoRoot, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.agent, "codex");
  assert.equal(output.scope, "local");
  assert.equal(output.dryRun, true);
  assert.deepEqual(output.agents, ["codex"]);
  assert.equal(output.args.includes("--global"), false);
});

test("non-interactive execution requires explicit agent and scope", () => {
  const result = spawnSync(
    process.execPath,
    [path.join(repoRoot, "scripts", "install.mjs"), "--no-tui"],
    {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--agent/);
  assert.match(result.stderr, /--scope/);
});

test("verification requires every bundled asset for each selected agent", async () => {
  const projectDir = await mkdtemp(
    path.join(os.tmpdir(), "lecture-deck-install-verify-"),
  );
  const codexSkill = path.join(
    projectDir,
    ".agents",
    "skills",
    "lecture-deck",
  );
  const claudeSkill = path.join(
    projectDir,
    ".claude",
    "skills",
    "lecture-deck",
  );
  for (const skillDir of [codexSkill, claudeSkill]) {
    for (const relativePath of REQUIRED_ASSETS) {
      const target = path.join(skillDir, relativePath);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, "");
    }
  }

  const complete = await verifyInstall({
    agents: ["codex", "claude-code"],
    scope: "local",
    cwd: projectDir,
    env: {},
  });
  assert.equal(complete.ok, true);

  await writeFile(path.join(claudeSkill, "scripts", "install.mjs"), "");
  const incompleteAsset = path.join(claudeSkill, "scripts", "setup.mjs");
  await rm(incompleteAsset);
  const incomplete = await verifyInstall({
    agents: ["codex", "claude-code"],
    scope: "local",
    cwd: projectDir,
    env: {},
  });
  assert.equal(incomplete.ok, false);
  assert.equal(incomplete.checks[1].ok, false);
  assert.ok(incomplete.checks[1].missingAssets.includes("scripts/setup.mjs"));
});
