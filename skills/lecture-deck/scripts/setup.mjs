#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { access, readFile, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKILLS_CLI_SPEC = "skills@1.5.20";
const MINIMUM_NODE_VERSION = "22.20.0";
const GPT_IMAGE_SOURCE =
  "https://github.com/wuyoscar/GPT-Image2-Skill/tree/v0.2.0/skills/gpt-image";
const GPT_IMAGE_SKILL_SHA256 =
  "d145ce52c6eed794f034c093dcb593e2f7f49cc81c1d0cd5b076d130cf80bd72";

const INSTALLER_ENV_KEYS = [
  "PATH",
  "HOME",
  "USER",
  "LOGNAME",
  "SHELL",
  "TMPDIR",
  "TMP",
  "TEMP",
  "XDG_CACHE_HOME",
  "XDG_CONFIG_HOME",
  "APPDATA",
  "LOCALAPPDATA",
  "SystemRoot",
  "ComSpec",
  "PATHEXT",
  "CODEX_HOME",
  "CLAUDE_CONFIG_DIR",
];

const JETBRAINS_FONT_ASSETS = Array.from(
  { length: 18 },
  (_, index) => `assets/vendor/fonts/jetbrains-${index}.woff2`,
);

export const REQUIRED_ASSETS = Object.freeze([
  "SKILL.md",
  "README.md",
  "README.ko.md",
  "LICENSE",
  "PROVENANCE.md",
  "THIRD_PARTY_NOTICES.md",
  "package.json",
  "agents/openai.yaml",
  "assets/package-deck.sh",
  "assets/layouts.md",
  // 선택 단계(8·9)의 진입점. 단계를 건너뛸 수는 있어도 파일이 없으면 설치가 깨진 것이다.
  "assets/html2pptx/build.py",
  "assets/nlm2deck/run.sh",
  "assets/template/index.html",
  "assets/template/serve.sh",
  "assets/template/theme.css",
  "assets/vendor/fonts/PretendardVariable.woff2",
  "assets/vendor/fonts/instrument-0.woff2",
  "assets/vendor/fonts/instrument-1.woff2",
  "assets/vendor/fonts/instrument-2.woff2",
  "assets/vendor/fonts/instrument-3.woff2",
  "assets/vendor/fonts/instrument-serif.css",
  ...JETBRAINS_FONT_ASSETS,
  "assets/vendor/fonts/jetbrains-mono.css",
  "assets/vendor/fonts/pretendard.css",
  "assets/vendor/lucide.min.js",
  "assets/vendor/reveal/reset.css",
  "assets/vendor/reveal/reveal.css",
  "assets/vendor/reveal/reveal.js",
  "assets/vendor/reveal/highlight/highlight.js",
  "assets/vendor/reveal/highlight/monokai.css",
  "assets/vendor/reveal/notes/notes.js",
  "assets/vendor/reveal/notes/speaker-view.html",
  "references/anti-slop.md",
  "references/brief-format.md",
  "references/interview.md",
  "references/notebooklm.md",
  "references/packaging.md",
  "references/pptx.md",
  "references/research-dispatch.md",
  "references/research-state-schema.md",
  "references/script-format.md",
  "references/ultra-research-protocol.md",
  "references/visuals-and-parallel.md",
  "scripts/check-provenance.mjs",
  "scripts/install.mjs",
  "scripts/research-session.mjs",
  "scripts/setup.mjs",
]);

const REQUIRED_COMMANDS = [
  { name: "bash", args: ["--version"] },
  { name: "perl", args: ["--version"] },
  { name: "python3", args: ["--version"] },
];

const OPTIONAL_COMMANDS = [
  { name: "codex", args: ["--version"] },
  { name: "claude", args: ["--version"] },
  { name: "gpt-image", args: ["--help"] },
  // 9단계(NotebookLM 슬라이드)에만 필요하다. 없어도 덱·패키지·PPTX 는 다 만든다.
  { name: "notebooklm", args: ["--version"] },
];

async function exists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function commandAvailable(name, args) {
  const result = spawnSync(name, args, {
    encoding: "utf8",
    stdio: "ignore",
  });
  return result.status === 0;
}

