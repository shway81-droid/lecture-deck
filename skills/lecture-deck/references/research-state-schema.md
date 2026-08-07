# 리서치 상태 파일 계약 (`research-state.json`)

`research-state.json`은 한 강의 리서치의 기계 판독 가능한 진실 원천이다. 사람이 읽는 결과는 `research.md`에 투영하지만, 축·리드·관찰·주장·출처·검증·수렴 상태는 이 JSON에서 판단한다.

이 파일은 `scripts/research-session.mjs`가 초기화하고 검증한다. 직접 수정해야 할 때도 아래 키와 상태 전이를 지킨다. 알 수 없는 값을 빈 문자열로 속이지 말고 `null`, `unknown`, 또는 명시적인 차단 상태로 남긴다.

## 강의 폴더의 필수 파일

```text
lectures/<slug>/
  brief.md
  outline.md
  research-state.json
  research.md
```

게이트 1과 게이트 2 영수증은 각각 `research-state.json.gates.gate1`, `research-state.json.gates.gate2`에 들어간다. 별도 영수증 파일을 만들지 않는다. 덱 입력이 바뀌면 내장 영수증을 오래된 것으로 판정하고 다시 검증한다.

## 최상위 형태

```json
{
  "schema_version": 1,
  "session_id": "research-...",
  "lecture_slug": "topic-slug",
  "depth": "quick",
  "status": "collecting",
  "created_at": "2026-07-24T00:00:00Z",
  "updated_at": "2026-07-24T00:00:00Z",
  "gates": {
    "gate1": {},
    "gate2": {}
  },
  "capabilities": {},
  "axes": [],
  "attempts": [],
  "waves": [],
  "leads": [],
  "sources": [],
  "observations": [],
  "claims": [],
  "verifications": [],
  "visuals": [],
  "convergence": {},
  "projection": {}
}
```

## 공통 규칙

- 시간은 UTC ISO 8601 문자열로 기록한다.
- ID는 파일 안에서 유일해야 한다.
- 다른 항목을 가리키는 ID는 반드시 실제 항목과 연결돼야 한다.
- 배열 순서는 의미가 아니라 재현 가능한 출력을 위한 정렬 순서다.
- 상태를 뒤로 돌리거나 입력을 바꾸면 `updated_at`과 관련 해시를 갱신한다.
- 게이트 2 영수증이 생긴 뒤 입력이 달라지면 `gates.gate2.status`를 `stale`로 바꾼다.

## 세션 상태

`status`:

- `initialized`
- `planning`
- `collecting`
- `checking`
- `gate2_ready`
- `gate2_approved`
- `paused`
- `blocked`

`depth`:

- `quick`
- `standard`
- `deep`

## `gates.gate1`

필수 키:

- `status`: `approved | stale`
- `brief_path`
- `brief_sha256`
- `outline_path`
- `outline_sha256`
- `outline_revision`
- `approved_at`

현재 파일 해시가 영수증과 다르면 초기화 또는 검증을 거부한다.

## `capabilities`

```json
{
  "orchestration": "sequential",
  "max_parallel": 1,
  "search": "live",
  "fetch": "full",
  "interactive_browser": false,
  "screenshots": false,
  "local_read": true,
  "shell_readonly": true,
  "network": "allowed",
  "workspace_write": "allowed",
  "limitations": []
}
```

허용값:

- `orchestration`: `sequential | subagent | team`
- `search`: `live | indexed | cached | none`
- `fetch`: `full | lossy | none`
- 권한: `allowed | prompt | denied | unknown`

실제 기능보다 높은 값을 기록하면 안 된다.

## `axes`

축은 조회 전에 모두 등록한다.

필수 키:

- `axis_id`
- `question`
- `lecture_need`
- `outline_refs`
- `source_territories`
- `freshness`
- `success_condition`
- `status`
- `attempt_ids`
- `lead_ids`
- `result_summary`
- `blocker`

상태:

- `planned`
- `closed`

축의 실제 실행 상태는 `attempts`에 남긴다. 결과가 부족하거나 접근이 막힌 축도 이유와 미해결 항목을 기록한 뒤에만 `closed`가 될 수 있다. 미해결 축을 게이트 2에서 허용하려면 사용자 수용 또는 범위 조정이 `gates.gate2.accepted_gap_ids`에 묶여야 한다.

