#!/usr/bin/env node
/**
 * 덱이 쓴 CSS 클래스가 그 폴더의 theme.css 에 다 정의돼 있는지 본다.
 *
 *   node scripts/check-classes.mjs lectures/<slug>
 *
 * layouts.md 에는 있는데 theme.css 에는 없는 클래스가 있다(image-slot 등).
 * 그런 걸 쓰면 슬라이드가 무스타일로 나오는데 브라우저는 아무 말도 안 한다.
 * 조립 직후에 이걸 돌려서 잡는다.
 *
 * 종료 코드: 0 = 이상 없음, 1 = 미정의 클래스 있음, 2 = 사용법 오류
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

// 스타일이 없어도 되는 것 — reveal 이 쓰거나 의도적으로 비워 둔 것
const ALLOW = new Set([
  "notes", "reveal", "slides", "image-slot",
  "fragment", "current-fragment", "present", "past", "future", "stack",
]);

async function main() {
  const deck = process.argv[2];
  if (!deck) {
    console.error("사용법: node check-classes.mjs <강의폴더>");
    process.exitCode = 2;
    return;
  }
  const htmlPath = path.join(deck, "index.html");
  const cssPath = path.join(deck, "theme.css");
  let html, css;
  try {
    [html, css] = await Promise.all([
      readFile(htmlPath, "utf8"),
      readFile(cssPath, "utf8"),
    ]);
  } catch (error) {
    console.error(`읽지 못했다: ${error.message}`);
    process.exitCode = 2;
    return;
  }

  const used = new Set();
  for (const m of html.matchAll(/class="([^"]+)"/g)) {
    for (const c of m[1].split(/\s+/)) {
      if (c && !c.startsWith("language-")) used.add(c);
    }
  }

  const missing = [...used]
    .filter((c) => !ALLOW.has(c))
    .filter((c) => !new RegExp(`\\.${c.replace(/[-]/g, "\\-")}(?![a-zA-Z0-9_-])`).test(css))
    .sort();

  const slides = (html.match(/<section/g) || []).length;
  const notes = (html.match(/<aside class="notes">/g) || []).length;

  console.log(`슬라이드 ${slides}장 · 노트 ${notes}개 · 사용 클래스 ${used.size}종`);
  if (slides !== notes) {
    console.log(`  !! 노트가 없는 슬라이드가 ${slides - notes}장 있다`);
  }
  if (missing.length) {
    console.log(`  !! theme.css 에 없는 클래스 ${missing.length}개: ${missing.join(", ")}`);
    console.log("     layouts.md 스니펫을 그대로 쓰면 여기 걸린다. 실재하는 컴포넌트로 바꾼다.");
    process.exitCode = 1;
    return;
  }
  console.log("  미정의 클래스 없음");
}

await main();
