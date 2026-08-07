# Research — NotebookLM(현 Gemini Notebook)으로 수업과 업무 자동화하기

조사일: 2026-07-27
선택 깊이: 심층 리서치
실행 방식: 병렬 에이전트 6개(최초 조사) + 감사 2회(반례·누락)
검색/원문 범위: 웹 검색 live, 원문 가져오기 full(일부 JS 렌더링 페이지는 lossy). 로그인이 필요한 화면은 접근하지 않았고 실제 앱 UI는 검증하지 못했다. 모든 제품 사실은 "2026-07-27 접근 시점의 공식 문서"를 기준으로만 유효하다.

## 핵심 발견

1. **제품명이 바뀌었다.** 2026년 7월 16일, 강의 준비 11일 전에 NotebookLM이 **Gemini Notebook(제미나이 노트북)**으로 개명됐다. 제품과 데이터, 주소는 그대로다. [C1] [R1] [R27] [R9]
2. **접속 주소는 그대로 notebooklm.google.com이다.** 개명에 따른 도메인 이전이나 리디렉션이 없다. [C2] [R1] [R9] [R4]
3. **Gemini 앱 안의 노트북에서는 스튜디오 산출물을 만들 수 없다.** 오디오·동영상 오버뷰, 인포그래픽, 슬라이드는 독립 사이트에서만 된다. 실습에서 "버튼이 안 보여요"의 주된 원인이 될 것이다. [C3] [R23]
4. **Google for Education이 교사용 공식 프롬프트 가이드를 이미 제공한다.** 2026년 7월판 129장 덱에 Gemini Notebook 전용 교사 프롬프트와 PARTS 프레임워크가 들어 있다. 프롬프트를 새로 창작할 필요가 없다. [C4] [C5] [R4]
5. **학교 계정과 개인 Gmail 계정의 데이터 취급이 다르다.** Workspace for Education 전 에디션은 피드백을 보내도 인적 검토와 모델 학습에 쓰이지 않는다. 개인 계정은 좋아요·싫어요를 누르는 순간 업로드한 소스까지 사람 검토 대상이 되고 최대 3년 보관된다. [C11] [C12] [R5] [R25] [R24]
6. **HWP는 지금도 지원되지 않고 Drive 경유 우회로도 없다.** 한국 교사 실습 설계에 직접 영향을 준다. [C15] [R13]
7. **노트북 복제 기능이 없다.** "템플릿으로 재사용"을 복제 기능으로 설명하면 틀린다. [C16] [R16]
8. **한국어 오디오 개요는 되지만 길이 조절과 대화형 모드는 영어 전용이다.** 동영상도 Explainer만 한국어이고 Cinematic과 Short은 영어 전용에 만 18세 이상이다. [C17] [C18] [R11] [R3] [R20] [R2]
9. **"AI로 학생부 쓰면 안 된다"는 언론 프레임은 부정확하다.** 규범은 "AI 생성물을 그대로 입력하는 행위 금지, 윤문 보조는 최종 검증 조건부 허용"이다. [C20] [R29]
10. **예고됐던 교육부·과기정통부 공동 AI 활용 가이드라인은 2026-07-27 현재 발간을 확인하지 못했다.** 실제 적용 중인 규범은 「2026학년도 학교생활기록부 기재요령」과 「수행평가 시 AI 활용 관리 방안」이다. [C22] [R38] [R29]

## 조사 축과 파동

- 축 A1 화면 구성과 소스 규칙: 완료
- 축 A2 스튜디오 산출물: 완료
- 축 A3 요금제와 한도: 완료 (Google AI Plus 가격은 수용된 공백 G1)
- 축 A4 개인정보·저작권·학교 정책: 완료 (교육부 후속 가이드라인 발간 여부는 수용된 공백 G3)
- 축 A5 공유·재사용·실패 지점: 완료
- 축 A6 한국어 지원: 완료 (YouTube 실습 소재는 수용된 공백 G2)
- 최초 조사: 1회 (6개 축 병렬)
- 확장 감사: 2회 (반례 감사 1회, 누락 감사 1회)
- 발견 리드 13 / 종료 리드 13 / 남은 리드 0. 그중 unresolved 5건은 수용된 공백 G1~G5에 연결했다.

## 트랙별 메모

