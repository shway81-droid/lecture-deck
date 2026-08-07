#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  agentSkillRoots,
  buildInstallerEnv,
  REQUIRED_ASSETS,
} from "./setup.mjs";

const SKILLS_CLI_SPEC = "skills@1.5.20";
const SKILL_NAME = "lecture-deck";
const SKILL_SOURCE = "NewTurn2017/lecture-deck";
const AGENTS = Object.freeze({
  both: ["codex", "claude-code"],
  codex: ["codex"],
  claude: ["claude-code"],
});

function requireValue(flag, args) {
  const value = args.shift();
  if (!value || value.startsWith("-")) {
    throw new Error(`${flag} 옵션에는 값이 필요합니다.`);
  }
  return value;
}

function normalizeAgent(value) {
  const normalized = String(value).toLowerCase();
  if (["both", "all"].includes(normalized)) return "both";
  if (normalized === "codex") return "codex";
  if (["claude", "claude-code"].includes(normalized)) return "claude";
  throw new Error("--agent 값은 both, codex, claude 중 하나여야 합니다.");
}

function normalizeScope(value) {
  const normalized = String(value).toLowerCase();
  if (normalized === "global") return "global";
  if (["local", "project"].includes(normalized)) return "local";
  throw new Error("--scope 값은 global, local 중 하나여야 합니다.");
}

export function parseInstallArgs(argv) {
  const options = {
    agent: null,
    dryRun: false,
    help: false,
    json: false,
    scope: null,
    tui: null,
    yes: false,
  };
  const args = [...argv];
  while (args.length > 0) {
    const flag = args.shift();
    switch (flag) {
      case "--agent":
        options.agent = normalizeAgent(requireValue(flag, args));
        break;
      case "--scope":
        options.scope = normalizeScope(requireValue(flag, args));
        break;
      case "--global":
        options.scope = "global";
        break;
      case "--local":
        options.scope = "local";
        break;
      case "--tui":
        options.tui = true;
        break;
      case "--no-tui":
        options.tui = false;
        break;
      case "--yes":
      case "-y":
        options.yes = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--json":
        options.json = true;
        options.tui = false;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        throw new Error(`알 수 없는 옵션: ${flag}`);
    }
  }
  return options;
}

export function buildInstallPlan({
  agent,
  scope,
  source = SKILL_SOURCE,
  cwd = process.cwd(),
} = {}) {
  if (!AGENTS[agent]) {
    throw new Error("agent 값은 both, codex, claude 중 하나여야 합니다.");
  }
  if (!["global", "local"].includes(scope)) {
    throw new Error("scope 값은 global, local 중 하나여야 합니다.");
  }

  const args = [
    "--yes",
    SKILLS_CLI_SPEC,
    "add",
    source,
    "--skill",
    SKILL_NAME,
  ];
  if (scope === "global") {
    args.push("--global");
  }
  for (const target of AGENTS[agent]) {
    args.push("--agent", target);
  }
  args.push("--copy", "--yes");

  return {
    command: process.platform === "win32" ? "npx.cmd" : "npx",
    args,
    agent,
    agents: [...AGENTS[agent]],
    cwd: path.resolve(cwd),
    scope,
    source,
  };
}

function supportsColor(stream, env = process.env) {
  return Boolean(stream.isTTY && env.NO_COLOR === undefined);
}

function paint(text, code, enabled) {
  return enabled ? `\u001b[${code}m${text}\u001b[0m` : text;
}

function printBanner(output, color) {
  output.write(
    [
      "",
      paint("╭──────────────────────────────────────────╮", "36", color),
      paint("│  Lecture Deck Installer                  │", "1;36", color),
      paint("│  출처 기반 강의 제작 스킬을 설치합니다  │", "36", color),
      paint("╰──────────────────────────────────────────╯", "36", color),
      "",
    ].join("\n"),
  );
  output.write("\n");
}

async function choose(rl, output, {
  title,
  choices,
  color,
}) {
  output.write(`${paint(title, "1", color)}\n`);
  choices.forEach((choice, index) => {
    const recommendation = choice.recommended
      ? paint("  추천", "32", color)
      : "";
    output.write(
      `  ${paint(`${index + 1}.`, "36", color)} ${choice.label}${recommendation}\n`,
    );
  });
  while (true) {
    const answer = (await rl.question(paint("선택 › ", "1;36", color))).trim();
    const selected = Number(answer || "1") - 1;
    if (Number.isInteger(selected) && choices[selected]) {
      output.write("\n");
      return choices[selected].value;
    }
    output.write("번호를 다시 입력해 주세요.\n");
  }
}

async function confirm(rl, output, color) {
  const answer = (
    await rl.question(paint("이대로 설치할까요? [Y/n] › ", "1;36", color))
  )
    .trim()
    .toLowerCase();
  return !["n", "no", "아니오"].includes(answer);
}