`returned_incomplete`, `failed_terminal`, 또는 `blocker`가 있는 닫힌 축은 `accepted_gap_ids`에 해당 `axis_id`나 `blocker`에 적은 공백 ID가 있어야 한다. 다른 축의 완료 시도를 빌려 닫을 수 없으며, `attempt.axis_id`는 그 시도를 참조한 축과 같아야 한다.

## `attempts`

호스트 작업, 에이전트, 순차 조사, 실행 검증을 시작하기 전에 시도를 먼저 기록한다.

필수 키:

- `attempt_id`
- `axis_id`
- `mode`: `sequential | subagent | team | command | browser`
- `status`: `queued | spawned | running | returned_complete | returned_incomplete | failed_retryable | failed_terminal`
- `started_at`
- `finished_at`
- `host_reference`
- `error`
- `result_digest`

동시 실행 한도나 API 실패는 축을 사라지게 하지 않는다. 실패한 시도와 대기 축을 각각 남긴다.

## `waves`

한 번의 논리적 조사 묶음이다. 실제 실행은 병렬 또는 순차일 수 있다.

필수 키:

- `wave_id`
- `kind`: `initial | lead_followup | counter_audit | gap_audit`
- `depth`
- `axis_ids`
- `lead_ids_opened`
- `lead_ids_closed`
- `started_at`
- `completed_at`
- `new_actionable_leads`
- `notes`

다면적 심층 조사는 `counter_audit`와 `gap_audit`가 각각 최소 1개 있어야 한다.

## `leads`

필수 키:

- `lead_id`
- `parent_axis_id`
- `parent_lead_id`
- `discovered_from`
- `question`
- `why_it_matters`
- `status`
- `resolution`
- `duplicate_of`
- `accepted_gap_id`
- `opened_at`
- `closed_at`

상태:

- `open`
- `queued`
- `investigating`
- `investigated_closed`
- `duplicate`
- `dead_end`
- `unresolved`

마지막 네 상태만 종료 상태다. `unresolved`는 증거가 아니며, 게이트 2 준비 전에 `gates.gate2.accepted_gap_ids`에 연결하거나 범위를 줄여야 한다.

## `sources`

최종 출처 ID `R`는 수렴 뒤 주 실행자만 배정한다.

필수 키:

- `source_id`
- `canonical_key`
- `title`
- `publisher`
- `url`
- `local_path`
- `published_or_updated_at`
- `accessed_at`
- `source_type`
- `retrieval_class`
- `primary`
- `limitations`

`canonical_key` 우선순위:

1. DOI·표준 번호·공식 문서 ID
2. 정규화 URL
3. 정규화 상대 경로와 줄 앵커
4. 발행처·날짜·제목의 조합

정렬된 고유 키에 `R1`, `R2`, `R3`을 붙인다. 작업자가 임의로 만든 번호를 그대로 합치지 않는다.

## `observations`

관찰 ID는 `O1`, `O2` 형식을 쓴다.

필수 키:

- `observation_id`
- `source_id`
- `observed_fact`
- `anchor`
- `observed_at`
- `valid_at`
- `evidence_type`
- `retrieval_class`
- `independence_group`
- `observer`
- `supports_claim_ids`
- `contradicts_claim_ids`
- `limitations`

검색 요약만 본 경우 `evidence_type`과 `limitations`에 명시하며, 고위험 주장의 단독 근거로 쓸 수 없다.

## `claims`

주장 ID는 `C1`, `C2` 형식을 쓴다.

필수 키:

- `claim_id`
- `statement`
- `lecture_use`
- `outline_refs`
- `risk`: `normal | high`
- `status`
- `support_observation_ids`
- `contradict_observation_ids`
- `source_ids`
- `independence_groups`
- `primary_source_id`
- `counter_search`
- `valid_at`
- `verification_ids`
- `limitations`

상태:

- `candidate`
- `supported`
- `partial`
- `refuted`
- `unresolved`

게이트 2에서 확정 사실로 제시할 수 있는 값은 `supported`뿐이다. 나머지는 충돌·한계·미확인 섹션에 둔다.

## C/O/R 연결 규칙

```text
C1 주장
 ├─ O1 지지 관찰 ─ R1 공식 문서
 ├─ O2 지지 관찰 ─ R2 원자료
 └─ O3 반박 관찰 ─ R3 독립 분석
```

