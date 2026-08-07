import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFile,
  mkdtemp,
  mkdir,
  readFile,
  rename,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  agentSkillRoots,
  buildGptImageInstallCommand,
  buildInstallerEnv,
  digestDirectory,
  inspectSkill,
  isNodeVersionSupported,
  parseNodeVersion,
  REQUIRED_ASSETS,
  verifyGptImageInstall,
} from "../scripts/setup.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");

async function copyRequiredAssets(destination) {
  for (const relativePath of REQUIRED_ASSETS) {
    const source = path.join(repoRoot, relativePath);
    const target = path.join(destination, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(source, target);
  }
}

async function makeCompanion(root) {
  const skillDir = path.join(root, "gpt-image");
  await mkdir(path.join(skillDir, "scripts"), { recursive: true });
  await writeFile(path.join(skillDir, "SKILL.md"), "# gpt-image\n");
  await writeFile(path.join(skillDir, "scripts", "generate.py"), "print('ok')\n");
  return skillDir;
}

test("setup enforces the Node version required by the pinned installer", async () => {
  assert.deepEqual(parseNodeVersion("v22.20.0"), {
    major: 22,
    minor: 20,
    patch: 0,
  });
  assert.equal(isNodeVersionSupported("22.19.9"), false);
  assert.equal(isNodeVersionSupported("22.20.0"), true);
  assert.equal(isNodeVersionSupported("23.0.0"), true);

  const report = await inspectSkill({
    skillDir: repoRoot,
    nodeVersion: "22.19.9",
  });
  assert.equal(report.ok, false);
  assert.deepEqual(report.required.node, {
    version: "22.19.9",
    minimum: "22.20.0",
    supported: false,
  });
});

test("doctor reports the complete bundled skill without exposing the API key", async () => {
  const report = await inspectSkill({
    skillDir: repoRoot,
    env: { ...process.env, OPENAI_API_KEY: "sentinel-api-key-must-not-leak" },
  });

  assert.equal(report.ok, true);
  assert.deepEqual(report.required.missingAssets, []);
  assert.equal(report.optional.openaiApiKey, true);
  assert.doesNotMatch(JSON.stringify(report), /sentinel-api-key-must-not-leak/);
});

test("doctor manifest covers every direct skill reference and new release artifact", async () => {
  const skill = await readFile(path.join(repoRoot, "SKILL.md"), "utf8");
  const directReferences = [
    ...skill.matchAll(/`((?:assets|references|scripts)\/[^` ]+)`/g),
  ]
    .map((match) => match[1])
    .filter((relativePath) => !relativePath.endsWith("/"));

  for (const relativePath of directReferences) {
    assert.ok(
      REQUIRED_ASSETS.includes(relativePath),
      `${relativePath} must be checked by setup doctor`,
    );
  }

  const newlyRequired = [
    "PROVENANCE.md",
    "THIRD_PARTY_NOTICES.md",
    "references/ultra-research-protocol.md",
    "references/research-state-schema.md",
    "scripts/research-session.mjs",
    "scripts/check-provenance.mjs",
    "scripts/install.mjs",
  ];
  for (const relativePath of newlyRequired) {
    assert.ok(REQUIRED_ASSETS.includes(relativePath), relativePath);
  }

  const fixture = await mkdtemp(
    path.join(os.tmpdir(), "lecture-deck-manifest-"),
  );
  await copyRequiredAssets(fixture);
  for (const relativePath of newlyRequired) {
    const source = path.join(fixture, relativePath);
    const removed = `${source}.removed`;
    await rename(source, removed);
    const report = await inspectSkill({ skillDir: fixture });
    assert.equal(report.ok, false, `${relativePath} deletion must fail`);
    assert.ok(report.required.missingAssets.includes(relativePath));
    await rename(removed, source);
  }
});

test("npm pack is allowlisted and contains the complete public skill", async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(repoRoot, "package.json"), "utf8"),
  );
  assert.equal(packageJson.engines.node, ">=22.20.0");
  assert.deepEqual(packageJson.bin, {
    "lecture-deck-install": "scripts/install.mjs",
  });
  assert.equal(packageJson.scripts.test, "node --test tests/*.test.mjs");
  assert.deepEqual(packageJson.files, [
    "SKILL.md",
    "README.md",
    "README.ko.md",
    "LICENSE",
    "PROVENANCE.md",
    "THIRD_PARTY_NOTICES.md",
    "agents",
    "assets",
    "references",
    "scripts",
    "tests",
  ]);

  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const packed = spawnSync(
    npmCommand,
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    { cwd: repoRoot, encoding: "utf8" },
  );
  assert.equal(packed.status, 0, packed.stderr);
  const [{ files }] = JSON.parse(packed.stdout);
  const paths = new Set(files.map((file) => file.path));
  for (const relativePath of REQUIRED_ASSETS) {
    assert.ok(paths.has(relativePath), `pack is missing ${relativePath}`);
  }
  for (const forbidden of [
    /^\.omo(?:\/|$)/,
    /^\.ulw-evidence(?:\/|$)/,
    /^skills-lock\.json$/,
  ]) {
    assert.equal(
      [...paths].some((relativePath) => forbidden.test(relativePath)),
      false,
      `pack contains forbidden path matching ${forbidden}`,
    );
  }
});

test("doctor fails when a required offline asset is missing", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "lecture-deck-doctor-"));
  await mkdir(path.join(fixture, "assets", "template"), { recursive: true });
  await mkdir(path.join(fixture, "references"), { recursive: true });
  await writeFile(path.join(fixture, "SKILL.md"), "---\nname: lecture-deck\n---\n");
  await writeFile(path.join(fixture, "assets", "package-deck.sh"), "#!/bin/sh\n");
  await writeFile(path.join(fixture, "assets", "template", "index.html"), "<html></html>\n");
  await writeFile(path.join(fixture, "references", "research-dispatch.md"), "# Research\n");

  const result = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, "scripts", "setup.mjs"),
      "check",
      "--skill-dir",
      fixture,
      "--json",
    ],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.ok, false);
  assert.ok(
    report.required.missingAssets.includes("assets/vendor/reveal/reveal.js"),
  );
});

test("gpt-image remains opt-in and targets both supported agents", () => {
  const command = buildGptImageInstallCommand({
    target: "all",
    yes: true,
  });

  assert.equal(command.command, "npx");
  assert.deepEqual(command.args, [
    "--yes",
    "skills@1.5.20",
    "add",
    "https://github.com/wuyoscar/GPT-Image2-Skill/tree/v0.2.0/skills/gpt-image",
    "--skill",
    "gpt-image",
    "--global",
    "--agent",
    "codex",
    "--agent",
    "claude-code",
    "--copy",
    "--yes",
  ]);
});

test("agent roots cover canonical, legacy, custom, and project installs", () => {
  const homeDir = path.join(path.sep, "tmp", "lecture-home");
  const customCodex = path.join(homeDir, "custom-codex");
  const customClaude = path.join(homeDir, "custom-claude");
  const globalRoots = agentSkillRoots({
    env: {
      CODEX_HOME: customCodex,
      CLAUDE_CONFIG_DIR: customClaude,
    },
    homeDir,
  });
  assert.deepEqual(globalRoots.codexCandidates, [
    path.join(homeDir, ".agents", "skills"),
    path.join(customCodex, "skills"),
    path.join(homeDir, ".codex", "skills"),
  ]);
  assert.deepEqual(globalRoots.claudeCandidates, [
    path.join(customClaude, "skills"),
  ]);

  const defaultRoots = agentSkillRoots({ env: {}, homeDir });
  assert.deepEqual(defaultRoots.codexCandidates, [
    path.join(homeDir, ".agents", "skills"),
    path.join(homeDir, ".codex", "skills"),
  ]);
  assert.deepEqual(defaultRoots.claudeCandidates, [
    path.join(homeDir, ".claude", "skills"),
  ]);

  const projectDir = path.join(homeDir, "project");
  const projectRoots = agentSkillRoots({
    scope: "project",
    projectDir,
  });
  assert.deepEqual(projectRoots.codexCandidates, [
    path.join(projectDir, ".agents", "skills"),
  ]);
  assert.deepEqual(projectRoots.claudeCandidates, [
    path.join(projectDir, ".claude", "skills"),
  ]);
});

test("doctor detects the loaded project copy and its sibling agent copy", async () => {
  const projectDir = await mkdtemp(
    path.join(os.tmpdir(), "lecture-deck-loaded-copy-"),
  );
  const loadedCopy = path.join(
    projectDir,
    ".agents",
    "skills",
    "lecture-deck",
  );
  await mkdir(path.dirname(loadedCopy), { recursive: true });
  await symlink(repoRoot, loadedCopy, "dir");
  const claudeCopy = path.join(
    projectDir,
    ".claude",
    "skills",
    "lecture-deck",
  );
  await mkdir(claudeCopy, { recursive: true });
  await writeFile(path.join(claudeCopy, "SKILL.md"), "# lecture-deck\n");

  const report = await inspectSkill({
    skillDir: loadedCopy,
    env: {},
    homeDir: path.join(projectDir, "isolated-home"),
  });
  assert.equal(report.optional.installed.codex, true);
  assert.equal(report.optional.installed.claude, true);
  assert.equal(report.agentRoots.loadedProjectDir, projectDir);
});

test("companion verification accepts all supported agent root layouts", async () => {
  const fixture = await mkdtemp(
    path.join(os.tmpdir(), "lecture-deck-companion-"),
  );
  const homeDir = path.join(fixture, "home");
  const customCodex = path.join(homeDir, "custom-codex");
  const customClaude = path.join(homeDir, "custom-claude");
  const canonicalCodex = path.join(homeDir, ".agents", "skills");
  const claudeRoot = path.join(customClaude, "skills");
  const canonicalSkill = await makeCompanion(canonicalCodex);
  await makeCompanion(claudeRoot);
  const expectedDigest = await digestDirectory(canonicalSkill);

  const globalResult = await verifyGptImageInstall(
    "all",
    {
      CODEX_HOME: customCodex,
      CLAUDE_CONFIG_DIR: customClaude,
    },
    { homeDir, expectedDigest },
  );
  assert.deepEqual(globalResult.missing, []);
  assert.deepEqual(globalResult.mismatched, []);

  const codexResult = await verifyGptImageInstall(
    "codex",
    {
      CODEX_HOME: customCodex,
      CLAUDE_CONFIG_DIR: customClaude,
    },
    { homeDir, expectedDigest },
  );
  assert.deepEqual(codexResult.missing, []);
  assert.deepEqual(codexResult.mismatched, []);

  const claudeResult = await verifyGptImageInstall(
    "claude",
    {
      CODEX_HOME: customCodex,
      CLAUDE_CONFIG_DIR: customClaude,
    },
    { homeDir, expectedDigest },
  );
  assert.deepEqual(claudeResult.missing, []);
  assert.deepEqual(claudeResult.mismatched, []);

  const customOnlyHome = path.join(fixture, "custom-only-home");
  const customOnlyCodex = path.join(fixture, "codex-config");
  const customOnlySkill = await makeCompanion(
    path.join(customOnlyCodex, "skills"),
  );
  const customOnlyResult = await verifyGptImageInstall(
    "codex",
    { CODEX_HOME: customOnlyCodex },
    {
      homeDir: customOnlyHome,
      expectedDigest: await digestDirectory(customOnlySkill),
    },
  );
  assert.deepEqual(customOnlyResult.missing, []);
  assert.deepEqual(customOnlyResult.mismatched, []);

  const legacyHome = path.join(fixture, "legacy-home");
  const legacySkill = await makeCompanion(
    path.join(legacyHome, ".codex", "skills"),
  );
  const legacyResult = await verifyGptImageInstall(
    "codex",
    {},
    {
      homeDir: legacyHome,
      expectedDigest: await digestDirectory(legacySkill),
    },
  );
  assert.deepEqual(legacyResult.missing, []);
  assert.deepEqual(legacyResult.mismatched, []);

  const projectDir = path.join(fixture, "project");
  const projectCodexSkill = await makeCompanion(
    path.join(projectDir, ".agents", "skills"),
  );
  await makeCompanion(path.join(projectDir, ".claude", "skills"));
  const projectResult = await verifyGptImageInstall(
    "all",
    {},
    {
      scope: "project",
      projectDir,
      expectedDigest: await digestDirectory(projectCodexSkill),
    },
  );
  assert.deepEqual(projectResult.missing, []);
  assert.deepEqual(projectResult.mismatched, []);
});

test("gpt-image can install into an isolated project without global writes", () => {
  const command = buildGptImageInstallCommand({
    scope: "project",
    target: "all",
    yes: true,
  });

  assert.equal(command.scope, "project");
  assert.equal(command.args.includes("--global"), false);
});

test("gpt-image target rejects unsupported agent names", () => {
  assert.throws(
    () => buildGptImageInstallCommand({ target: "cursor", yes: false }),
    /target must be one of/,
  );
});

test("gpt-image scope rejects unsupported values", () => {
  assert.throws(
    () =>
      buildGptImageInstallCommand({
        scope: "workspace",
        target: "all",
        yes: false,
      }),
    /scope must be one of/,
  );
});

test("companion installer child environment excludes credentials", () => {
  const childEnv = buildInstallerEnv({
    CLAUDE_CONFIG_DIR: "/tmp/example-claude",
    CODEX_HOME: "/tmp/example-codex",
    HOME: "/tmp/example-home",
    OPENAI_API_KEY: "must-not-pass",
    PATH: "/usr/bin:/bin",
    TMPDIR: "/tmp/example",
    GH_TOKEN: "must-not-pass",
  });

  assert.deepEqual(childEnv, {
    CLAUDE_CONFIG_DIR: "/tmp/example-claude",
    CODEX_HOME: "/tmp/example-codex",
    HOME: "/tmp/example-home",
    PATH: "/usr/bin:/bin",
    TMPDIR: "/tmp/example",
  });
  assert.equal("OPENAI_API_KEY" in childEnv, false);
  assert.equal("GH_TOKEN" in childEnv, false);
});

test("companion provenance digest is deterministic across nested files", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "lecture-deck-digest-"));
  await mkdir(path.join(fixture, "nested"));
  await writeFile(path.join(fixture, "nested", "b.txt"), "y");
  await writeFile(path.join(fixture, "a.txt"), "x");

  assert.equal(
    await digestDirectory(fixture),
    "16fc4eeb951c31cb87bf1ce981cde67e90fbb03ade758279430640b0b8b14f0e",
  );
});

test("copied setup CLI runs when argv and import paths use different symlink forms", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "lecture-deck-cli-"));
  const copiedScript = path.join(fixture, "setup.mjs");
  await copyFile(path.join(repoRoot, "scripts", "setup.mjs"), copiedScript);

  const result = spawnSync(
    process.execPath,
    [copiedScript, "check", "--skill-dir", repoRoot, "--json"],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).ok, true);
});
