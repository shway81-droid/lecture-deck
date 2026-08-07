import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  approveGate2,
  initialize,
  validate,
} from "../scripts/research-session.mjs";

async function sha256(target) {
  return createHash("sha256").update(await readFile(target)).digest("hex");
}

async function makeDeck(axisCount = 3, depth = "deep") {
  const root = await mkdtemp(path.join(os.tmpdir(), "lecture-research-"));
  const deck = path.join(root, "lectures", "sample");
  await writeFile(path.join(root, ".keep"), "");
  const { mkdir } = await import("node:fs/promises");
  await mkdir(deck, { recursive: true });
  await writeFile(path.join(deck, "brief.md"), "# Brief\nApproved.\n");
  await writeFile(path.join(deck, "outline.md"), "# Outline\n1. Evidence\n");
  const axes = Array.from({ length: axisCount }, (_, index) => ({
    axis_id: `A${index + 1}`,
    question: `Question ${index + 1}`,
    lecture_need: "Evidence",
    outline_refs: ["1"],
    source_territories: ["official"],
    freshness: "current",
    success_condition: "verified",
  }));
  await initialize({
    deck,
    "session-id": `session-${axisCount}`,
    topic: "Research fixture",
    depth,
    axes: JSON.stringify(axes),
    axis: [],
  });
  return { root, deck, statePath: path.join(deck, "research-state.json") };
}

async function loadState(statePath) {
  return JSON.parse(await readFile(statePath, "utf8"));
}

