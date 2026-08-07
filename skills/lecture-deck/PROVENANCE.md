# Clean-Room Provenance

## Scope

Lecture Deck's research session format, command-line validator, tests, and
fixtures are project-owned work. They are independently specified for the
Lecture Deck workflow. No LazyCodex or insane-research source code, prompt
prose, templates, schemas, examples, tests, or other authored expression is
included.

This manifest records the behavioral references used to understand the problem
and the boundary that implementation authors must follow. It is not an
incorporation of those references.

## Recorded behavioral reference

- Repository: `code-yeongyu/lazycodex`
- Commit: `3efc603ac474f5a4f77001641d0b2736dc121e85`
- Source path: `plugins/omo/skills/ulw-research/SKILL.md`
- Source URL:
  <https://github.com/code-yeongyu/lazycodex/blob/3efc603ac474f5a4f77001641d0b2736dc121e85/plugins/omo/skills/ulw-research/SKILL.md>
- Source SHA-256:
  `f2c4a590c161a2dd74a307fd8a626dfe0d4c4b52b4f38afcef37a202ae72a269`
- Attribution path: `plugins/omo/skills/ulw-research/ATTRIBUTION.md`
- Attribution URL:
  <https://github.com/code-yeongyu/lazycodex/blob/3efc603ac474f5a4f77001641d0b2736dc121e85/plugins/omo/skills/ulw-research/ATTRIBUTION.md>
- Attribution SHA-256:
  `27a9ce59d41688c07ff35c92648fb5a53c22726186c6c56bdd90485cec4a213b`
- LazyCodex license path: `LICENSE`
- LazyCodex license SHA-256:
  `b083425948376611de9b92b0aeb7377e604505756ea427e541a34d9b030d4dc1`

The packaged LazyCodex file is generated from a separately published shared
source. That shared publication uses different license terms. It is recorded
only to prevent accidental sourcing: it is not an implementation source for
Lecture Deck.

## Behavioral facts carried into the local specification

The local design may implement these general behaviors in its own structure
and words:

- begin exhaustive research only after explicit user selection;
- persist expected truths, research axes, observations, claims, leads,
  verification receipts, convergence, and citation relationships;
- give every planned axis and lead a durable terminal or unresolved state;
- use executed evidence for claims whose truth depends on runnable behavior;
- require stronger provenance, counter-search, primary support, and temporal
  context before admitting consequential non-code claims;
- synthesize only admitted claims and project their public evidence through
  Lecture Deck's `[R#]` citation contract;
- retain a complete sequential path when optional host capabilities are absent.

These are behavioral requirements, not copied wording or file structures.

## Independent implementation boundary

The project-owned implementation uses:

- `research-state.json` as its canonical state file;
- `scripts/research-session.mjs` as its command-line interface;
- `tests/research-session.test.mjs` for behavior tests and original synthetic
  fixtures.

It must not reproduce upstream artifact filenames, Markdown templates, phase
headings, message markers, worker prompts, tool mappings, report skeletons,
examples, validator code, or test text.

The only upstream-identical identifiers intentionally permitted are short,
generic interoperability labels:

- `intent_id`
- `claim_id`
- `observation_id`
- `observed_at`
- `valid_at`
- `claim_valid_at`
- `last_seen`
- `true`
- `violated`
- `unknown`
- `supported`
- `partial`
- `refuted`
- `unresolved`

Any addition to this allowlist requires an explicit provenance review.

## Author declaration

Authors of the Lecture Deck protocol, state model, validator, tests, and
fixtures must work from this manifest and the local Lecture Deck requirements,
not from upstream prompt or validator text. By contributing those files, the
author declares that the contribution was independently written and contains
no upstream authored expression.

Before release, compare the implementation with a separately obtained copy of
the pinned behavioral reference:

```bash
node scripts/check-provenance.mjs \
  --upstream /absolute/path/to/pinned-ulw-research-SKILL.md \
  references/ultra-research-protocol.md \
  scripts/research-session.mjs \
  tests/research-session.test.mjs
```

The upstream file remains external to this repository.