### 트랙 1: 제품 정체성과 접속 경로

개명은 blog.google과 Workspace Updates 두 채널에서 같은 날 공지됐고 한국어 도움말도 이미 전환을 마쳤다. [C1] [R1] [R27] [R9]
주소는 notebooklm.google.com이 정규 주소로 유지된다. notebook.google.com은 같은 곳으로 가는 별칭이다. [C2] [R1] [R9]
접근 경로가 세 갈래로 갈린다. 독립 사이트는 전 기능, Gemini 웹 앱 안의 노트북은 소스 관리와 채팅만, Gemini 모바일 앱은 제약이 더 크다. [C3] [R23]
반대 근거: 개명이 계정별로 순차 적용되어 수강생마다 다른 이름을 볼 가능성은 공식 문서로 확인하지 못했다. 개명 11일이 지났고 한국어 문서가 전환을 마쳤으므로 위험은 낮다고 판단한다.

### 트랙 2: 화면과 산출물

화면은 소스·채팅·스튜디오 3개 패널이고 명칭도 유지된다. [C6] [R10]
지원 소스는 오디오, 문서(DOCX·TXT·MD·PDF·CSV·PPTX·ePub), 이미지, Google Drive 파일(문서, 슬라이드 100장, 시트 10만 토큰), 웹 URL, 공개 YouTube, 붙여넣기 텍스트, Gemini 대화다. [C7] [R13]
인용은 마우스를 올리면 인용문 전체가 뜨고 누르면 원문 위치로 이동한다. [C8] [R10]
스튜디오 산출물은 메모, AI 오디오 오버뷰, AI 동영상 오버뷰, 마인드맵, 보고서, 데이터 테이블, 플래시카드, 퀴즈, 슬라이드 자료, 인포그래픽이다. [C9] [R10] [R21] [R22]
학습 가이드·브리핑 문서·FAQ는 사라진 게 아니라 보고서(Reports)의 프리셋으로 들어갔다. 반면 타임라인은 프리셋에서 빠졌다. 2025년 9월 "FAQ와 타임라인이 사라졌다"는 보도가 있었으나 현행 공식 문서는 FAQ를 프리셋으로 다시 명시한다. 그 보도를 그대로 인용하면 오류가 된다. [C10] [R10]
답변은 메모로 저장할 수 있고 메모를 다시 소스로 변환할 수 있다. 노트북당 메모 1,000개까지다. 모바일 앱에서는 메모 생성이 안 된다. [C13] [C14] [R15] [R17]

### 트랙 3: 학교 계정과 개인정보

Workspace for Education 전 에디션에서 Gemini Notebook은 무상 핵심 서비스이고 데이터는 인적 검토를 거치지 않으며 모델 학습에 쓰이지 않는다. COPPA와 FERPA 준수를 명시한다. [C11] [R5] [R25]
개인 계정은 다르다. 좋아요나 싫어요를 누르면 프롬프트, 맞춤설정, 소스, 업로드, 출력이 수집되고 전문 인적 검토자의 검토를 거치며 최대 3년 보관된다. Google 스스로 "의견에 기밀 정보나 민감한 정보를 포함하지 마세요"라고 쓴다. [C12] [R24]
적용 조건: 이 보호는 "학교 계정이면 무조건"이 아니다. Business Base, Essentials Starter, Workspace Individual처럼 부가 서비스로만 제공되는 에디션은 범위 밖이고 하위 등급 문구는 "피드백을 제공하지 않는 한"이라는 한정어를 단다. 한국 교사가 주로 쓰는 Education Fundamentals는 별도 근거 2건으로 보호 대상임을 확정했다. [C11] [R19] [R5] [R25]
조직의 데이터 리전 설정은 Gemini Notebook에서 처리되고 캐시되는 데이터에 적용되지 않는다. [C21] [R6]
연령: 한국에서 개인 Google 계정 최소 연령은 만 14세다. 흔히 인용되는 13세는 미국 기준이다. Workspace for Education 계정은 전 연령 가능하되 18세 미만에는 더 엄격한 콘텐츠 정책과 일부 기능 제한이 붙는다. [C19] [R8] [R5]
반대 근거: 정책은 실제로 뒤집힌 적이 있다. 2025년 4월 공지에서 NotebookLM은 18세 이상이었는데 2025년 8월에 13세 이상으로 바뀌었다. 수업 직전 재확인이 원칙이다. [R25]

