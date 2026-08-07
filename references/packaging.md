# 배포 패키징 가이드 (수강생 배포본 + 강사 교안)

강의 덱은 **두 가지 형태**로 산다.

| 형태 | 무엇 | 누가 | 노트 | 의존 |
|---|---|---|---|---|
| **소스(저작용)** | `lectures/<slug>/index.html` 등 | 나(강사) | `<aside class="notes">`로 포함 | CDN (reveal·폰트·lucide) |
| **STUDENT(수강생 배포본)** | `<name>-STUDENT/` | 수강생 | **0개(도려냄)** | 전부 번들, 오프라인 |
| **INSTRUCTOR(강사 교안)** | `<name>-INSTRUCTOR/` | 나(발표) | **포함** + 스피커뷰(S키) | 전부 번들, 오프라인 |

## 왜 이렇게 나누나

- **저작은 CDN, 배포는 오프라인.** 저작 중엔 CDN이 빠르고 편하다. 하지만 강의장 와이파이는 못 믿는다 — 배포본은 폰트·이미지·라이브러리를 전부 폴더 안에 넣어 인터넷 없이 더블클릭 한 번으로 열리게 한다.
- **수강생에게 대사(노트)를 주지 않는다.** 발표자 노트는 강사의 진행 큐다. STUDENT는 `<aside class="notes">`를 전부 도려낸다.
- **교안은 노트를 남기고 스피커뷰가 오프라인에서도 켜지게** reveal `notes` 플러그인을 번들한다.

## 자동화: `package-deck.sh`

수작업 복사는 **빠뜨리기 쉽다**(실제로 손으로 만든 패키지는 `theme.css`의 폰트 `@import`가 CDN인 채로 남아 "오프라인"이 거짓이었다). 스크립트가 이 변환을 매번 똑같이 한다.

```bash
# SKILL_DIR = 현재 읽은 lecture-deck/SKILL.md가 들어 있는 폴더
# 기본: STUDENT + INSTRUCTOR 둘 다, 소스 폴더 안에 생성
bash "$SKILL_DIR/assets/package-deck.sh" \
  "lectures/<slug>" --title "강의 제목"

# 옵션
#   --name <slug>     패키지 이름 접두사 (기본: 소스 폴더 이름)
#   --title "<제목>"  READ-ME 상단 제목
#   --student-only    수강생본만
#   --out <dir>       만들 위치 (기본: 소스 폴더 안)
```

### 스크립트가 하는 변환

소스 한 벌에서 두 패키지를 찍어낸다. 핵심 변환:

1. **CDN → 번들 경로** (`index.html`):
   - `cdn.jsdelivr.net/npm/reveal.js@*/dist/` → `vendor/reveal/`
   - `.../plugin/highlight/` → `vendor/reveal/highlight/`
   - `.../plugin/notes/` → `vendor/reveal/notes/`
   - `unpkg.com/lucide@*` (또는 jsdelivr) → `vendor/lucide.min.js`
   - head의 pretendard `<link>`는 제거(폰트는 theme.css가 담당)
2. **폰트 CDN @import → 번들** (`theme.css`): pretendard·Instrument Serif·JetBrains Mono의 `@import`를 `vendor/fonts/*.css`로. ← **수작업의 단골 버그를 교정하는 지점.**
3. **STUDENT만**: `<aside class="notes">…</aside>` 전부 삭제 · `notes.js` 로드 제거 · `plugins`에서 `RevealNotes` 제거.
4. **INSTRUCTOR만**: 노트 유지 · `notes.js`를 `vendor/reveal/notes/`로 · `RevealNotes` 유지.
5. **런처 + 안내**: `START-Mac.command`(`open index.html`), `START-Windows.bat`(`start index.html`), `READ-ME.txt`(여는 법·조작·오프라인 고지). 교안 READ-ME에는 스피커뷰(S키) 한 줄 추가.
6. **무결성 점검**: STUDENT에 노트나 CDN 참조가 남으면 경고를 찍는다.

### 번들 자산은 어디서 오나

스킬에 **고정 번들**된 `assets/vendor/`(reveal 4.6.1 + Pretendard·JetBrains Mono·Instrument Serif woff2 + lucide + notes 플러그인, ~3.8M)을 복사한다. 검증된 한 벌이라 인터넷·구글폰트 수집 없이 폰트까지 "지금 스타일" 그대로 오프라인 재현된다. 강의별로 색·폰트를 바꿨다면 그 강의의 `vendor/`를 따로 챙기거나 스크립트의 폰트 치환 규칙을 손본다.

## 워크플로 안에서 (항상)

덱이 완성되면(6단계 확인 후) **항상** 두 패키지를 만든다. 소스 수정 → 패키지는 자동 반영 안 되므로 **노트까지 확정한 마지막에 한 번** 재빌드한다. 리허설은 소스 `index.html`로, 배포본은 빌드 산출물로.

```bash
bash "$SKILL_DIR/assets/package-deck.sh" "lectures/<slug>" --title "<제목>"
# → lectures/<slug>/<slug>-STUDENT/  ,  lectures/<slug>/<slug>-INSTRUCTOR/
```

빌드 후 **각 폴더의 index.html을 실제로 한 번 열어** 폰트·이미지·아이콘이 뜨는지 눈으로 확인한다(스크립트가 마지막에 같은 안내를 출력한다).

## 수작업 폴백 (스크립트를 못 쓸 때)

bash/perl이 없으면 위 1~6을 손으로 한다. 특히 **2번(폰트 @import)을 빠뜨리지 말 것** — 빠지면 오프라인에서 폰트가 시스템 기본으로 떨어져 분위기가 깨진다.
