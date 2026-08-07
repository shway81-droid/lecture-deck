#!/usr/bin/env node

import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VALIDATOR_VERSION = "1.0.0";
const TERMINAL_ATTEMPTS = new Set([
  "returned_complete",
  "returned_incomplete",
  "failed_terminal",
]);
const TERMINAL_LEADS = new Set([
  "investigated_closed",
  "duplicate",
  "dead_end",
  "unresolved",
]);
const ACTIVE_LEADS = new Set(["open", "queued", "investigating"]);

function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (!["init", "validate", "approve-gate2"].includes(command)) {
    throw new Error(
      "usage: research-session.mjs <init|validate|approve-gate2> [options]",
    );
  }
  const options = { axis: [] };
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token === "--json") {
      options.json = true;
      continue;
    }
    if (!token.startsWith("--")) {
      throw new Error(`unexpected argument: ${token}`);
    }
    const key = token.slice(2);
    const value = rest[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`missing value for --${key}`);
    }
    index += 1;
    if (key === "axis") options.axis.push(value);
    else options[key] = value;
  }
  return { command, options };
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(target) {
  return createHash("sha256").update(await readFile(target)).digest("hex");
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function digest(value) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function researchDigest(state) {
  const {
    updated_at: _updatedAt,
    status: _status,
    convergence: _convergence,
    gates = {},
    ...rest
  } = state;
  return digest({
    ...rest,
    gates: { gate1: gates.gate1 ?? {} },
  });
}

function approvalReceipt(gate2) {
  return digest({
    validator_version: gate2.validator_version,
    brief_sha256: gate2.brief_sha256,
    research_sha256: gate2.research_sha256,
    outline_sha256: gate2.outline_sha256,
    research_digest: gate2.research_digest,
    approved_at: gate2.approved_at,
  });
}

function safeRelative(value) {
  if (typeof value !== "string" || value.length === 0) return false;
  if (path.isAbsolute(value) || /^[A-Za-z]:[\\/]/.test(value)) return false;
  const normalized = value.replaceAll("\\", "/");
  return !normalized.split("/").includes("..") && !normalized.startsWith("/");
}

function within(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeAxes(options) {
  let raw = [];
  if (options.axes !== undefined) {
    try {
      raw = JSON.parse(options.axes);
    } catch {
      throw new Error("--axes must be a JSON array");
    }
    if (!Array.isArray(raw)) throw new Error("--axes must be a JSON array");
  }
  raw.push(...options.axis);
  if (raw.length === 0) throw new Error("at least one --axis or --axes item is required");

  return raw.map((item, index) => {
    const source =
      typeof item === "string"
        ? { question: item }
        : item && typeof item === "object"
          ? item
          : {};
    const axisId = source.axis_id || `A${index + 1}`;
    const question = source.question || source.title;
    if (!question || typeof question !== "string") {
      throw new Error(`axis ${index + 1} requires a question`);
    }
    const attemptId = `T${index + 1}`;
    return {
      axis: {
        axis_id: axisId,
        question,
        lecture_need: source.lecture_need || options.topic,
        outline_refs: asArray(source.outline_refs),
        source_territories: asArray(source.source_territories),
        freshness: source.freshness || "current at research date",
        success_condition: source.success_condition || "evidence and counter-evidence recorded",
        status: "planned",
        attempt_ids: [attemptId],
        lead_ids: [],
        result_summary: "",
        blocker: null,
      },
      attempt: {
        attempt_id: attemptId,
        axis_id: axisId,
        mode: "sequential",
        status: "queued",
        started_at: null,
        finished_at: null,
        host_reference: null,
        error: null,
        result_digest: null,
      },
    };
  });
}

function defaultCapabilities() {
  return {
    orchestration: "sequential",
    max_parallel: 1,
    search: "none",
    fetch: "none",
    interactive_browser: false,
    screenshots: false,
    local_read: true,
    shell_readonly: true,
    network: "unknown",
    workspace_write: "allowed",
    limitations: ["Set capabilities to observed host values before research."],
  };
}

async function initialize(options) {
  const deck = options.deck;
  const sessionId = options["session-id"];
  const topic = options.topic;
  const depth = options.depth || "standard";
  if (!deck || !sessionId || !topic) {
    throw new Error("init requires --deck, --session-id, and --topic");
  }
  if (!["quick", "standard", "deep"].includes(depth)) {
    throw new Error("--depth must be quick, standard, or deep");
  }

  const deckDir = path.resolve(deck);
  await mkdir(deckDir, { recursive: true });
  const briefPath = path.join(deckDir, "brief.md");
  const outlinePath = path.join(deckDir, "outline.md");
  const researchPath = path.join(deckDir, "research.md");
  const statePath = path.join(deckDir, "research-state.json");
  for (const required of [briefPath, outlinePath]) {
    if (!(await exists(required))) {
      throw new Error(`required Gate 1 input is missing: ${path.basename(required)}`);
    }
  }
  if (await exists(statePath)) {
    throw new Error(`refusing to overwrite existing state: ${statePath}`);
  }
  if (!(await exists(researchPath))) {
    await writeFile(
      researchPath,
      `# ${topic} 리서치\n\n검증된 조사 결과를 여기에 투영합니다.\n`,
      "utf8",
    );
  }

  const normalized = normalizeAxes(options);
  const now = new Date().toISOString();
  const briefSha = await sha256File(briefPath);
  const outlineSha = await sha256File(outlinePath);
  const researchSha = await sha256File(researchPath);
  const state = {
    schema_version: 1,
    session_id: sessionId,
    lecture_slug: path.basename(deckDir),
    topic,
    depth,
    status: "initialized",
    created_at: now,
    updated_at: now,
    gates: {
      gate1: {
        status: "approved",
        brief_path: "brief.md",
        brief_sha256: briefSha,
        outline_path: "outline.md",
        outline_sha256: outlineSha,
        outline_revision: 1,
        approved_at: now,
      },
      gate2: {
        status: "not_ready",
        validated_at: null,
        validator_version: VALIDATOR_VERSION,
        brief_sha256: briefSha,
        research_sha256: researchSha,
        outline_sha256: outlineSha,
        research_digest: null,
        errors: [],
        accepted_gap_ids: [],
        approved_at: null,
        approval_receipt_sha256: null,
      },
    },
    capabilities: defaultCapabilities(),
    axes: normalized.map(({ axis }) => axis),
    attempts: normalized.map(({ attempt }) => attempt),
    waves: [],
    leads: [],
    sources: [],
    observations: [],
    claims: [],
    verifications: [],
    visuals: [],
    convergence: {
      status: "pending",
      planned_axis_count: normalized.length,
      closed_axis_count: 0,
      open_lead_count: 0,
      terminal_lead_count: 0,
      expansion_audit_count: 0,
      high_risk_claim_count: 0,
      verified_high_risk_claim_count: 0,
      unresolved_claim_ids: [],
      accepted_gap_ids: [],
      checked_at: null,
      errors: [],
    },
    projection: {
      research_md_path: "research.md",
      research_md_sha256: researchSha,
      outline_delta: [],
      slide_claim_map: [],
      unresolved_summary: [],
      generated_at: now,
    },
  };
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  return {
    ok: true,
    ready: false,
    state_path: statePath,
    deck_dir: deckDir,
    research_digest: researchDigest(state),
    diagnostics: [],
    summary: {
      axes_planned: state.axes.length,
      axes_closed: 0,
      leads_total: 0,
      leads_open: 0,
      waves: 0,
      claims: 0,
      established_claims: 0,
      accepted_gaps: 0,
    },
  };
}

function addDiagnostic(list, code, itemPath, message) {
  list.push({ code, path: itemPath, message });
}

function idMap(items, key, itemPath, diagnostics) {
  const map = new Map();
  for (const [index, item] of items.entries()) {
    const id = item?.[key];
    if (typeof id !== "string" || id.length === 0) {
      addDiagnostic(diagnostics, "E_ID_MISSING", `${itemPath}[${index}].${key}`, "ID is required");
    } else if (map.has(id)) {
      addDiagnostic(diagnostics, "E_ID_DUPLICATE", `${itemPath}[${index}].${key}`, `duplicate ID: ${id}`);
    } else {
      map.set(id, item);
    }
  }
  return map;
}

function sourceDomain(source) {
  if (typeof source?.url === "string" && source.url) {
    try {
      return new URL(source.url).hostname.toLowerCase();
    } catch {
      return "";
    }
  }
  return String(source?.publisher || "").trim().toLowerCase();
}

function validateState(state, deckDir, hashes) {
  const diagnostics = [];
  const acceptedGaps = new Set(asArray(state.gates?.gate2?.accepted_gap_ids));
  const axes = asArray(state.axes);
  const attempts = asArray(state.attempts);
  const waves = asArray(state.waves);
  const leads = asArray(state.leads);
  const sources = asArray(state.sources);
  const observations = asArray(state.observations);
  const claims = asArray(state.claims);
  const verifications = asArray(state.verifications);
  const visuals = asArray(state.visuals);

  if (state.schema_version !== 1) {
    addDiagnostic(diagnostics, "E_SCHEMA_VERSION", "schema_version", "schema_version must be 1");
  }
  if (state.gates?.gate1?.status !== "approved") {
    addDiagnostic(diagnostics, "E_GATE1_NOT_APPROVED", "gates.gate1.status", "Gate 1 must be approved");
  }
  if (state.gates?.gate1?.brief_sha256 !== hashes.brief) {
    addDiagnostic(diagnostics, "E_GATE1_BRIEF_STALE", "gates.gate1.brief_sha256", "brief.md changed after Gate 1");
  }
  if (state.gates?.gate1?.outline_sha256 !== hashes.outline) {
    addDiagnostic(diagnostics, "E_GATE1_OUTLINE_STALE", "gates.gate1.outline_sha256", "outline.md changed after Gate 1");
  }

  const axisMap = idMap(axes, "axis_id", "axes", diagnostics);
  const attemptMap = idMap(attempts, "attempt_id", "attempts", diagnostics);
  const leadMap = idMap(leads, "lead_id", "leads", diagnostics);
  const sourceMap = idMap(sources, "source_id", "sources", diagnostics);
  const observationMap = idMap(observations, "observation_id", "observations", diagnostics);
  const claimMap = idMap(claims, "claim_id", "claims", diagnostics);
  const verificationMap = idMap(verifications, "verification_id", "verifications", diagnostics);

  for (const [index, axis] of axes.entries()) {
    if (axis.status !== "closed") {
      addDiagnostic(diagnostics, "E_AXIS_NOT_CLOSED", `axes[${index}].status`, `${axis.axis_id || "axis"} is not closed`);
    }
    if (axis.status === "closed" && !axis.result_summary) {
      addDiagnostic(diagnostics, "E_AXIS_RESULT_SUMMARY", `axes[${index}].result_summary`, "closed axis requires a result summary");
    }
    const attemptIds = asArray(axis.attempt_ids);
    if (attemptIds.length === 0) {
      addDiagnostic(diagnostics, "E_AXIS_ATTEMPT_MISSING", `axes[${index}].attempt_ids`, "axis has no durable attempt");
    }
    let terminalAttempt = false;
    let incompleteAttempt = false;
    for (const id of attemptIds) {
      const attempt = attemptMap.get(id);
      if (!attempt) {
        addDiagnostic(diagnostics, "E_ATTEMPT_REF", `axes[${index}].attempt_ids`, `unknown attempt: ${id}`);
      } else {
        if (attempt.axis_id !== axis.axis_id) {
          addDiagnostic(diagnostics, "E_ATTEMPT_AXIS_MISMATCH", `axes[${index}].attempt_ids`, `${id} belongs to ${attempt.axis_id}`);
        } else if (TERMINAL_ATTEMPTS.has(attempt.status)) {
          terminalAttempt = true;
          incompleteAttempt ||= ["returned_incomplete", "failed_terminal"].includes(
            attempt.status,
          );
        }
      }
    }
    if (!terminalAttempt) {
      addDiagnostic(diagnostics, "E_AXIS_RESULT_MISSING", `axes[${index}].attempt_ids`, "axis has no terminal attempt");
    }
    if (
      axis.status === "closed" &&
      (incompleteAttempt || axis.blocker) &&
      !acceptedGaps.has(axis.axis_id) &&
      !(typeof axis.blocker === "string" && acceptedGaps.has(axis.blocker))
    ) {
      addDiagnostic(diagnostics, "E_AXIS_UNACCEPTED_GAP", `axes[${index}]`, "incomplete or blocked axis requires an accepted gap");
    }
    for (const id of asArray(axis.lead_ids)) {
      if (!leadMap.has(id)) addDiagnostic(diagnostics, "E_LEAD_REF", `axes[${index}].lead_ids`, `unknown lead: ${id}`);
    }
  }
  for (const [index, attempt] of attempts.entries()) {
    if (!axisMap.has(attempt.axis_id)) {
      addDiagnostic(diagnostics, "E_AXIS_REF", `attempts[${index}].axis_id`, `unknown axis: ${attempt.axis_id}`);
    }
    if (!TERMINAL_ATTEMPTS.has(attempt.status)) {
      addDiagnostic(diagnostics, "E_ATTEMPT_NOT_TERMINAL", `attempts[${index}].status`, `${attempt.attempt_id || "attempt"} is not terminal`);
    }
    if (TERMINAL_ATTEMPTS.has(attempt.status) && !attempt.finished_at) {
      addDiagnostic(diagnostics, "E_ATTEMPT_FINISHED_AT", `attempts[${index}].finished_at`, "terminal attempt requires finished_at");
    }
    if (attempt.status === "returned_complete" && !attempt.result_digest) {
      addDiagnostic(diagnostics, "E_ATTEMPT_RESULT_DIGEST", `attempts[${index}].result_digest`, "complete attempt requires a result digest");
    }
  }

  for (const [index, lead] of leads.entries()) {
    if (!axisMap.has(lead.parent_axis_id)) {
      addDiagnostic(diagnostics, "E_AXIS_REF", `leads[${index}].parent_axis_id`, `unknown axis: ${lead.parent_axis_id}`);
    }
    if (lead.parent_lead_id && !leadMap.has(lead.parent_lead_id)) {
      addDiagnostic(diagnostics, "E_LEAD_PARENT_REF", `leads[${index}].parent_lead_id`, `unknown lead: ${lead.parent_lead_id}`);
    }
    if (!TERMINAL_LEADS.has(lead.status)) {
      addDiagnostic(diagnostics, "E_LEAD_OPEN", `leads[${index}].status`, `${lead.lead_id || "lead"} is not terminal`);
    }
    if (lead.status === "duplicate" && !leadMap.has(lead.duplicate_of)) {
      addDiagnostic(diagnostics, "E_LEAD_DUPLICATE_REF", `leads[${index}].duplicate_of`, "duplicate lead target is missing");
    }
    if (
      lead.status === "unresolved" &&
      !asArray(state.gates?.gate2?.accepted_gap_ids).includes(lead.accepted_gap_id)
    ) {
      addDiagnostic(diagnostics, "E_LEAD_UNACCEPTED_GAP", `leads[${index}].accepted_gap_id`, "unresolved lead is not bound to an accepted gap");
    }
  }

  const waveKinds = new Set(waves.map((wave) => wave?.kind));
  if (!waveKinds.has("initial")) {
    addDiagnostic(diagnostics, "E_INITIAL_WAVE", "waves", "research requires a completed initial wave");
  } else {
    const initialAxisIds = new Set(
      waves
        .filter((wave) => wave?.kind === "initial" && wave.completed_at)
        .flatMap((wave) => asArray(wave.axis_ids)),
    );
    for (const axis of axes) {
      if (axis.axis_id && !initialAxisIds.has(axis.axis_id)) {
        addDiagnostic(
          diagnostics,
          "E_INITIAL_COVERAGE",
          "waves",
          `initial waves do not cover planned axis: ${axis.axis_id}`,
        );
      }
    }
  }
  if (state.depth === "deep" && axes.length < 3) {
    addDiagnostic(diagnostics, "E_DEEP_AXES", "axes", "deep research requires at least three axes");
  }
  if (
    state.depth === "deep" &&
    (!waveKinds.has("counter_audit") || !waveKinds.has("gap_audit"))
  ) {
    addDiagnostic(diagnostics, "E_EXPANSION_AUDITS", "waves", "deep research requires counter and gap audit waves");
  }
  for (const [index, wave] of waves.entries()) {
    for (const id of asArray(wave.axis_ids)) {
      if (!axisMap.has(id)) addDiagnostic(diagnostics, "E_AXIS_REF", `waves[${index}].axis_ids`, `unknown axis: ${id}`);
    }
    for (const id of [...asArray(wave.lead_ids_opened), ...asArray(wave.lead_ids_closed)]) {
      if (!leadMap.has(id)) addDiagnostic(diagnostics, "E_LEAD_REF", `waves[${index}]`, `unknown lead: ${id}`);
    }
    if (!wave.completed_at) {
      addDiagnostic(diagnostics, "E_WAVE_INCOMPLETE", `waves[${index}].completed_at`, "wave is not complete");
    }
  }

  for (const [index, source] of sources.entries()) {
    const hasUrl = typeof source.url === "string" && source.url.length > 0;
    const hasLocal = typeof source.local_path === "string" && source.local_path.length > 0;
    if (!hasUrl && !hasLocal) {
      addDiagnostic(diagnostics, "E_SOURCE_LOCATION", `sources[${index}]`, "source requires an https URL or safe local path");
    }
    if (hasUrl) {
      try {
        const parsed = new URL(source.url);
        if (parsed.protocol !== "https:") throw new Error();
      } catch {
        addDiagnostic(diagnostics, "E_SOURCE_URL", `sources[${index}].url`, "source URL must use https");
      }
    }
    if (hasLocal && !safeRelative(source.local_path)) {
      addDiagnostic(diagnostics, "E_PATH_ESCAPE", `sources[${index}].local_path`, "local source path must stay inside the deck");
    }
  }

  for (const [index, observation] of observations.entries()) {
    if (!sourceMap.has(observation.source_id)) {
      addDiagnostic(diagnostics, "E_SOURCE_REF", `observations[${index}].source_id`, `unknown source: ${observation.source_id}`);
    }
    for (const id of asArray(observation.supports_claim_ids)) {
      const claim = claimMap.get(id);
      if (!claim) {
        addDiagnostic(diagnostics, "E_CLAIM_REF", `observations[${index}]`, `unknown claim: ${id}`);
      } else if (
        !asArray(claim.support_observation_ids).includes(
          observation.observation_id,
        )
      ) {
        addDiagnostic(diagnostics, "E_CLAIM_OBSERVATION_LINK", `observations[${index}].supports_claim_ids`, `${id} does not include ${observation.observation_id} as support`);
      }
    }
    for (const id of asArray(observation.contradicts_claim_ids)) {
      const claim = claimMap.get(id);
      if (!claim) {
        addDiagnostic(diagnostics, "E_CLAIM_REF", `observations[${index}]`, `unknown claim: ${id}`);
      } else if (
        !asArray(claim.contradict_observation_ids).includes(
          observation.observation_id,
        )
      ) {
        addDiagnostic(diagnostics, "E_CLAIM_OBSERVATION_LINK", `observations[${index}].contradicts_claim_ids`, `${id} does not include ${observation.observation_id} as contradiction`);
      }
    }
  }

  for (const [index, claim] of claims.entries()) {
    const support = asArray(claim.support_observation_ids);
    const contradict = asArray(claim.contradict_observation_ids);
    for (const id of [...support, ...contradict]) {
      if (!observationMap.has(id)) {
        addDiagnostic(diagnostics, "E_OBSERVATION_REF", `claims[${index}]`, `unknown observation: ${id}`);
      }
    }
    for (const id of support) {
      const observation = observationMap.get(id);
      if (
        observation &&
        !asArray(observation.supports_claim_ids).includes(claim.claim_id)
      ) {
        addDiagnostic(diagnostics, "E_CLAIM_OBSERVATION_LINK", `claims[${index}].support_observation_ids`, `${id} does not reciprocally support ${claim.claim_id}`);
      }
    }
    for (const id of contradict) {
      const observation = observationMap.get(id);
      if (
        observation &&
        !asArray(observation.contradicts_claim_ids).includes(claim.claim_id)
      ) {
        addDiagnostic(diagnostics, "E_CLAIM_OBSERVATION_LINK", `claims[${index}].contradict_observation_ids`, `${id} does not reciprocally contradict ${claim.claim_id}`);
      }
    }
    for (const id of asArray(claim.verification_ids)) {
      if (!verificationMap.has(id)) addDiagnostic(diagnostics, "E_VERIFICATION_REF", `claims[${index}]`, `unknown verification: ${id}`);
    }
    const observedSources = new Set(
      [...support, ...contradict]
        .map((id) => observationMap.get(id)?.source_id)
        .filter(Boolean),
    );
    const claimedSources = new Set(asArray(claim.source_ids));
    for (const id of claimedSources) {
      if (!sourceMap.has(id)) {
        addDiagnostic(diagnostics, "E_SOURCE_REF", `claims[${index}].source_ids`, `unknown source: ${id}`);
      }
    }
    if (
      observedSources.size !== claimedSources.size ||
      [...observedSources].some((id) => !claimedSources.has(id))
    ) {
      addDiagnostic(diagnostics, "E_CLAIM_SOURCE_SET", `claims[${index}].source_ids`, "claim sources must equal its observation sources");
    }
    if (claim.status === "supported" && (support.length === 0 || claimedSources.size === 0)) {
      addDiagnostic(diagnostics, "E_CLAIM_SUPPORT", `claims[${index}]`, "supported claim requires observations and sources");
    }
    if (claim.risk === "high" && claim.status === "supported") {
      const groups = new Set(
        support.map((id) => observationMap.get(id)?.independence_group).filter(Boolean),
      );
      const domains = new Set(
        [...claimedSources].map((id) => sourceDomain(sourceMap.get(id))).filter(Boolean),
      );
      const primary = sourceMap.get(claim.primary_source_id);
      const confirmedVerification = asArray(claim.verification_ids).some(
        (id) => verificationMap.get(id)?.status === "confirmed",
      );
      if (!primary?.primary) addDiagnostic(diagnostics, "E_HIGH_PRIMARY", `claims[${index}].primary_source_id`, "high-risk claim requires a primary source");
      if (primary && !claimedSources.has(claim.primary_source_id)) addDiagnostic(diagnostics, "E_HIGH_PRIMARY_LINK", `claims[${index}].primary_source_id`, "primary source must be part of the claim source set");
      if (groups.size < 2) addDiagnostic(diagnostics, "E_HIGH_OBSERVATION_GROUPS", `claims[${index}].independence_groups`, "high-risk claim requires two independent observation groups");
      if (domains.size < 2) addDiagnostic(diagnostics, "E_HIGH_SOURCE_DOMAINS", `claims[${index}].source_ids`, "high-risk claim requires two independent source domains");
      if (!claim.counter_search) addDiagnostic(diagnostics, "E_HIGH_COUNTER_SEARCH", `claims[${index}].counter_search`, "high-risk claim requires a counter-search");
      if (!claim.valid_at) addDiagnostic(diagnostics, "E_HIGH_VALID_AT", `claims[${index}].valid_at`, "high-risk claim requires temporal validity");
      if (!confirmedVerification) addDiagnostic(diagnostics, "E_HIGH_VERIFICATION", `claims[${index}].verification_ids`, "high-risk claim requires a confirmed verification");
    }
  }

  for (const [index, verification] of verifications.entries()) {
    for (const id of asArray(verification.claim_ids)) {
      if (!claimMap.has(id)) addDiagnostic(diagnostics, "E_CLAIM_REF", `verifications[${index}].claim_ids`, `unknown claim: ${id}`);
    }
    for (const field of ["stdout_path", "stderr_path"]) {
      if (verification[field] && !safeRelative(verification[field])) {
        addDiagnostic(diagnostics, "E_PATH_ESCAPE", `verifications[${index}].${field}`, "verification output path must stay inside the deck");
      }
    }
  }
  for (const [index, visual] of visuals.entries()) {
    if (!safeRelative(visual.path)) {
      addDiagnostic(diagnostics, "E_PATH_ESCAPE", `visuals[${index}].path`, "visual path must stay inside the deck");
    }
    if (visual.factual) {
      if (!visual.valid_at || asArray(visual.claim_ids).length === 0 || asArray(visual.source_ids).length === 0) {
        addDiagnostic(diagnostics, "E_FACTUAL_VISUAL_EVIDENCE", `visuals[${index}]`, "factual visual requires claims, sources, and valid_at");
      }
    }
  }

  const projectionPath = state.projection?.research_md_path;
  if (!safeRelative(projectionPath) || !within(deckDir, path.join(deckDir, projectionPath || ""))) {
    addDiagnostic(diagnostics, "E_PATH_ESCAPE", "projection.research_md_path", "research projection must stay inside the deck");
  }
  if (state.projection?.research_md_sha256 !== hashes.research) {
    addDiagnostic(diagnostics, "E_PROJECTION_STALE", "projection.research_md_sha256", "research.md hash does not match projection");
  }
  for (const [index, slide] of asArray(state.projection?.slide_claim_map).entries()) {
    for (const id of asArray(slide?.claim_ids)) {
      if (!claimMap.has(id)) {
        addDiagnostic(diagnostics, "E_CLAIM_REF", `projection.slide_claim_map[${index}].claim_ids`, `unknown claim: ${id}`);
      }
    }
    for (const id of asArray(slide?.source_ids)) {
      if (!sourceMap.has(id)) {
        addDiagnostic(diagnostics, "E_SOURCE_REF", `projection.slide_claim_map[${index}].source_ids`, `unknown source: ${id}`);
      }
    }
  }

  const currentDigest = researchDigest(state);
  const priorGate2 = state.gates?.gate2 ?? {};
  if (priorGate2.status === "approved" && !priorGate2.approved_at) {
    addDiagnostic(
      diagnostics,
      "E_GATE2_APPROVAL_RECEIPT",
      "gates.gate2.approved_at",
      "approved Gate 2 requires a recorded approval time",
    );
  }
  if (
    priorGate2.status === "approved" &&
    priorGate2.approved_at &&
    priorGate2.approval_receipt_sha256 !== approvalReceipt(priorGate2)
  ) {
    addDiagnostic(
      diagnostics,
      "E_GATE2_APPROVAL_RECEIPT",
      "gates.gate2.approval_receipt_sha256",
      "approved Gate 2 receipt is missing or does not match its inputs",
    );
  }
  if (
    ["ready", "approved"].includes(priorGate2.status) &&
    priorGate2.research_digest &&
    priorGate2.research_digest !== currentDigest
  ) {
    addDiagnostic(diagnostics, "E_GATE2_STALE", "gates.gate2.research_digest", "research changed after Gate 2 validation");
  }

  diagnostics.sort((left, right) =>
    `${left.code}\0${left.path}\0${left.message}`.localeCompare(
      `${right.code}\0${right.path}\0${right.message}`,
    ),
  );
  return { diagnostics, currentDigest, axes, leads, waves, claims };
}

async function validate(options) {
  if (!options.state || !options.deck) {
    throw new Error("validate requires --state and --deck");
  }
  const deckDir = path.resolve(options.deck);
  const statePath = path.resolve(options.state);
  if (!within(deckDir, statePath)) {
    throw new Error("--state must be inside --deck");
  }
  const [brief, outline, research] = ["brief.md", "outline.md", "research.md"].map(
    (name) => path.join(deckDir, name),
  );
  for (const required of [statePath, brief, outline, research]) {
    if (!(await exists(required))) throw new Error(`required file is missing: ${required}`);
  }
  let state;
  try {
    state = JSON.parse(await readFile(statePath, "utf8"));
  } catch (error) {
    throw new Error(`cannot parse research state: ${error.message}`);
  }
  const hashes = {
    brief: await sha256File(brief),
    outline: await sha256File(outline),
    research: await sha256File(research),
  };
  const result = validateState(state, deckDir, hashes);
  const acceptedGaps = asArray(state.gates?.gate2?.accepted_gap_ids);
  const openLeads = result.leads.filter((lead) => ACTIVE_LEADS.has(lead?.status));
  const closedAxes = result.axes.filter((axis) => axis?.status === "closed");
  const establishedClaims = result.claims.filter((claim) => claim?.status === "supported");
  const highRisk = establishedClaims.filter((claim) => claim?.risk === "high");
  const verifiedHighRisk = highRisk.filter((claim) =>
    asArray(claim.verification_ids).some((id) =>
      asArray(state.verifications).some(
        (verification) =>
          verification.verification_id === id &&
          verification.status === "confirmed",
      ),
    ),
  );
  const auditCount = result.waves.filter((wave) =>
    ["counter_audit", "gap_audit"].includes(wave?.kind),
  ).length;
  const now = new Date().toISOString();
  const ready = result.diagnostics.length === 0;
  const preserveApproval =
    ready && state.gates?.gate2?.status === "approved";

  state.updated_at = now;
  state.status = ready ? "gate2_ready" : "checking";
  state.convergence = {
    status: ready ? "ready" : "pending",
    planned_axis_count: result.axes.length,
    closed_axis_count: closedAxes.length,
    open_lead_count: openLeads.length,
    terminal_lead_count: result.leads.length - openLeads.length,
    expansion_audit_count: auditCount,
    high_risk_claim_count: highRisk.length,
    verified_high_risk_claim_count: verifiedHighRisk.length,
    unresolved_claim_ids: result.claims
      .filter((claim) => claim?.status === "unresolved")
      .map((claim) => claim.claim_id),
    accepted_gap_ids: acceptedGaps,
    checked_at: now,
    errors: result.diagnostics.map(({ code, path: itemPath }) => `${code}:${itemPath}`),
  };
  state.gates = state.gates || {};
  state.gates.gate2 = {
    ...(state.gates.gate2 || {}),
    status: ready
      ? preserveApproval
        ? "approved"
        : "ready"
      : state.gates.gate2?.status === "approved"
        ? "stale"
        : "not_ready",
    validated_at: now,
    validator_version: VALIDATOR_VERSION,
    brief_sha256: hashes.brief,
    research_sha256: hashes.research,
    outline_sha256: hashes.outline,
    research_digest: result.currentDigest,
    errors: result.diagnostics,
    accepted_gap_ids: acceptedGaps,
    approved_at: preserveApproval
      ? state.gates.gate2.approved_at
      : null,
    approval_receipt_sha256: preserveApproval
      ? state.gates.gate2.approval_receipt_sha256
      : null,
  };
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");

  return {
    ok: true,
    ready,
    state_path: statePath,
    deck_dir: deckDir,
    research_digest: result.currentDigest,
    diagnostics: result.diagnostics,
    summary: {
      axes_planned: result.axes.length,
      axes_closed: closedAxes.length,
      leads_total: result.leads.length,
      leads_open: openLeads.length,
      waves: result.waves.length,
      claims: result.claims.length,
      established_claims: establishedClaims.length,
      accepted_gaps: acceptedGaps.length,
    },
  };
}

async function approveGate2(options) {
  const result = await validate(options);
  if (!result.ready) return result;

  const state = JSON.parse(await readFile(result.state_path, "utf8"));
  if (!["ready", "approved"].includes(state.gates?.gate2?.status)) {
    throw new Error("Gate 2 is not ready for approval");
  }
  const now = state.gates.gate2.approved_at || new Date().toISOString();
  state.status = "gate2_approved";
  state.updated_at = now;
  state.gates.gate2.status = "approved";
  state.gates.gate2.approved_at = now;
  state.gates.gate2.approval_receipt_sha256 = approvalReceipt(
    state.gates.gate2,
  );
  await writeFile(result.state_path, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  return { ...result, approved: true, approved_at: now };
}

function printResult(result, json) {
  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  process.stdout.write(
    [
      `research session: ${result.ready ? "READY" : result.ok ? "NOT READY" : "ERROR"}`,
      `state: ${result.state_path}`,
      `axes: ${result.summary.axes_closed}/${result.summary.axes_planned} closed`,
      `leads: ${result.summary.leads_open}/${result.summary.leads_total} open`,
      ...result.diagnostics.map(
        (diagnostic) => `${diagnostic.code} ${diagnostic.path}: ${diagnostic.message}`,
      ),
      "",
    ].join("\n"),
  );
}

export {
  approveGate2,
  initialize,
  researchDigest,
  safeRelative,
  validate,
  validateState,
};

async function main() {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
    const result =
      parsed.command === "init"
        ? await initialize(parsed.options)
        : parsed.command === "approve-gate2"
          ? await approveGate2(parsed.options)
          : await validate(parsed.options);
    printResult(result, parsed.options.json);
    process.exitCode =
      ["validate", "approve-gate2"].includes(parsed.command) && !result.ready
        ? 1
        : 0;
  } catch (error) {
    const json = process.argv.includes("--json");
    const result = {
      ok: false,
      ready: false,
      diagnostics: [
        { code: "E_CLI_IO", path: "", message: error.message },
      ],
    };
    if (json) process.stderr.write(`${JSON.stringify(result, null, 2)}\n`);
    else process.stderr.write(`research session error: ${error.message}\n`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await main();
}