### 트랙 4: 한국 교육 규범

「2026학년도 학교생활기록부 기재요령」이 이 강의에서 가장 구속력 있는 자료다. 금지 행위는 "AI를 활용하여 생성한 자료를 서술형 항목에 그대로 입력하는 행위"이고 바로 뒤에 "윤문 등을 위한 보조 수단으로 도움을 받을 경우 최종 입력 전 허위 또는 과장 기재 여부와 기재요령 준수 여부를 철저히 확인해야 함"이라는 단서가 붙는다. 전면 금지가 아니라 조건부 허용이다. [C20] [R29]
「수행평가 시 AI 활용 관리 방안」은 "AI 입력창에 개인 식별 정보를 입력하지 않도록 지도"하고 "파일 내용 및 파일 속성(메타데이터)에 학생의 학번이나 이름 등이 포함되지 않도록 유의"하라고 명시한다. 업로드 실무에 그대로 적용된다. [C23] [R38]
개인정보보호위원회는 2026년 5월 19일 「생성형 AI 서비스 이용자를 위한 개인정보 보호 가이드」를 발간했다. 구성은 8대 핵심이슈이며 정책브리핑 카드뉴스로 6개 항목의 실천수칙을 확보했다. [C24] [R39] [R33]
개인정보 보호법 제22조의2는 만 14세 미만 아동의 개인정보 처리에 법정대리인 동의를 요구한다. 제28조의8은 국외 이전을 원칙 금지하고 예외 요건을 둔다. [C25] [R34]
저작권법 제25조 제3항은 수업 목적으로 공표된 저작물의 일부분을 이용할 수 있게 하고 전부 이용은 부득이한 경우로 한정한다. [C26] [R35]

### 트랙 5: 한국어와 실패 지점

한국어는 출력 언어 80여 개에 포함되고 오디오 개요도 2025년 4월 30일부터 한국어로 생성된다. [C17] [R11] [R2] [R14]
그러나 길이 조절(짧게·기본·길게)과 대화형 모드는 영어 전용이다. 동영상은 Explainer만 한국어이고 Cinematic과 Short은 영어 전용에 만 18세 이상이다. [C18] [R11] [R20] [R3]
HWP와 HWPX는 지원 형식 목록에 없고 Google Drive가 HWP를 Docs로 변환해 주지도 않는다. PDF나 DOCX로 변환해 올려야 하며 표와 각주가 깨질 수 있다. [C15] [R13]
Google Drive의 Docs·Sheets·Slides는 2026년 5월 26일부터 자동 동기화된다. 로컬 PDF, 웹 URL, YouTube, 붙여넣기 텍스트는 추가 시점 스냅샷으로 고정된다. [C27] [R26] [R13]
공유 권한은 보기 전용과 편집자 2종이고 편집자는 재공유 권한까지 가진다. 채팅 뷰 링크는 표시만 숨길 뿐 기저 접근권을 회수하지 않으므로 보안 조치가 아니다. 공개 공유는 개인 계정 전용이며 Workspace와 Education은 같은 도메인 안에서만 공유된다. [C28] [C29] [R10] [R18]
YouTube 소스는 공개이면서 자막이 있어야 하고 복사 방지 PDF는 가져올 수 없다. [C30] [R13] [R16]
Google Workspace 상태 대시보드에 NotebookLM 장애 이력이 남아 있다. 2025년 9월 11일 산출물 생성 실패 4시간 23분, 2026년 5월 19일 유료 등급이 일시적으로 무료 등급으로 떨어진 사고 5시간 35분. 실습 중 안 될 때 먼저 확인할 곳이다. [C31] [R30]

### 트랙 6: 실습용 공통 예제 파일

공공누리 제1유형은 상업적 이용과 변형을 모두 허용하고 출처표시만 요구한다. 교육부 보도자료 페이지의 제1유형 배지는 HTML 소스 수준에서 확인했다. [C32] [R31] [R38]
확정한 5종은 2026년 교육부 업무계획(PDF), 2025년 교육기본통계 조사 결과(HWPX), 「데이터로 읽는 우리 교육」 제5호(PDF), 정책브리핑 기사(웹 URL), 학교알리미 공개용데이터(CSV)다. [C33] [R37] [R36] [R32] [R33] [R28]
YouTube는 공공누리 제1유형과 자막을 동시에 만족하는 영상을 찾지 못했다. 수용된 공백 G2로 처리하고 실습에서는 수강생 본인이 녹음한 수업 음성을 쓰도록 설계한다.