export function parseNodeVersion(version) {
  const match = String(version).match(/^v?(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    throw new Error(`invalid Node version: ${version}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function isNodeVersionSupported(version) {
  const actual = parseNodeVersion(version);
  const minimum = parseNodeVersion(MINIMUM_NODE_VERSION);
  for (const key of ["major", "minor", "patch"]) {
    if (actual[key] > minimum[key]) return true;
    if (actual[key] < minimum[key]) return false;
  }
  return true;
}

function uniquePaths(paths) {
  return [...new Set(paths.map((candidate) => path.resolve(candidate)))];
}

export function agentSkillRoots({
  env = process.env,
  homeDir = os.homedir(),
  scope = "global",
  projectDir = process.cwd(),
} = {}) {
  if (scope === "project") {
    const codexCandidates = [path.join(projectDir, ".agents", "skills")];
    const claudeCandidates = [path.join(projectDir, ".claude", "skills")];
    return {
      codex: codexCandidates[0],
      claude: claudeCandidates[0],
      codexCandidates,
      claudeCandidates,
    };
  }
  if (scope !== "global") {
    throw new Error("scope must be one of: global, project");
  }

  const codexCandidates = uniquePaths([
    path.join(homeDir, ".agents", "skills"),
    ...(env.CODEX_HOME ? [path.join(env.CODEX_HOME, "skills")] : []),
    path.join(homeDir, ".codex", "skills"),
  ]);
  const claudeCandidates = uniquePaths([
    path.join(env.CLAUDE_CONFIG_DIR || path.join(homeDir, ".claude"), "skills"),
  ]);
  return {
    codex: codexCandidates[0],
    claude: claudeCandidates[0],
    codexCandidates,
    claudeCandidates,
  };
}

function projectDirForLoadedCopy(skillDir) {
  const resolved = path.resolve(skillDir);
  const skillsDir = path.dirname(resolved);
  const agentDir = path.dirname(skillsDir);
  if (
    path.basename(skillsDir) === "skills" &&
    [".agents", ".claude"].includes(path.basename(agentDir))
  ) {
    return path.dirname(agentDir);
  }
  return null;
}

async function installedAtAnyRoot(roots, skillName) {
  for (const root of roots) {
    if (await exists(path.join(root, skillName, "SKILL.md"))) {
      return true;
    }
  }
  return false;
}

export async function inspectSkill({
  skillDir,
  env = process.env,
  homeDir = os.homedir(),
  nodeVersion = process.versions.node,
  projectDir,
} = {}) {
  if (!skillDir) {
    throw new Error("skillDir is required");
  }

  const missingAssets = [];
  for (const relativePath of REQUIRED_ASSETS) {
    if (!(await exists(path.join(skillDir, relativePath)))) {
      missingAssets.push(relativePath);
    }
  }

  const commands = Object.fromEntries(
    REQUIRED_COMMANDS.map(({ name, args }) => [
      name,
      commandAvailable(name, args),
    ]),
  );
  const missingCommands = Object.entries(commands)
    .filter(([, available]) => !available)
    .map(([name]) => name);

  const optionalCommands = Object.fromEntries(
    OPTIONAL_COMMANDS.map(({ name, args }) => [
      name,
      commandAvailable(name, args),
    ]),
  );
  const roots = agentSkillRoots({ env, homeDir });
  const loadedProjectDir = projectDir || projectDirForLoadedCopy(skillDir);
  const projectRoots = loadedProjectDir
    ? agentSkillRoots({
        env,
        homeDir,
        scope: "project",
        projectDir: loadedProjectDir,
      })
    : null;
  const codexDetectionRoots = uniquePaths([
    ...roots.codexCandidates,
    ...(projectRoots?.codexCandidates || []),
  ]);
  const claudeDetectionRoots = uniquePaths([
    ...roots.claudeCandidates,
    ...(projectRoots?.claudeCandidates || []),
  ]);
  const nodeSupported = isNodeVersionSupported(nodeVersion);
  const installed = {
    codex: await installedAtAnyRoot(codexDetectionRoots, "lecture-deck"),
    claude: await installedAtAnyRoot(claudeDetectionRoots, "lecture-deck"),
    gptImageCodex: await installedAtAnyRoot(
      codexDetectionRoots,
      "gpt-image",
    ),
    gptImageClaude: await installedAtAnyRoot(
      claudeDetectionRoots,
      "gpt-image",
    ),
  };

  return {
    ok:
      nodeSupported &&
      missingAssets.length === 0 &&
      missingCommands.length === 0,
    skillDir: path.resolve(skillDir),
    required: {
      assets: REQUIRED_ASSETS,
      commands,
      missingAssets,
      missingCommands,
      node: {
        version: String(nodeVersion).replace(/^v/, ""),
        minimum: MINIMUM_NODE_VERSION,
        supported: nodeSupported,
      },
    },
    optional: {
      commands: optionalCommands,
      openaiApiKey: Boolean(env.OPENAI_API_KEY),
      installed,
    },
    agentRoots: {
      ...roots,
      loadedProjectDir,
    },
  };
}

export function buildInstallerEnv(env = process.env) {
  const childEnv = {};
  for (const key of INSTALLER_ENV_KEYS) {
    if (env[key] !== undefined) {
      childEnv[key] = env[key];
    }
  }
  return childEnv;
}

export async function digestDirectory(rootDir) {
  const files = [];

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    entries.sort((left, right) =>
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    );
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      } else {
        throw new Error(`unsupported companion file type: ${fullPath}`);
      }
    }
  }

  await walk(rootDir);
  const hash = createHash("sha256");
  for (const filePath of files) {
    const relativePath = path
      .relative(rootDir, filePath)
      .split(path.sep)
      .join("/");
    hash.update(relativePath);
    hash.update("\0");
    hash.update(await readFile(filePath));
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function buildGptImageInstallCommand({
  scope = "global",
  target = "all",
  yes = false,
} = {}) {
  const agentsByTarget = {
    all: ["codex", "claude-code"],
    codex: ["codex"],
    claude: ["claude-code"],
  };
  const agents = agentsByTarget[target];
  if (!agents) {
    throw new Error("target must be one of: all, codex, claude");
  }
  if (!["global", "project"].includes(scope)) {
    throw new Error("scope must be one of: global, project");
  }

  const args = [
    "--yes",
    SKILLS_CLI_SPEC,
    "add",
    GPT_IMAGE_SOURCE,
    "--skill",
    "gpt-image",
  ];
  if (scope === "global") {
    args.push("--global");
  }
  for (const agent of agents) {
    args.push("--agent", agent);
  }
  args.push("--copy");
  if (yes) {
    args.push("--yes");
  }

  return { command: "npx", args, agents, scope };
}

function parseCli(argv) {
  const options = {
    command: "check",
    dryRun: false,
    json: false,
    projectDir: process.cwd(),
    scope: "global",
    skillDir: path.resolve(fileURLToPath(new URL("..", import.meta.url))),
    target: "all",
    yes: false,
  };

  const args = [...argv];
  if (args[0] && !args[0].startsWith("-")) {
    options.command = args.shift();
  }

  while (args.length > 0) {
    const flag = args.shift();
    switch (flag) {
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--json":
        options.json = true;
        break;
      case "--yes":
      case "-y":
        options.yes = true;
        break;
      case "--skill-dir":
        options.skillDir = path.resolve(requireValue(flag, args));
        break;
      case "--project-dir":
        options.projectDir = path.resolve(requireValue(flag, args));
        break;
      case "--scope":
        options.scope = requireValue(flag, args);
        break;
      case "--target":
        options.target = requireValue(flag, args);
        break;
      case "--help":
      case "-h":
        options.command = "help";
        break;
      default:
        throw new Error(`unknown option: ${flag}`);
    }
  }
  return options;
}

function requireValue(flag, args) {
  const value = args.shift();
  if (!value) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function printHumanReport(report) {
  console.log(`lecture-deck setup: ${report.ok ? "PASS" : "FAIL"}`);
  console.log(`skill: ${report.skillDir}`);
  console.log(
    `required node: ${report.required.node.version} ` +
      `(minimum ${report.required.node.minimum}) ` +
      `${report.required.node.supported ? "OK" : "UNSUPPORTED"}`,
  );
  for (const [name, available] of Object.entries(report.required.commands)) {
    console.log(`required ${name}: ${available ? "OK" : "MISSING"}`);
  }
  for (const asset of report.required.missingAssets) {
    console.log(`required asset: MISSING ${asset}`);
  }
  for (const [name, available] of Object.entries(report.optional.commands)) {
    console.log(`optional ${name}: ${available ? "OK" : "not installed"}`);
  }
  console.log(
    `optional OPENAI_API_KEY: ${report.optional.openaiApiKey ? "SET" : "not set"}`,
  );
  console.log(
    `installed lecture-deck: codex=${report.optional.installed.codex} claude=${report.optional.installed.claude}`,
  );
  console.log(
    `installed gpt-image: codex=${report.optional.installed.gptImageCodex} claude=${report.optional.installed.gptImageClaude}`,
  );
}

function printHelp() {
  console.log(`lecture-deck setup

사용법:
  node scripts/setup.mjs check [--json] [--skill-dir PATH]
  node scripts/setup.mjs install-gpt-image [--target all|codex|claude] [--scope global|project] [--project-dir PATH] [--yes] [--dry-run] [--json]

설명:
  check               Node ${MINIMUM_NODE_VERSION} 이상, 필수 자산과 bash/perl/python3, 선택 도구를 점검합니다.
  install-gpt-image   공개 gpt-image 스킬을 선택한 에이전트에 설치합니다.

이 스크립트는 API 키 값을 출력하지 않습니다.`);
}

export async function verifyGptImageInstall(
  target,
  env,
  {
    scope = "global",
    projectDir = process.cwd(),
    homeDir = os.homedir(),
    expectedDigest = GPT_IMAGE_SKILL_SHA256,
  } = {},
) {
  const roots = agentSkillRoots({
    env,
    homeDir,
    scope,
    projectDir,
  });
  const expected =
    target === "all"
      ? [
          ["codex", roots.codexCandidates],
          ["claude", roots.claudeCandidates],
        ]
      : [
          [
            target,
            target === "codex"
              ? roots.codexCandidates
              : roots.claudeCandidates,
          ],
        ];
  const missing = [];
  const mismatched = [];
  for (const [agent, candidates] of expected) {
    const existingSkillDirs = [];
    for (const root of candidates) {
      const skillFile = path.join(root, "gpt-image", "SKILL.md");
      if (await exists(skillFile)) {
        existingSkillDirs.push(path.dirname(skillFile));
      }
    }
    if (existingSkillDirs.length === 0) {
      missing.push({
        agent,
        candidates: candidates.map((root) =>
          path.join(root, "gpt-image", "SKILL.md"),
        ),
      });
      continue;
    }
    const digests = [];
    for (const skillDir of existingSkillDirs) {
      digests.push({
        skillDir,
        actual: await digestDirectory(skillDir),
      });
    }
    if (!digests.some(({ actual }) => actual === expectedDigest)) {
      mismatched.push(
        ...digests.map(({ skillDir, actual }) => ({
          agent,
          skillDir,
          expected: expectedDigest,
          actual,
        })),
      );
    }
  }
  return { missing, mismatched };
}

async function main() {
  let options;
  try {
    options = parseCli(process.argv.slice(2));
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exitCode = 2;
    return;
  }

  if (options.command === "help") {
    printHelp();
    return;
  }

  if (options.command === "check") {
    const report = await inspectSkill({
      skillDir: options.skillDir,
      env: process.env,
    });
    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printHumanReport(report);
    }
    process.exitCode = report.ok ? 0 : 1;
    return;
  }

  if (options.command === "install-gpt-image") {
    let install;
    try {
      install = buildGptImageInstallCommand(options);
    } catch (error) {
      console.error(`error: ${error.message}`);
      process.exitCode = 2;
      return;
    }

    if (options.dryRun) {
      const output = {
        ...install,
        cwd: options.scope === "project" ? options.projectDir : process.cwd(),
        dryRun: true,
      };
      console.log(
        options.json
          ? JSON.stringify(output, null, 2)
          : [install.command, ...install.args].join(" "),
      );
      return;
    }

    if (
      options.scope === "project" &&
      !(await exists(options.projectDir))
    ) {
      console.error(`error: project directory not found: ${options.projectDir}`);
      process.exitCode = 2;
      return;
    }

    const result = spawnSync(install.command, install.args, {
      cwd: options.scope === "project" ? options.projectDir : process.cwd(),
      env: buildInstallerEnv(process.env),
      stdio: "inherit",
    });
    if (result.status !== 0) {
      process.exitCode = result.status ?? 1;
      return;
    }

    const verification = await verifyGptImageInstall(
      options.target,
      process.env,
      {
        scope: options.scope,
        projectDir: options.projectDir,
      },
    );
    if (verification.missing.length > 0) {
      console.error(
        `error: installer exited successfully but these files are missing:\n${JSON.stringify(verification.missing, null, 2)}`,
      );
      process.exitCode = 1;
      return;
    }
    if (verification.mismatched.length > 0) {
      console.error(
        `error: gpt-image provenance mismatch:\n${JSON.stringify(verification.mismatched, null, 2)}`,
      );
      process.exitCode = 1;
      return;
    }
    console.log("gpt-image installation: PASS");
    return;
  }

  console.error(`error: unknown command: ${options.command}`);
  process.exitCode = 2;
}

function canonicalPath(targetPath) {
  try {
    return realpathSync.native(targetPath);
  } catch {
    return path.resolve(targetPath);
  }
}

const isEntrypoint =
  process.argv[1] &&
  canonicalPath(process.argv[1]) === canonicalPath(fileURLToPath(import.meta.url));
if (isEntrypoint) {
  await main();
}