export async function completeWithTui(
  options,
  {
    input = process.stdin,
    output = process.stdout,
    env = process.env,
  } = {},
) {
  const color = supportsColor(output, env);
  const rl = createInterface({ input, output });
  printBanner(output, color);
  try {
    const agent =
      options.agent ||
      (await choose(rl, output, {
        title: "어디에 설치할까요?",
        choices: [
          {
            label: "Codex + Claude Code",
            value: "both",
            recommended: true,
          },
          { label: "Codex만", value: "codex" },
          { label: "Claude Code만", value: "claude" },
        ],
        color,
      }));
    const scope =
      options.scope ||
      (await choose(rl, output, {
        title: "설치 범위를 선택하세요.",
        choices: [
          {
            label: "Global  모든 프로젝트에서 사용",
            value: "global",
            recommended: true,
          },
          {
            label: "Local   현재 프로젝트에서만 사용",
            value: "local",
          },
        ],
        color,
      }));

    output.write(`${paint("설치 설정", "1", color)}\n`);
    output.write(
      `  에이전트  ${agent === "both" ? "Codex + Claude Code" : agent === "codex" ? "Codex" : "Claude Code"}\n`,
    );
    output.write(
      `  범위      ${scope === "global" ? "Global" : "Local"}\n\n`,
    );
    const accepted = options.yes || (await confirm(rl, output, color));
    return { ...options, agent, scope, accepted };
  } finally {
    rl.close();
  }
}

async function fileExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function verifyInstall({
  agents,
  scope,
  cwd = process.cwd(),
  env = process.env,
  homeDir = os.homedir(),
} = {}) {
  const roots = agentSkillRoots({
    env,
    homeDir,
    scope: scope === "local" ? "project" : "global",
    projectDir: cwd,
  });
  const checks = [];
  for (const agent of agents) {
    const key = agent === "codex" ? "codex" : "claude";
    const candidates = roots[`${key}Candidates`];
    let installedPath = null;
    let missingAssets = [];
    for (const root of candidates) {
      const skillDir = path.join(root, SKILL_NAME);
      const missing = [];
      for (const relativePath of REQUIRED_ASSETS) {
        if (!(await fileExists(path.join(skillDir, relativePath)))) {
          missing.push(relativePath);
        }
      }
      if (missing.length === 0) {
        installedPath = skillDir;
        missingAssets = [];
        break;
      }
      if (missingAssets.length === 0 || missing.length < missingAssets.length) {
        missingAssets = missing;
      }
    }
    checks.push({
      agent,
      installedPath,
      missingAssets,
      ok: Boolean(installedPath),
    });
  }
  return {
    checks,
    ok: checks.every((check) => check.ok),
  };
}

function printHelp() {
  console.log(`Lecture Deck 설치기

사용법:
  npx -y github:NewTurn2017/lecture-deck
  npx -y github:NewTurn2017/lecture-deck --agent both --scope global --yes

옵션:
  --agent both|codex|claude   설치할 에이전트
  --scope global|local        모든 프로젝트 또는 현재 프로젝트
  --global / --local          범위 단축 옵션
  --tui / --no-tui            대화형 화면 사용 여부
  --yes, -y                   마지막 확인 생략
  --dry-run                   설치하지 않고 실행 계획만 출력
  --json                      기계 판독 형식으로 출력
  --help, -h                  도움말

TTY에서 선택값을 생략하면 설치 화면이 열립니다. 비대화형 환경에서는
--agent와 --scope를 모두 지정해야 합니다.`);
}

function printableCommand(plan) {
  return [plan.command, ...plan.args]
    .map((value) => (/\s/.test(value) ? JSON.stringify(value) : value))
    .join(" ");
}

async function main() {
  let options;
  try {
    options = parseInstallArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`오류: ${error.message}`);
    process.exitCode = 2;
    return;
  }
  if (options.help) {
    printHelp();
    return;
  }

  const interactive =
    options.tui === true ||
    (options.tui !== false &&
      process.stdin.isTTY &&
      process.stdout.isTTY &&
      (!options.agent || !options.scope));
  if (interactive) {
    options = await completeWithTui(options);
    if (!options.accepted) {
      console.log("설치를 취소했습니다.");
      return;
    }
  }
  if (!options.agent || !options.scope) {
    console.error(
      "오류: 비대화형 설치에는 --agent both|codex|claude와 --scope global|local이 필요합니다.",
    );
    process.exitCode = 2;
    return;
  }

  const plan = buildInstallPlan(options);
  if (options.dryRun) {
    const output = { ...plan, dryRun: true };
    console.log(
      options.json
        ? JSON.stringify(output, null, 2)
        : `실행 예정:\n${printableCommand(plan)}`,
    );
    return;
  }

  if (!options.json) {
    console.log(
      `\nlecture-deck 설치 중: ${plan.agent} / ${plan.scope}\n`,
    );
  }
  const result = spawnSync(plan.command, plan.args, {
    cwd: plan.cwd,
    encoding: options.json ? "utf8" : undefined,
    env: buildInstallerEnv(process.env),
    stdio: options.json ? "pipe" : "inherit",
  });
  if (result.status !== 0) {
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            ok: false,
            status: result.status ?? 1,
            stderr: result.stderr,
          },
          null,
          2,
        ),
      );
    } else {
      console.error("\n오류: skills 설치기가 실패했습니다.");
    }
    process.exitCode = result.status ?? 1;
    return;
  }

  const verification = await verifyInstall(plan);
  if (!verification.ok) {
    const message = {
      ok: false,
      error: "설치기는 성공했지만 필수 파일이 없는 대상이 있습니다.",
      verification,
    };
    console.log(
      options.json
        ? JSON.stringify(message, null, 2)
        : `\n오류: ${message.error}\n${JSON.stringify(verification, null, 2)}`,
    );
    process.exitCode = 1;
    return;
  }

  if (options.json) {
    console.log(JSON.stringify({ ok: true, plan, verification }, null, 2));
  } else {
    console.log("\n설치 완료");
    for (const check of verification.checks) {
      console.log(`  ${check.agent}: ${check.installedPath}`);
    }
    console.log("\nCodex 또는 Claude Code를 새 세션에서 시작해 주세요.");
  }
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