## 검증된 고위험 주장

- 개명과 접속 주소 [C1] [C2]: blog.google, Workspace Updates, 공식 도움말 3개 호스트 교차 확인. 반례 검색에서 기능 중단이나 도메인 이전 근거는 나오지 않았다. 적용 시점 2026-07-16.
- 학교 계정 데이터 보호 [C11]: 관리자 문서, 개인정보 고지, Workspace Updates 3개 호스트 교차 확인. 반례 감사에서 "모든 Workspace 계정"이라는 일반화는 부분 반증됐다. 에디션 등급에 따라 갈리며 Education 계열만 확정했다.
- 연령 요건 [C19]: Google 계정 연령 요건 문서에서 대한민국 14세를 직접 확인하고 Education 전 연령 조항을 관리자 문서로 교차 확인했다.
- 한국어 오디오 개요 지원 [C17], 동영상 개요 언어·연령 제약 [C18]: 공식 도움말 영문판과 한국어판, 공식 블로그 교차 확인. 반례 감사에서 한국어판과 영문판의 불일치는 없었다.
- 공개 공유의 계정 제한 [C29]: 공식 도움말과 Workspace Updates 교차 확인.
- 실습용 예제 파일 라이선스 [C32]: 공공누리 이용조건 원문과 교육부 페이지 HTML 배지 교차 확인.

## 충돌·불확실성

- **Google AI Plus 가격이 공식 페이지끼리 어긋난다.** gemini.google은 ₩7,500과 400GB, one.google.com은 ₩11,900과 2TB, Google Korea 블로그는 200GB로 적는다. 어느 쪽도 확정할 수 없어 강의에서 언급하지 않는다. (수용된 공백 G1)
- **Google AI Pro ₩29,000/월(5TB)**은 one.google.com에서 두 번 재현했으나 단일 호스트 근거다. 슬라이드에 넣되 "2026-07-27 확인 기준, 결제 화면에서 재확인"을 붙인다. [C34]
- **무료 등급 한도 숫자**는 Google 공식 문서 2건으로만 확인된다. 독립 발행처 검증이 존재할 수 없는 유형의 사실이다. 반례 감사에서 숫자 변경 근거는 찾지 못했다. "2026-07-27 공식 문서 기준"을 명시해 가르친다. [C35]
- **교육부·과기정통부 공동 「수업·평가에서의 AI 활용 절차 및 사례 가이드라인」**은 2026년 2월 안내 예정으로 예고됐으나 발간을 확인하지 못했다. 게시판 전수 조사는 하지 못했고 공문 단독 배포 가능성도 배제할 수 없다. "확인되지 않음"으로 정직하게 안내한다. (수용된 공백 G3) [C22]
- **공공누리 제1유형과 자막을 동시에 만족하는 YouTube 영상은 0건이다.** (수용된 공백 G2)
- **모든 Google 도움말 페이지에 최종 수정일 표기가 없다.** 제품 사실의 시점을 문서로 확정할 수 없다. (수용된 공백 G4)
- **로그인 없이 조사했으므로 실제 앱 UI를 눈으로 검증하지 못했다.** 클릭 경로와 버튼 라벨은 공식 도움말 텍스트 기준이다. 인용 표시가 숫자 배지 형태인지도 확정하지 못했다. (수용된 공백 G5)
- 학생부 기재요령은 중학교용만 확인했다. 초등학교판과 고등학교판의 동일 문안 여부는 미확인이다.
- 조사 중 웹 검색 요약이 "HWP와 HWPX가 공식 지원된다"는 오정보를 낸 사례가 있었다. 원문을 직접 열어 반증했다. 검색 요약만 근거로 삼지 않는다.

## 위험 등급 판정 기준

이 조사에서 risk를 high로 둔 것은 숫자, 가격, 법령, 정책, 연령, 언어 제약처럼 **틀렸을 때 수강생에게 실제 피해나 규정 위반이 생기는 주장**이다. 화면 구성, 클릭 경로, 산출물 목록처럼 틀렸을 때 시연이 어색해지는 정도의 주장은 normal로 두되 모두 공식 문서에 연결했다.

