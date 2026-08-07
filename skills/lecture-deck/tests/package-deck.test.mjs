import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  access,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const packager = path.join(repoRoot, "assets", "package-deck.sh");

async function makeDeckFixture() {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "lecture-deck-package-"));
  const source = path.join(tempRoot, "source");
  const output = path.join(tempRoot, "output");
  await mkdir(source, { recursive: true });
  await mkdir(output, { recursive: true });
  await writeFile(
    path.join(source, "index.html"),
    `<!doctype html>
<meta name="referrer" content="no-referrer">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/dist/reveal.css">
<script src="https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/dist/reveal.js"></script>
<script src="https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/plugin/notes/notes.js"></script><!-- ld:slide {"id":"S001","title":"테스트","claims":[{"id":"C001","mode":"established","sources":["R1"]}]} -->
<section data-notes="숨은 노트"><h2>테스트 <a class="citation" data-source-id="R1" href="https://example.com/source">[R1]</a></h2><aside class="notes">강사 노트
Claim C001; evidence R1</aside></section>
<!-- ld:end S001 -->
<script>Reveal.initialize({ plugins: [ RevealNotes ] });</script>
`,
  );
  await writeFile(
    path.join(source, "theme.css"),
    '@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css");\n',
  );
  await writeFile(
    path.join(source, "SOURCES.html"),
    '<!doctype html><meta name="referrer" content="no-referrer"><a href="https://example.com/source" rel="noreferrer">[R1] 공개 출처</a>\n',
  );
  await writeFile(
    path.join(source, "script.md"),
    "## 슬라이드 1 — 테스트\n강사 노트\nClaim C001; evidence R1\n",
  );
  await writeFile(
    path.join(source, "research.md"),
    "# Research\n\n[R1] 공개 출처\n",
  );
  await writeFile(
    path.join(source, "citation-map.json"),
    '{"slides":{"S001":{"C001":["R1"]}}}\n',
  );
  return { tempRoot, source, output };
}

test("packager keeps public citations and separates student/instructor audit material", async () => {
  const fixture = await makeDeckFixture();
  const result = spawnSync(
    "bash",
    [packager, fixture.source, "--name", "sample", "--out", fixture.output],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);

  const student = await readFile(
    path.join(fixture.output, "sample-STUDENT", "index.html"),
    "utf8",
  );
  const instructor = await readFile(
    path.join(fixture.output, "sample-INSTRUCTOR", "index.html"),
    "utf8",
  );

  assert.doesNotMatch(
    student,
    /<aside|data-notes|cdn\.jsdelivr|RevealNotes|ld:slide|ld:end|Claim C001|data-claims/,
  );
  assert.match(student, /data-source-id="R1"[^>]*>\[R1\]/);
  assert.match(instructor, /class="notes"/);
  assert.match(instructor, /ld:slide|Claim C001; evidence R1/);
  await access(path.join(fixture.output, "sample-STUDENT", "SOURCES.html"));
  await access(path.join(fixture.output, "sample-INSTRUCTOR", "SOURCES.html"));
  await access(path.join(fixture.output, "sample-INSTRUCTOR", "script.md"));
  await access(path.join(fixture.output, "sample-INSTRUCTOR", "research.md"));
  await access(path.join(fixture.output, "sample-INSTRUCTOR", "citation-map.json"));
  await assert.rejects(
    access(path.join(fixture.output, "sample-STUDENT", "script.md")),
  );
  await assert.rejects(
    access(path.join(fixture.output, "sample-STUDENT", "research.md")),
  );
  await assert.rejects(
    access(path.join(fixture.output, "sample-STUDENT", "citation-map.json")),
  );
  await assert.rejects(
    access(
      path.join(
        fixture.output,
        "sample-STUDENT",
        "vendor",
        "reveal",
        "notes",
      ),
    ),
  );
  await access(
    path.join(
      fixture.output,
      "sample-STUDENT",
      "vendor",
      "reveal",
      "reveal.js",
    ),
  );
});

test("packager rejects a name that escapes the output directory", async () => {
  const fixture = await makeDeckFixture();
  const escaped = path.join(fixture.tempRoot, "escape-STUDENT");
  const result = spawnSync(
    "bash",
    [
      packager,
      fixture.source,
      "--name",
      "../escape",
      "--out",
      fixture.output,
      "--student-only",
    ],
    { encoding: "utf8" },
  );

  assert.notEqual(result.status, 0);
  await assert.rejects(access(escaped));
});

test("packager rejects missing inputs and remote runtime assets without replacing output", async () => {
  const missingFixture = await makeDeckFixture();
  await unlink(path.join(missingFixture.source, "theme.css"));
  const missingResult = spawnSync(
    "bash",
    [
      packager,
      missingFixture.source,
      "--name",
      "missing",
      "--out",
      missingFixture.output,
      "--student-only",
    ],
    { encoding: "utf8" },
  );
  assert.notEqual(missingResult.status, 0);
  await assert.rejects(
    access(path.join(missingFixture.output, "missing-STUDENT")),
  );

  const unsafeFixture = await makeDeckFixture();
  const existing = path.join(unsafeFixture.output, "sample-STUDENT");
  await mkdir(existing);
  await writeFile(path.join(existing, "index.html"), "previous complete package\n");
  await writeFile(
    path.join(unsafeFixture.source, "index.html"),
    `${await readFile(path.join(unsafeFixture.source, "index.html"), "utf8")}
<script src="https://assets.example.invalid/runtime.js"></script>
`,
  );
  const unsafeResult = spawnSync(
    "bash",
    [
      packager,
      unsafeFixture.source,
      "--name",
      "sample",
      "--out",
      unsafeFixture.output,
      "--student-only",
    ],
    { encoding: "utf8" },
  );
  assert.notEqual(unsafeResult.status, 0);
  assert.equal(
    await readFile(path.join(existing, "index.html"), "utf8"),
    "previous complete package\n",
  );
  assert.deepEqual(
    (await readdir(unsafeFixture.output)).filter((name) =>
      name.startsWith(".sample.package."),
    ),
    [],
  );
});

test("authoring templates expose referrer and citation primitives", async () => {
  const template = await readFile(
    path.join(repoRoot, "assets", "template", "index.html"),
    "utf8",
  );
  const theme = await readFile(
    path.join(repoRoot, "assets", "template", "theme.css"),
    "utf8",
  );
  const layouts = await readFile(
    path.join(repoRoot, "assets", "layouts.md"),
    "utf8",
  );
  const scriptFormat = await readFile(
    path.join(repoRoot, "references", "script-format.md"),
    "utf8",
  );

  assert.match(template, /<meta name="referrer" content="no-referrer"/);
  assert.match(theme, /\.reveal \.citation\s*\{/);
  assert.match(theme, /\.source-list\s*\{/);
  assert.match(layouts, /data-source-id="R1"[\s\S]*referrerpolicy="no-referrer"/);
  assert.match(layouts, /## 9\. references — 공개 출처 부록/);
  assert.match(scriptFormat, /<!-- ld:slide \{/);
  assert.match(scriptFormat, /<!-- ld:end S001 -->/);
  assert.match(scriptFormat, /Claim C001; evidence R1, R2/);
});