- `C`가 `supported`이면 지지 관찰과 출처가 최소 1개 이상 있어야 한다.
- `O`의 `source_id`는 존재하는 `R`을 가리켜야 한다.
- `C.source_ids`는 연결된 관찰에서 도출한 출처 집합과 같아야 한다.
- 반박 관찰을 삭제해서 `supported`로 만들 수 없다.
- 슬라이드 `[R#]`와 대본의 `C → R` 표식은 이 연결에서만 생성한다.

## `verifications`

필수 키:

- `verification_id`
- `claim_ids`
- `kind`: `cross_source | counter_search | command | browser | calculation`
- `status`: `confirmed | partial | refuted | inconclusive`
- `command_or_method`
- `environment`
- `stdout_path`
- `stderr_path`
- `observed_at`
- `limitations`

실행이 필요한 동작 주장은 `command` 또는 해당 동작을 직접 관찰한 검증 항목이 없으면 `supported`가 될 수 없다.

## `visuals`

사실을 전달하는 차트·지도·비교표·다이어그램만 기록한다. 장식 이미지는 선택적으로 기록할 수 있다.

필수 키:

- `visual_id`
- `path`
- `kind`
- `factual`
- `claim_ids`
- `observation_ids`
- `source_ids`
- `valid_at`
- `reviewed_by_human`
- `generator`
- `limitations`

`factual: true`이면 C/O/R 연결과 기준일이 필요하다. `generator`가 이미지 생성 도구여도 생성 결과는 증거가 아니다.

## `convergence`

필수 키:

- `status`: `pending | ready | paused`
- `planned_axis_count`
- `closed_axis_count`
- `open_lead_count`
- `terminal_lead_count`
- `expansion_audit_count`
- `high_risk_claim_count`
- `verified_high_risk_claim_count`
- `unresolved_claim_ids`
- `accepted_gap_ids`
- `checked_at`
- `errors`

`ready` 조건:

- 모든 축이 `closed`
- 모든 리드가 종료 상태
- 모든 `unresolved` 리드는 `accepted_gap_ids`에 연결
- 다면적 심층 조사라면 확장 감사 2회 이상
- 고위험 확정 주장 검증 완료
- 참조 무결성과 투영 검증 통과

## `projection`

필수 키:

- `research_md_path`
- `research_md_sha256`
- `outline_delta`
- `slide_claim_map`
- `unresolved_summary`
- `generated_at`

`slide_claim_map`은 슬라이드 번호/제목별 `claim_ids`와 `source_ids`를 기록한다.

## `gates.gate2`

필수 키:

- `status`: `not_ready | ready | approved | stale`
- `validated_at`
- `validator_version`
- `brief_sha256`
- `research_sha256`
- `outline_sha256`
- `research_digest`
- `errors`
- `accepted_gap_ids`
- `approved_at`
- `approval_receipt_sha256`

검증 실패는 정렬된 오류 목록과 현재 입력 해시를 남기고 `not_ready`를 유지한다. 실패 자체가 다음 상태로 전이시키지 않는다.

`status: approved`는 `validate`가 자동으로 만들지 않는다. 검증 결과를 사용자가 명시적으로 승인한 뒤 `approve-gate2` 명령이 현재 `research_digest`, 브리프·리서치·아웃라인 해시와 `approved_at`을 묶어 `approval_receipt_sha256`으로 기록한다. 승인 시각이나 결합 해시가 없고, 영수증 해시가 맞지 않거나 입력이 바뀐 승인 상태는 위조되거나 오래된 영수증으로 거부한다.

## 검증기 출력

`--json` 결과는 다음 키를 제공한다.

- `ok`: 명령과 파일 처리가 성공했는가
- `ready`: 게이트 2 준비 조건을 만족하는가
- `state_path`
- `deck_dir`
- `research_digest`
- `diagnostics`: `{ code, path, message }` 배열
- `summary`
  - `axes_planned`
  - `axes_closed`
  - `leads_total`
  - `leads_open`
  - `waves`
  - `claims`
  - `established_claims`
  - `accepted_gaps`

종료 코드 0은 준비 완료, 1은 의미 검증 실패, 2는 명령·경로·입출력 오류다.