async function saveState(statePath, state) {
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

async function completeState(fixture) {
  const state = await loadState(fixture.statePath);
  for (const axis of state.axes) {
    axis.status = "closed";
    axis.result_summary = `Completed ${axis.axis_id}`;
  }
  for (const attempt of state.attempts) {
    attempt.status = "returned_complete";
    attempt.started_at = "2026-07-24T00:00:00.000Z";
    attempt.finished_at = "2026-07-24T00:01:00.000Z";
    attempt.result_digest = `result-${attempt.attempt_id}`;
  }
  state.waves = [
    {
      wave_id: "W1",
      kind: "initial",
      depth: 0,
      axis_ids: state.axes.map((axis) => axis.axis_id),
      lead_ids_opened: [],
      lead_ids_closed: [],
      started_at: "2026-07-24T00:00:00.000Z",
      completed_at: "2026-07-24T00:01:00.000Z",
      new_actionable_leads: 0,
      notes: "Initial evidence pass",
    },
    {
      wave_id: "W2",
      kind: "counter_audit",
      depth: 1,
      axis_ids: state.axes.map((axis) => axis.axis_id),
      lead_ids_opened: [],
      lead_ids_closed: [],
      started_at: "2026-07-24T00:01:00.000Z",
      completed_at: "2026-07-24T00:02:00.000Z",
      new_actionable_leads: 0,
      notes: "Counter evidence audit",
    },
    {
      wave_id: "W3",
      kind: "gap_audit",
      depth: 1,
      axis_ids: state.axes.map((axis) => axis.axis_id),
      lead_ids_opened: [],
      lead_ids_closed: [],
      started_at: "2026-07-24T00:02:00.000Z",
      completed_at: "2026-07-24T00:03:00.000Z",
      new_actionable_leads: 0,
      notes: "Coverage gap audit",
    },
  ];
  state.sources = [
    {
      source_id: "R1",
      canonical_key: "https://example.org/primary",
      title: "Primary evidence",
      publisher: "Example",
      url: "https://example.org/primary",
      local_path: null,
      published_or_updated_at: "2026-07-01",
      accessed_at: "2026-07-24",
      source_type: "official",
      retrieval_class: "full",
      primary: true,
      limitations: [],
    },
  ];
  state.observations = [
    {
      observation_id: "O1",
      source_id: "R1",
      observed_fact: "The verified fact.",
      anchor: "section 1",
      observed_at: "2026-07-24",
      valid_at: "2026-07-24",
      evidence_type: "primary document",
      retrieval_class: "full",
      independence_group: "example-primary",
      observer: "main",
      supports_claim_ids: ["C1"],
      contradicts_claim_ids: [],
      limitations: [],
    },
  ];
  state.claims = [
    {
      claim_id: "C1",
      statement: "The lecture may teach the verified fact.",
      lecture_use: "slide 1",
      outline_refs: ["1"],
      risk: "normal",
      status: "supported",
      support_observation_ids: ["O1"],
      contradict_observation_ids: [],
      source_ids: ["R1"],
      independence_groups: ["example-primary"],
      primary_source_id: "R1",
      counter_search: "Looked for contrary official guidance.",
      valid_at: "2026-07-24",
      verification_ids: [],
      limitations: [],
    },
  ];
  state.projection.research_md_sha256 = await sha256(
    path.join(fixture.deck, "research.md"),
  );
  await saveState(fixture.statePath, state);
  return state;
}

function codes(result) {
  return new Set(result.diagnostics.map((diagnostic) => diagnostic.code));
}

test("init creates a durable queued ledger for all fourteen planned axes", async () => {
  const fixture = await makeDeck(14, "standard");
  const state = await loadState(fixture.statePath);
  assert.equal(state.axes.length, 14);
  assert.equal(state.attempts.length, 14);
  assert.ok(state.axes.every((axis) => axis.status === "planned"));
  assert.ok(state.attempts.every((attempt) => attempt.status === "queued"));
  await assert.rejects(
    initialize({
      deck: fixture.deck,
      "session-id": "replacement",
      topic: "Replacement",
      axes: JSON.stringify(["one"]),
      axis: [],
    }),
    /refusing to overwrite/,
  );
});

test("a complete deep session validates and persists an embedded ready receipt", async () => {
  const fixture = await makeDeck();
  await completeState(fixture);
  const result = await validate({ state: fixture.statePath, deck: fixture.deck });
  assert.equal(result.ready, true);
  assert.deepEqual(result.diagnostics, []);
  const state = await loadState(fixture.statePath);
  assert.equal(state.convergence.status, "ready");
  assert.equal(state.gates.gate2.status, "ready");
  assert.match(state.gates.gate2.research_digest, /^[a-f0-9]{64}$/);
});

test("a dropped axis remains visible and blocks readiness", async () => {
  const fixture = await makeDeck();
  const state = await completeState(fixture);
  state.axes[2].status = "planned";
  state.attempts[2].status = "queued";
  await saveState(fixture.statePath, state);
  const result = await validate({ state: fixture.statePath, deck: fixture.deck });
  assert.equal(result.ready, false);
  assert.ok(codes(result).has("E_AXIS_NOT_CLOSED"));
  assert.ok(codes(result).has("E_ATTEMPT_NOT_TERMINAL"));
});

test("axis attempts and claim observations must be reciprocally linked", async () => {
  const fixture = await makeDeck();
  const state = await completeState(fixture);
  state.axes[0].attempt_ids = ["T2"];
  state.observations[0].supports_claim_ids = [];
  await saveState(fixture.statePath, state);
  const result = await validate({ state: fixture.statePath, deck: fixture.deck });
  const found = codes(result);
  assert.ok(found.has("E_ATTEMPT_AXIS_MISMATCH"));
  assert.ok(found.has("E_CLAIM_OBSERVATION_LINK"));
});

test("an incomplete closed axis requires an explicit accepted gap", async () => {
  const fixture = await makeDeck();
  const state = await completeState(fixture);
  state.axes[0].blocker = "GAP-A1";
  state.attempts[0].status = "returned_incomplete";
  await saveState(fixture.statePath, state);
  let result = await validate({ state: fixture.statePath, deck: fixture.deck });
  assert.equal(result.ready, false);
  assert.ok(codes(result).has("E_AXIS_UNACCEPTED_GAP"));

  const updated = await loadState(fixture.statePath);
  updated.gates.gate2.accepted_gap_ids = ["GAP-A1"];
  await saveState(fixture.statePath, updated);
  result = await validate({ state: fixture.statePath, deck: fixture.deck });
  assert.equal(result.ready, true);
});

test("open lead and missing expansion audit fail with deterministic codes", async () => {
  const fixture = await makeDeck();
  const state = await completeState(fixture);
  state.leads = [
    {
      lead_id: "L1",
      parent_axis_id: "A1",
      parent_lead_id: null,
      discovered_from: "O1",
      question: "What could refute this?",
      why_it_matters: "Changes the lecture conclusion",
      status: "open",
      resolution: null,
      duplicate_of: null,
      accepted_gap_id: null,
      opened_at: "2026-07-24",
      closed_at: null,
    },
  ];
  state.axes[0].lead_ids = ["L1"];
  state.waves = state.waves.filter((wave) => wave.kind !== "gap_audit");
  await saveState(fixture.statePath, state);
  const result = await validate({ state: fixture.statePath, deck: fixture.deck });
  assert.deepEqual(
    [...codes(result)].filter((code) =>
      ["E_LEAD_OPEN", "E_EXPANSION_AUDITS"].includes(code),
    ).sort(),
    ["E_EXPANSION_AUDITS", "E_LEAD_OPEN"],
  );
});

test("completed initial waves must cover every planned axis", async () => {
  const fixture = await makeDeck();
  const state = await completeState(fixture);
  state.waves.find((wave) => wave.kind === "initial").axis_ids = [];
  await saveState(fixture.statePath, state);
  const result = await validate({ state: fixture.statePath, deck: fixture.deck });
  assert.equal(result.ready, false);
  assert.ok(codes(result).has("E_INITIAL_COVERAGE"));
});

test("unsafe source URLs and local path escapes are rejected", async () => {
  const fixture = await makeDeck();
  const state = await completeState(fixture);
  state.sources[0].url = "http://example.org/primary";
  state.sources[0].local_path = "../secret.md";
  await saveState(fixture.statePath, state);
  const result = await validate({ state: fixture.statePath, deck: fixture.deck });
  assert.ok(codes(result).has("E_SOURCE_URL"));
  assert.ok(codes(result).has("E_PATH_ESCAPE"));
});

test("mutating research inputs invalidates a previously ready Gate 2 receipt", async () => {
  const fixture = await makeDeck();
  await completeState(fixture);
  assert.equal(
    (await validate({ state: fixture.statePath, deck: fixture.deck })).ready,
    true,
  );
  const state = await loadState(fixture.statePath);
  state.axes[0].result_summary = "Changed after validation";
  await saveState(fixture.statePath, state);
  const result = await validate({ state: fixture.statePath, deck: fixture.deck });
  assert.equal(result.ready, false);
  assert.ok(codes(result).has("E_GATE2_STALE"));
  assert.equal((await loadState(fixture.statePath)).gates.gate2.status, "not_ready");
});

test("Gate 2 approval requires the explicit receipt transition", async () => {
  const fixture = await makeDeck();
  await completeState(fixture);
  assert.equal(
    (await validate({ state: fixture.statePath, deck: fixture.deck })).ready,
    true,
  );

  let state = await loadState(fixture.statePath);
  state.gates.gate2.status = "approved";
  state.gates.gate2.approved_at = null;
  await saveState(fixture.statePath, state);
  let result = await validate({ state: fixture.statePath, deck: fixture.deck });
  assert.equal(result.ready, false);
  assert.ok(codes(result).has("E_GATE2_APPROVAL_RECEIPT"));

  state = await loadState(fixture.statePath);
  state.gates.gate2.status = "approved";
  state.gates.gate2.approved_at = "2026-07-24T00:00:00.000Z";
  state.gates.gate2.approval_receipt_sha256 = "0".repeat(64);
  await saveState(fixture.statePath, state);
  result = await validate({ state: fixture.statePath, deck: fixture.deck });
  assert.equal(result.ready, false);
  assert.ok(codes(result).has("E_GATE2_APPROVAL_RECEIPT"));

  state = await loadState(fixture.statePath);
  state.gates.gate2.status = "not_ready";
  await saveState(fixture.statePath, state);
  result = await approveGate2({
    state: fixture.statePath,
    deck: fixture.deck,
  });
  assert.equal(result.ready, true);
  assert.equal(result.approved, true);
  state = await loadState(fixture.statePath);
  assert.equal(state.status, "gate2_approved");
  assert.equal(state.gates.gate2.status, "approved");
  assert.match(state.gates.gate2.approved_at, /^\d{4}-\d{2}-\d{2}T/);
  assert.match(state.gates.gate2.approval_receipt_sha256, /^[a-f0-9]{64}$/);
});

test("high-risk claims require independent primary, counter, and time evidence", async () => {
  const fixture = await makeDeck();
  const state = await completeState(fixture);
  state.claims[0].risk = "high";
  state.claims[0].primary_source_id = null;
  state.claims[0].counter_search = "";
  state.claims[0].valid_at = null;
  await saveState(fixture.statePath, state);
  const result = await validate({ state: fixture.statePath, deck: fixture.deck });
  const found = codes(result);
  for (const code of [
    "E_HIGH_PRIMARY",
    "E_HIGH_OBSERVATION_GROUPS",
    "E_HIGH_SOURCE_DOMAINS",
    "E_HIGH_COUNTER_SEARCH",
    "E_HIGH_VALID_AT",
  ]) {
    assert.ok(found.has(code), code);
  }
});

test("a fourteen-axis ledger resumes without losing queued work", async () => {
  const fixture = await makeDeck(14, "standard");
  let state = await loadState(fixture.statePath);
  for (const [index, axis] of state.axes.entries()) {
    axis.status = "closed";
    axis.result_summary = `Recovered ${axis.axis_id}`;
    state.attempts[index].status = "returned_complete";
    state.attempts[index].started_at = "2026-07-24T00:00:00.000Z";
    state.attempts[index].finished_at = "2026-07-24T00:01:00.000Z";
    state.attempts[index].result_digest = `resume-${index}`;
  }
  state.waves = [
    {
      wave_id: "W1",
      kind: "initial",
      depth: 0,
      axis_ids: state.axes.map((axis) => axis.axis_id),
      lead_ids_opened: [],
      lead_ids_closed: [],
      started_at: "2026-07-24T00:00:00.000Z",
      completed_at: "2026-07-24T00:10:00.000Z",
      new_actionable_leads: 0,
      notes: "Recovered sequentially",
    },
  ];
  await saveState(fixture.statePath, state);
  const result = await validate({ state: fixture.statePath, deck: fixture.deck });
  assert.equal(result.ready, true);
  assert.equal(result.summary.axes_closed, 14);
  state = await loadState(fixture.statePath);
  assert.equal(state.axes.length, 14);
  assert.equal(state.attempts.length, 14);
});