## 주장별 출처 원장

| 출처 ID | 연결 주장 | 출처/발행처 | URL | 발행·수정일 | 접근일 | 유형 | 신뢰도 | 범위·한계 |
|---|---|---|---|---|---|---|---|---|
| R1 | C1, C2 | NotebookLM is now Gemini Notebook / Google | https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/ | 2026-07-16 | 2026-07-27 | 공식 블로그 | 높음 | 개명 롤아웃 기간 명시 없음 |
| R2 | C17 | AI 음성 개요 한국어 지원 / Google Korea | https://blog.google/intl/ko-kr/company-news/technology/notebooklm-audio-overviews-50-languages-kr/ | 2025-04-30 | 2026-07-27 | 공식 블로그 | 높음 | 발표 시점 문서, 이후 개선 미반영 |
| R3 | C18 | Cinematic Video Overviews / Google | https://blog.google/innovation-and-ai/products/notebooklm/generate-your-own-cinematic-video-overviews-in-notebooklm/ | 2026-03-04 | 2026-07-27 | 공식 블로그 | 높음 | 출시 시점 기준 |
| R4 | C2, C4, C5 | 100+ ways to use Gemini in K-12 education / Google for Education | https://docs.google.com/presentation/d/1MTyP-BBusYw2rHKE_lQ2QVDA7uT7ngYaGfBy9HypQdY/edit | 2026-07 | 2026-07-27 | 공식 가이드 | 높음 | 링크 비공개 전환 시 접근 불가. PARTS 철자 전개는 이미지라 미확보 |
| R5 | C11, C19 | Gemini·NotebookLM for Education 퀵스타트 / Google Workspace 관리자 | https://knowledge.workspace.google.com/admin/getting-started/editions/quickstart-guide-to-gemini-and-notebooklm-for-education | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 갱신일 없음 |
| R6 | C21 | 사용자별 Gemini Notebook 사용 설정 / Google Workspace 관리자 | https://knowledge.workspace.google.com/admin/users/access/turn-notebooklm-on-or-off-for-users | 2026-07-22 | 2026-07-27 | 공식 문서 | 높음 | 한국 ISMS-P 인증 언급 없음 |
| R7 | C34 | Google One 요금제 / Google | https://one.google.com/about/plans?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 가격표 | 중간 | 같은 페이지의 AI Plus 표기가 다른 공식 페이지와 모순 |
| R8 | C19 | Google 계정의 연령 요건 / Google | https://support.google.com/accounts/answer/1350409?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | Workspace에는 적용되지 않을 수 있다고 명시 |
| R9 | C1, C2, C19 | Gemini Notebook 알아보기 / Google | https://support.google.com/gemininotebook/answer/16164461?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 갱신일 없음 |
| R10 | C6, C8, C9, C10, C28 | Gemini Notebook에서 노트북 만들기 / Google | https://support.google.com/gemininotebook/answer/16206563?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 갱신일 없음. 실제 UI 미검증 |
| R11 | C17, C18 | AI 오디오 오버뷰 생성 / Google | https://support.google.com/gemininotebook/answer/16212820?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 지원 언어 전체 목록 축자 미확보 |
| R12 | C35 | Gemini Notebook 업그레이드(요금제와 한도표) / Google | https://support.google.com/gemininotebook/answer/16213268?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 갱신일 없음. 지역별 차등 여부 미확인 |
| R13 | C7, C15, C27, C30 | 노트북에 새 소스 추가 또는 검색 / Google | https://support.google.com/gemininotebook/answer/16215270?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | HWP 미지원은 목록 부재에 근거한 부정 추론 |
| R14 | C17 | 출력 언어 변경 / Google | https://support.google.com/gemininotebook/answer/16261963?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 동영상 개요 적용 여부가 문서 간 불일치 |
| R15 | C13, C14 | 메모 만들기 및 추가 / Google | https://support.google.com/gemininotebook/answer/16262519?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 갱신일 없음 |
| R16 | C16, C30, C35 | 자주 묻는 질문 / Google | https://support.google.com/gemininotebook/answer/16269187?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 갱신일 없음 |
| R17 | C14 | 모바일 앱에서 사용하기 / Google | https://support.google.com/gemininotebook/answer/16296687?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 갱신일 없음 |
| R18 | C29 | 공개 노트북 및 추천 노트북 / Google | https://support.google.com/gemininotebook/answer/16322204?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 기본값이 비공개인지 명시 문장 없음 |
| R19 | C11 | 직장 또는 학교 계정으로 사용하기 / Google | https://support.google.com/gemininotebook/answer/16337734?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 중간 | 에디션 표의 행과 열 매핑을 100% 확정하지 못함 |
| R20 | C18 | AI 동영상 오버뷰 생성 / Google | https://support.google.com/gemininotebook/answer/16454555?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 지원 언어 수가 보도와 불일치(70+ 대 80) |
| R21 | C9 | 슬라이드 자료 생성 / Google | https://support.google.com/gemininotebook/answer/16757456?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | Google Slides 내보내기 부재는 부정 추론 |
| R22 | C9 | 플래시카드 또는 퀴즈 생성 / Google | https://support.google.com/gemininotebook/answer/16958963?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 언어와 연령 제한 언급 없음 |
| R23 | C3 | Gemini 앱의 노트북 / Google | https://support.google.com/gemininotebook/answer/17003757?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 갱신일 없음 |
| R24 | C12 | 개인 정보 보호 및 이용약관 / Google | https://support.google.com/gemininotebook/answer/17004255?hl=ko | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | 정책 문서인데 개정일 표기가 없음. 한국어판은 AI 번역 고지 있음 |
| R25 | C11, C19 | NotebookLM과 Gemini 앱 Education 코어 서비스 전환 / Google Workspace Updates | https://workspaceupdates.googleblog.com/2025/04/notebookLM-and-gemini-app-core-services-for-education-customers.html | 2025-04-03 | 2026-07-27 | 공식 블로그 | 높음 | 이후 연령 정책이 뒤집힌 이력 있음 |
| R26 | C27 | Drive 자동 동기화 / Google Workspace Updates | https://workspaceupdates.googleblog.com/2026/05/keep-your-sources-up-to-date-with-automatic-Drive-syncing-in-NotebookLM.html | 2026-05-26 | 2026-07-27 | 공식 블로그 | 높음 | 관리자와 사용자가 끌 수 없음 |
| R27 | C1 | NotebookLM is now Gemini Notebook / Google Workspace Updates | https://workspaceupdates.googleblog.com/2026/07/notebooklm-now-gemini-notebook.html | 2026-07-16 | 2026-07-27 | 공식 블로그 | 높음 | 기능 변경 없음을 명시 |
| R28 | C33 | 학교알리미 공개용데이터 / KERIS·공공데이터포털 | https://www.data.go.kr/data/15014351/fileData.do | 2025-09-24 수정 | 2026-07-27 | 공개 데이터 | 높음 | 파일 내용은 내려받지 않음 |
| R29 | C20 | 2026학년도 학교생활기록부 기재요령(중학교) / 교육부·17개 시도교육청 | https://www.goe.go.kr/resource/goe/na/bbs_2675/2026/02/78529f5a-80d1-4b84-bf5e-b6da96f09d30.pdf | 2026-02 | 2026-07-27 | 공식 규범 문서 | 높음 | 중학교용만 확인. 초등과 고등은 미확인 |
| R30 | C31 | Google Workspace 상태 대시보드 NotebookLM 이력 / Google | https://www.google.com/appsstatus/dashboard/products/sqTm5ZmzCmb66kvyzcNS/history | 갱신형 | 2026-07-27 | 공식 문서 | 높음 | 대규모 장애만 기록 |
| R31 | C32 | 공공누리 제1유형 이용조건 / 한국문화정보원 | https://www.kogl.or.kr/info/licenseType1.do | 발행일 미표기 | 2026-07-27 | 공식 문서 | 높음 | — |
| R32 | C33 | 데이터로 읽는 우리 교육 제5호 / 교육부 | https://www.korea.kr/briefing/pressReleaseView.do?newsId=156761980 | 2026-05-17 | 2026-07-27 | 정부 배포자료 | 높음 | 제1유형이 텍스트에 한정. 사진과 영상 제외 |
| R33 | C24, C33 | 생성형 AI 이용자 개인정보 보호 가이드 카드뉴스 / 대한민국 정책브리핑 | https://www.korea.kr/multi/visualNewsView.do?newsId=148967924 | 2026-07-10 게시 | 2026-07-27 | 정부 2차 자료 | 중간 | 8대 핵심이슈 중 6개만 수록 |
| R34 | C25 | 개인정보 보호법 / 법제처 | https://www.law.go.kr/법령/개인정보보호법 | 법률 제20897호, 시행 2025-10-02 | 2026-07-27 | 법령 | 높음 | 교사 개인 업로드 행위에 대한 유권해석은 없음 |
| R35 | C26 | 저작권법 / 법제처 | https://www.law.go.kr/법령/저작권법 | 법률 제21336호 | 2026-07-27 | 법령 | 높음 | AI 서비스 업로드와 제25조의 관계에 공식 해석 없음 |
| R36 | C33 | 2025년 교육기본통계 조사 결과 / 교육부 | https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=103992&lev=0&m=020402 | 2025-08-28 | 2026-07-27 | 정부 배포자료 | 높음 | 공공누리 제1유형 |
| R37 | C33 | 2026년 교육부 업무계획 / 교육부 | https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=104863&lev=0&m=020402 | 2025-12-12 | 2026-07-27 | 정부 배포자료 | 높음 | 공공누리 제1유형 |
| R38 | C22, C23, C32 | 수행평가 시 AI 활용 관리 방안 / 교육부 | https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=104984&lev=0&m=020402 | 2025-12-23 | 2026-07-27 | 정부 배포자료 | 높음 | 적용 범위가 수행평가로 한정 |
| R39 | C24 | 생성형 AI 서비스 이용자를 위한 개인정보 보호 가이드 / 개인정보보호위원회 | https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=12084 | 2026-05-19 | 2026-07-27 | 정부 배포자료 | 높음 | 본문 PDF 전문은 미확보 |

