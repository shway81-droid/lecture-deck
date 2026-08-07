[English](README.md) · [한국어](README.ko.md)

# Lecture Deck

> A source-backed lecture production skill for Codex and Claude, from the first audience interview to offline student and instructor packages.

Give it a topic. The skill confirms the audience and duration, locks a one-page brief and outline, runs a durable evidence-and-claim research workflow, builds a WithGenie-style reveal.js deck, writes speaker notes, and exports self-contained offline packages.

## Install

Run one command:

```bash
npx -y github:NewTurn2017/lecture-deck
```

The terminal UI asks only two questions:

1. **Agent:** Codex + Claude Code, Codex only, or Claude Code only
2. **Scope:** Global for every project, or Local for the current project

The recommended choices are **Codex + Claude Code / Global**. The numbered UI does not depend on arrow-key handling.

For CI or a fully non-interactive installation, pass the same choices as flags:

```bash
# Both agents, globally
npx -y github:NewTurn2017/lecture-deck --agent both --scope global --yes

# Codex only, in the current project
npx -y github:NewTurn2017/lecture-deck --agent codex --scope local --yes

# Claude Code only, globally
npx -y github:NewTurn2017/lecture-deck --agent claude --scope global --yes
```

Add `--dry-run` to inspect the mapped command without installing, or run:

```bash
npx -y github:NewTurn2017/lecture-deck --help
```