## 강의 반영 계획

### 아웃라인 변경안

1. **제목과 표기**: 전면적으로 "노트북LM(현 제미나이 노트북)" 병기로 전환한다. 사용자 승인이 필요하다.
2. **슬라이드 4 준비물**: 접속 경로 3갈래 경고를 추가한다. notebooklm.google.com을 표준으로 크게 제시하고 Gemini 앱에서 시작하면 스튜디오 버튼이 없다는 점을 못 박는다. [C2] [C3]
3. **슬라이드 6 소스 형식**: HWP 미지원과 변환 우회를 추가한다. 한국 교사에게 가장 먼저 걸리는 벽이다. [C15]
4. **슬라이드 12~13 산출물**: 현행 10종으로 갱신하고 학습 가이드·브리핑·FAQ가 보고서 프리셋 아래에 있다는 경로를 명시한다. 타임라인은 없다. [C9] [C10]
5. **슬라이드 14와 17 프롬프트 레시피**: Google for Education 공식 덱의 교사 프롬프트를 한국 단원으로 번안해 싣고 PARTS 프레임워크를 원리 슬라이드로 넣는다. [C4] [C5]
6. **슬라이드 21~22 맞춤 지시와 대화형**: 대화형 모드는 영어 전용임을 먼저 알리고 시연한다. 한국어로 기대하게 두면 실습이 무너진다. [C18]
7. **슬라이드 27 재사용 조건**: "복제해서 템플릿"이 아니라 "소스 목록과 맞춤 지시를 문서로 남겨 재구성"으로 다시 쓴다. 복제 기능이 없다. [C16]
8. **슬라이드 33 분할**: 개인 계정과 학교 계정의 데이터 취급 대비를 한 장, 학생부와 수행평가 규범 및 오해 정정을 한 장으로 나눈다. [C11] [C12] [C20] [C23]
9. **한도 슬라이드**: 무료 한도표를 갱신하고 "2026-07-27 확인 기준" 각주를 단다. Google AI Plus는 넣지 않는다. [C34] [C35]
10. **트러블슈팅 슬라이드**: 실제 확인된 실패 조건으로 교체하고 상태 대시보드를 안내한다. [C30] [C31]
11. **총 39장에서 41장으로.**

### 슬라이드별 C/O/R 연결

`research-state.json`의 `projection.slide_claim_map`을 진실 원천으로 삼는다.