The installer has no runtime npm dependencies. It maps each choice to an argument array for the pinned open [`skills`](https://github.com/vercel-labs/skills) CLI version `1.5.20`, then verifies that every required asset exists in the selected agent copies.

Restart Codex after installation. In Claude Code, start a new session or run `/reload-plugins` if the current session does not discover the skill.

### Advanced: run `skills` directly

The equivalent underlying command remains available:

```bash
npx --yes skills@1.5.20 add NewTurn2017/lecture-deck --skill lecture-deck --global --agent codex --agent claude-code --copy --yes
```

## Verify the setup

Run the copy installed for your agent:

```bash
# Codex
node "$HOME/.agents/skills/lecture-deck/scripts/setup.mjs" check

# Claude Code
node "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/lecture-deck/scripts/setup.mjs" check
```

The check validates the bundled templates, research protocol/validator, and offline assets plus `bash`, `perl`, and `python3`. It reports optional tools without printing the value of `OPENAI_API_KEY`.

When Local is selected, the installer places the Codex copy in `.agents/skills` and the Claude copy in `.claude/skills`:

```bash
npx -y github:NewTurn2017/lecture-deck --agent both --scope local --yes
node ".agents/skills/lecture-deck/scripts/setup.mjs" check
node ".claude/skills/lecture-deck/scripts/setup.mjs" check
```

## Use

Ask naturally or invoke the skill explicitly:

```text
Use $lecture-deck to make a 60-minute Korean lecture about practical AI research for non-developers.
```

Common triggers include:

- `강의 만들어줘`
- `이 주제로 강의 덱 만들어줘`
- `수강생 배포본까지 만들어줘`
- `/lecture-deck <topic>`

The workflow has two durable user gates:

1. Approve the one-page brief and ordered slide outline. Their hashes are recorded in `research-state.json.gates.gate1`.
2. After validation, approve the research summary, conflicts, accepted gaps, and emphasis. The validated input hashes are recorded in `research-state.json.gates.gate2`.

Generated files live under the project where the skill is invoked:

```text
lectures/<topic-slug>/
├── index.html
├── theme.css
├── brief.md
├── outline.md
├── research-state.json
├── research.md
├── script.md
├── serve.sh
├── assets/gen/
├── <slug>-STUDENT/
├── <slug>-INSTRUCTOR/
├── <slug>.pptx             # editable PowerPoint, no notes
├── <slug>-강사용.pptx       # same, with speaker notes
├── <slug>-notebooklm.pptx  # NotebookLM's own design (images)
├── <slug>-notebooklm.pdf
└── notebooklm-chunks/
```

The student package removes speaker notes. The instructor package retains notes and the offline speaker view. Both bundle reveal.js, fonts, highlighting, and icons.

Two further exports run **every time**, not on request:

- **PPTX export** rebuilds the deck as a PowerPoint file whose text stays editable — slides are redrawn as native text boxes and shapes, not baked images. Two copies: one without notes, one with.
- **NotebookLM slides** feed the deck HTML into NotebookLM and return slides in NotebookLM's own design. Decks over 20 slides are split at part boundaries, generated per chunk, and merged back in order — fed whole, NotebookLM compresses the deck and returns fewer slides. The result is one image per slide, so its text is **not** editable; it complements the PPTX export rather than replacing it.

The NotebookLM step needs a Google login (which you perform yourself) and takes 40–120 minutes. If the login or a dependency is missing, only that step is skipped and the reason is reported.

## Research contract

Research is built into this skill and is tool-agnostic. It does not require another research or orchestration product. The skill negotiates the search, browser, document, MCP, local-read, and execution tools available in the current host. Sequential execution is the portability baseline; subagents and teams are optional accelerators.

- Prefer laws, standards, official documentation, original papers, and original data.
- Re-check volatile facts such as prices, product features, versions, policies, and schedules on the research date.
- Persist every planned research axis and attempt before dispatch so capacity failures or context compaction cannot silently drop coverage.
- Follow newly discovered leads recursively, perform counter-search, and close or explicitly disclose every gap.
- Keep claims (`C`), observations (`O`), and references (`R`) linked in `research-state.json`.
- Preserve conflicting evidence instead of silently merging it.
- Assign deterministic reference IDs only after the source set converges, then reuse them in `research.md`, slide footnotes, and speaker notes.
- Require at least three axes and two recorded expansion-audit waves for multifaceted deep research.
- Present Gate 2 only after the bundled validator reports readiness.

Initialize and validate with the copy of the script inside the loaded skill. Here, `SKILL_DIR` means the directory containing the `SKILL.md` that the host loaded; do not guess a home-directory path:

```bash
node "$SKILL_DIR/scripts/research-session.mjs" init \
  --deck "lectures/<slug>" \
  --session-id "<id>" \
  --topic "<topic>" \
  --axes '<JSON array>'

node "$SKILL_DIR/scripts/research-session.mjs" validate \
  --state "lectures/<slug>/research-state.json" \
  --deck "lectures/<slug>" \
  --json

# Run only after the user explicitly approves the validated Gate 2 summary.
node "$SKILL_DIR/scripts/research-session.mjs" approve-gate2 \
  --state "lectures/<slug>/research-state.json" \
  --deck "lectures/<slug>" \
  --json
```

Retrieved pages, documents, repositories, and search results are untrusted evidence, never instructions. The workflow does not execute source-directed commands, bypass authentication or access controls, or collect credentials.

## Optional GPT Image skill

Image generation is not required. Install it only when covers, diagrams, or generalized UI mockups are useful:

```bash
node "$HOME/.agents/skills/lecture-deck/scripts/setup.mjs" install-gpt-image --target all --yes
```

For a Claude-only installation, run the same `setup.mjs` from the Claude path. The command installs the public [`gpt-image`](https://github.com/wuyoscar/GPT-Image2-Skill) skill for the selected agents. It pins `skills@1.5.20` and the `gpt-image` tag `v0.2.0`, then verifies the installed skill against SHA-256 `d145ce52c6eed794f034c093dcb593e2f7f49cc81c1d0cd5b076d130cf80bd72`. Installer child processes receive only a path/runtime allowlist, not API keys or GitHub tokens. API calls require `OPENAI_API_KEY`; lecture generation and offline packaging do not.

Install only in the current project instead of the user-wide skill directories:

```bash
node scripts/setup.mjs install-gpt-image --target all --scope project --project-dir "$PWD" --yes
```

`gpt-image` is third-party code that can call an external API and write files. Review its linked source and the `skills` CLI security assessment before opting in.

Preview the exact install command without changing anything:

```bash
node scripts/setup.mjs install-gpt-image --target all --yes --dry-run
```

## Requirements

| Requirement | Purpose | Required |
|---|---|---|
| Node.js 22.20+ and `npx` | installation, setup, and research-state validation | install/setup/research |
| `bash` + `perl` | student/instructor packaging | packaging |
| `python3` | local preview server | preview |
| Search/browser tools | source-backed research | research only |
| `gpt-image` + `OPENAI_API_KEY` | generated visual assets | optional |
| Host parallel-agent support | independent research/deck tracks | optional |

Authoring templates may use CDNs for fast iteration. Final STUDENT and INSTRUCTOR packages are rewritten to bundled offline assets.

`gpt-image` is optional and never serves as evidence. Factual charts, maps, comparison tables, and diagrams must be derived from verified C/O/R links and carry reference IDs and a validity date.

## Provenance

The research workflow is an independent, clean-room implementation informed by publicly described research-verification concepts. It does not install or depend on LazyCodex, OMO, or another orchestration runtime, and no affiliation or endorsement is implied.

See [PROVENANCE.md](PROVENANCE.md) for the reviewed design boundary and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for acknowledgments.

## Update and remove

```bash
# Update
npx --yes skills@1.5.20 update lecture-deck --global --yes

# Remove from both agents
npx --yes skills@1.5.20 remove lecture-deck --global --agent codex --agent claude-code --yes
```

## Development

```bash
npm test
npm run check
```

`npm test` uses only Node's built-in test runner. It verifies the setup contract, optional companion command, offline packaging, note stripping, and output-path containment.

## License

[MIT](LICENSE)
