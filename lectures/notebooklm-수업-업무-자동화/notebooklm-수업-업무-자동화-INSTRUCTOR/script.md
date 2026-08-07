# 강사 대본 — 노트북LM(현 제미나이 노트북)으로 수업과 업무 자동화하기

- 총 46장 (본문 41장 + 출처 부록 5장)
- 90~120분 · 실습 4회
- 슬라이드의 `<aside class="notes">`와 내용이 일치합니다. 한쪽을 고치면 다른 쪽도 고칩니다.

---

## 슬라이드 1 — 표지
반갑습니다. 오늘 두 시간 뒤에 여러분 손에는 노트북 한 권, 산출물 세 개, 오디오 개요 하나, 그리고 내 반복 업무를 정리한 워크플로 문서 한 장이 남습니다. 시작 전에 한 가지만 말씀드릴게요. 이 도구 이름이 열흘 전에 바뀌었습니다. 그 얘기부터 하겠습니다.
큐: 미리 만들어둔 완성 노트북을 옆 화면에 띄워두고 시작.
Claim C1; evidence R1
[R1] NotebookLM is now Gemini Notebook — Google — 2026-07-16 — https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/

## 슬라이드 2 — 이름이 바뀌었습니다
검색해서 오신 분들은 노트북LM으로 알고 계실 거예요. 열하루 전에 제미나이 노트북으로 이름이 바뀌었습니다. 데이터도, 링크도 그대로고 주소도 안 바뀌었어요. 오늘은 두 이름을 섞어서 쓰겠습니다. 화면에 어떤 이름이 떠 있어도 같은 물건입니다.
큐: 실제 사이트를 띄워 상단 로고를 손으로 짚어준다.
Claim C1, C2; evidence R1
[R1] NotebookLM is now Gemini Notebook — Google — 2026-07-16 — https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/

## 슬라이드 3 — 오늘 들고 나갈 4가지
결과부터 보여드릴게요. 오른쪽 네 줄이 오늘 끝나면 여러분 계정에 남아 있을 것들입니다. 마지막 하나만 각자 업무로 하고, 앞의 셋은 제가 나눠드린 예제 파일로 다 같이 만듭니다. 지금은 이걸 만든다는 것만 기억하시면 됩니다.
큐: 오른쪽 네 줄을 손으로 하나씩 짚으며.

## 슬라이드 4 — 챗봇과 뭐가 다른가
이게 오늘 강의 전체를 관통하는 차이입니다. 챗봇에 교육과정 물어보면 그럴듯한 답이 나오는데 확인할 방법이 없죠. 여기는 반대예요. 내가 올린 자료 밖으로 나가지 않고, 문장마다 어느 페이지에서 가져왔는지 붙여줍니다. 그래서 학교 문서 작업에 쓸 수 있는 겁니다.
큐: 실제 답변 하나를 띄워 인용 표시에 마우스를 올려 보여준다.
Claim C8; evidence R10
[R10] Gemini Notebook에서 노트북 만들기 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16206563?hl=ko

## 슬라이드 5 — 준비물과 접속 경로
주소를 정확히 맞춰야 합니다. 제미나이 앱 안에도 노트북이 있는데 거기서는 오디오 개요 버튼이 아예 안 보여요. 실습 중에 버튼이 없다고 하시는 분은 십중팔구 이 경우입니다. 화면 왼쪽 주소창 확인하시고, 예제 파일 다섯 개 압축 푸셨는지 확인해 주세요.
큐: 주소를 판서하거나 채팅창에 붙여 배포. 전원이 로그인 완료할 때까지 대기.
Claim C2, C3, C14; evidence R1, R17, R23
[R1] NotebookLM is now Gemini Notebook — Google — 2026-07-16 — https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/
[R17] 모바일 앱에서 사용하기 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16296687?hl=ko
[R23] Gemini 앱의 노트북 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/17003757?hl=ko

## 슬라이드 6 — 화면 3구역
세 칸만 기억하시면 됩니다. 왼쪽에 자료를 넣고, 가운데서 물어보고, 오른쪽에서 결과물을 뽑아요. 왼쪽 체크박스가 은근히 중요한데, 자료 열 개 중에 두 개만 켜두면 그 두 개로만 답합니다. 단원별로 나눠서 물어볼 때 씁니다.
큐: 실제 화면에서 세 칸을 마우스로 크게 훑는다.
Claim C6; evidence R10
[R10] Gemini Notebook에서 노트북 만들기 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16206563?hl=ko

## 슬라이드 7 — 소스로 넣을 수 있는 것
교사 입장에서 제일 요긴한 건 마지막 두 개예요. 유튜브 강의 영상 주소를 붙이면 자막을 읽어옵니다. 그리고 내 수업을 녹음한 파일을 그대로 올릴 수 있어요. 오늘 실습 마지막에 이걸 씁니다. 50만 단어면 웬만한 교과서 한 권이 통째로 들어갑니다.
큐: 유튜브와 녹음 카드를 짚으며 뒤에서 쓸 거라고 예고.
Claim C7; evidence R13
[R13] 노트북에 새 소스 추가 또는 검색 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16215270?hl=ko

## 슬라이드 8 — HWP는 안 됩니다
한국 선생님들이 제일 먼저 부딪히는 벽입니다. 우리 문서는 다 한글 파일인데 그게 안 올라가요. 드라이브에 올려서 연결하는 우회로도 막혀 있습니다. 방법은 하나, 변환입니다. 저는 표가 많은 문서는 DOCX로, 그냥 읽는 문서는 PDF로 저장해서 씁니다. 변환하면 각주나 복잡한 표가 깨질 수 있으니 올린 뒤에 한 번 확인하세요.
큐: 한글 프로그램의 다른 이름으로 저장 화면을 잠깐 띄워준다.
Claim C15; evidence R13
[R13] 노트북에 새 소스 추가 또는 검색 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16215270?hl=ko

## 슬라이드 9 — 실습① 노트북 만들고 자료 올리기
십 분 드리겠습니다. 파일 다섯 개를 다 올리고 이름까지 바꾸면 손 들어 주세요. 업로드가 안 되는 분은 파일 크기부터 보시고, 그래도 안 되면 손 들어 주시면 제가 갑니다. 다 올라가면 왼쪽에 다섯 줄이 생깁니다.
큐: 강사도 함께 화면에서 따라 하며 진행. 8분 지나면 남은 시간 안내.

## 슬라이드 10 — 인용 확인하는 법
여기가 오늘의 핵심입니다. AI가 만든 문장을 그대로 쓰면 안 되는 이유는 나중에 규정 얘기할 때 다시 하겠지만, 실무적으로는 이 습관 하나면 됩니다. 인용 눌러서 원문 보기. 인용이 안 붙은 문장이 있으면 그건 자료 밖에서 온 말이니까 그 문장은 쓰지 마세요.
큐: 답변 하나에서 인용을 눌러 소스로 점프하는 걸 반드시 실제로 보여준다.
Claim C8; evidence R10
[R10] Gemini Notebook에서 노트북 만들기 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16206563?hl=ko

## 슬라이드 11 — 잘 되는 질문과 안 되는 질문
왼쪽처럼 물으면 뻔한 답이 나옵니다. 오른쪽은 세 가지가 들어가 있어요. 어디서 찾을지, 무엇을 찾을지, 어떤 모양으로 줄지. 특히 마지막 질문 한번 써보세요. 문서 두 개 올려놓고 숫자가 어긋나는 데 있냐고 물으면 사람이 놓치는 걸 잘 찾습니다.
큐: 왼쪽 질문 하나를 실제로 넣어 밋밋한 답을 보여준 뒤 오른쪽으로 바꿔 비교.

## 슬라이드 12 — 실습① 질문하고 메모로 남기기
4번이 오늘 배우는 기술 중에 제일 안 알려진 겁니다. 답변을 메모로 저장하고, 그 메모를 다시 소스로 만들면 정리한 결과 위에서 또 물어볼 수 있어요. 자료가 눈덩이처럼 굴러갑니다. 학기 내내 한 노트북을 키워 나가는 방식이 이겁니다.
큐: 4번은 반드시 강사 화면에서 먼저 시연한 뒤 따라 하게 한다.
Claim C13; evidence R15
[R15] 메모 만들기 및 추가 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16262519?hl=ko

## 슬라이드 13 — 스튜디오 산출물 10종
열 개나 됩니다. 다 쓰실 필요 없고 오늘은 네 개만 손에 익히면 충분해요. 보고서, 퀴즈, 오디오 오버뷰, 마인드맵. 각 타일 옆에 연필 아이콘이 있는데 그게 맞춤설정입니다. 그냥 누르면 기본값으로 나오고, 연필을 누르면 언어랑 분량을 정할 수 있어요.
큐: 스튜디오 패널을 띄워 연필 아이콘 위치를 짚는다.
Claim C9; evidence R10, R21, R22
[R10] Gemini Notebook에서 노트북 만들기 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16206563?hl=ko
[R21] 슬라이드 자료 생성 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16757456?hl=ko
[R22] 플래시카드 또는 퀴즈 생성 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16958963?hl=ko

## 슬라이드 14 — 학습 가이드는 보고서 안에 있다
작년 자료 보고 오신 분들은 학습 가이드 버튼을 찾다가 못 찾습니다. 없어진 게 아니라 보고서 안으로 들어갔어요. 브리핑 문서랑 FAQ도 같이 거기 있습니다. 타임라인은 진짜로 빠졌는데, 직접 만들기에서 연표로 정리해달라고 쓰면 나옵니다.
큐: 보고서를 눌러 프리셋 목록이 펼쳐지는 걸 보여준다.
Claim C10; evidence R10
[R10] Gemini Notebook에서 노트북 만들기 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16206563?hl=ko

## 슬라이드 15 — PARTS 프롬프트 다섯 요소
프롬프트 잘 쓰는 법 어렵게 배우실 필요 없어요. 구글이 교사용으로 만든 가이드에 다섯 요소로 정리해 놨습니다. 아래 예문 보시면 다섯 개가 다 들어가 있죠. 누구 입장에서, 뭘 갖고, 뭘 만들어서, 누구한테 줄 건데, 어떤 모양으로. 이 다섯 개만 채우면 됩니다.
큐: 예문에서 다섯 요소를 하나씩 손으로 끊어 짚는다.
Claim C5; evidence R4
[R4] 100+ ways to use Gemini in K-12 education — Google for Education — 2026-07 — https://docs.google.com/presentation/d/1MTyP-BBusYw2rHKE_lQ2QVDA7uT7ngYaGfBy9HypQdY/edit

## 슬라이드 16 — 수업용 프롬프트 레시피
중괄호 친 데만 여러분 단원으로 바꾸시면 됩니다. 세 번째 수준별 자료가 실제로 제일 시간을 아껴줘요. 기초 보통 심화 세 벌 만드는 게 원래 제일 귀찮은 일인데, 이건 한 번에 나옵니다. 어휘 도움말 붙여달라는 문장을 빼지 마세요. 그게 있고 없고 차이가 큽니다.
큐: 배포 자료에 이 프롬프트가 텍스트로 들어 있음을 알린다.
Claim C4; evidence R4
[R4] 100+ ways to use Gemini in K-12 education — Google for Education — 2026-07 — https://docs.google.com/presentation/d/1MTyP-BBusYw2rHKE_lQ2QVDA7uT7ngYaGfBy9HypQdY/edit

## 슬라이드 17 — 실습② 수업 자료 뽑기
십이 분 드리겠습니다. 학습 가이드랑 퀴즈 두 개 뽑으시면 돼요. 중요한 건 4번입니다. 나온 결과를 그냥 좋다고 넘기지 마시고, 인용 표시가 없는 문장이 몇 개인지 세어보세요. 그게 검수 감각을 만듭니다. 다 하신 분은 옆자리와 개수 비교해 보세요.
큐: 10분 지나면 남은 시간 안내. 4번 안 한 분들 다시 상기.

## 슬라이드 18 — 업무용 프롬프트 레시피
두 번째 FAQ 지시문에서 마지막 줄을 꼭 넣으세요. 자료에 없으면 확인 후 안내드리겠다고 남기라는 문장이요. 이걸 안 넣으면 없는 내용을 그럴듯하게 채웁니다. 세 번째는 회의 녹음 올려놓고 쓰는 건데, 이름 대신 직책으로 쓰라는 줄이 나중에 문서 공유할 때 여러분을 지켜줍니다.
큐: FAQ 마지막 줄과 회의록 마지막 줄에 밑줄 긋는 동작.
Claim C4; evidence R4
[R4] 100+ ways to use Gemini in K-12 education — Google for Education — 2026-07 — https://docs.google.com/presentation/d/1MTyP-BBusYw2rHKE_lQ2QVDA7uT7ngYaGfBy9HypQdY/edit

## 슬라이드 19 — 실습② 업무 문서 뽑기
팔 분입니다. 3번 하시면 새 탭에 구글 문서가 하나 생겨요. 여기서 중요한 게, 내보낸 문서를 아무리 고쳐도 노트북 안의 원본은 안 바뀝니다. 한 방향입니다. 그리고 공유 설정도 안 따라가니까 문서를 누구한테 보낼 거면 거기서 다시 설정하셔야 해요.
큐: 내보내기 후 새 탭이 열리는 것까지 시연.

## 슬라이드 20 — 검수 체크리스트
이 네 줄이 오늘 배운 것 중에 가장 실무적인 부분입니다. 특히 2번, 숫자는 무조건 원문 열어서 보세요. 요약하면서 숫자를 옮겨 적다 틀리는 경우가 있습니다. 4번은 좀 이상하게 들리실 텐데, 뒤에 규정 얘기하면서 왜 필요한지 말씀드릴게요.
큐: 네 줄을 소리 내어 읽고 배포 자료에도 있다고 안내.

## 슬라이드 21 — 오디오 개요가 하는 일
이건 말로 설명하는 것보다 들려드리는 게 빠릅니다. 제가 아까 만들어둔 걸 삼십 초만 틀게요. 두 사람이 내 자료 갖고 얘기를 나눕니다. 출퇴근할 때 듣거나, 학생들한테 예습용으로 던져주기 좋아요. 무료 계정은 하루 세 개니까 실습할 때 아껴 쓰셔야 합니다.
큐: 미리 만든 한국어 오디오 개요를 30초 재생.
Claim C17; evidence R2, R11
[R2] AI 음성 개요 한국어 지원 — Google Korea — 2025-04-30 — https://blog.google/intl/ko-kr/company-news/technology/notebooklm-audio-overviews-50-languages-kr/
[R11] AI 오디오 오버뷰 생성 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16212820?hl=ko

## 슬라이드 22 — 한국어로 되는 것과 안 되는 것
기대치를 먼저 맞추고 가겠습니다. 오른쪽이 한국어로 안 되는 것들이에요. 특히 대화형 모드, 방송 듣다가 끼어들어서 질문하는 그 기능은 영어만 됩니다. 유튜브에서 그거 보고 오신 분들 실습하다가 안 된다고 하실 텐데 안 되는 게 맞습니다. 그리고 시네마틱 영상은 성인 계정만 되니까 학생들한테 시킬 수 없어요.
큐: 대화형 모드는 영어로만 잠깐 시연하거나 아예 시연하지 않는다.
Claim C18; evidence R3, R11, R20
[R3] Generate your own Cinematic Video Overviews — Google — 2026-03-04 — https://blog.google/innovation-and-ai/products/notebooklm/generate-your-own-cinematic-video-overviews-in-notebooklm/
[R11] AI 오디오 오버뷰 생성 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16212820?hl=ko
[R20] AI 동영상 오버뷰 생성 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16454555?hl=ko

## 슬라이드 23 — 맞춤 지시로 방향 틀기
그냥 만들면 평범한 요약 방송이 나옵니다. 연필 아이콘 눌러서 이런 지시를 넣으면 완전히 달라져요. 저는 학년을 지정하는 첫 줄이 가장 효과가 크다고 봅니다. 중2 대상이라고 쓰면 어휘가 확 내려갑니다. 마지막 줄처럼 질문 남기라고 하면 수업 도입부에 바로 쓸 수 있는 게 나와요.
큐: 지시문 없이 만든 것과 넣고 만든 것을 미리 준비해 앞부분만 비교 재생.
Claim C17; evidence R11
[R11] AI 오디오 오버뷰 생성 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16212820?hl=ko

## 슬라이드 24 — 동영상 개요와 마인드맵
마인드맵은 만드는 자리가 달라서 헷갈립니다. 스튜디오가 아니라 채팅 쪽에 있는 칩을 눌러야 나와요. 만들어지면 스튜디오에 저장됩니다. 이게 은근히 좋은 게, 가지 하나를 클릭하면 그 주제로 바로 질문이 들어가요. 학생들이랑 같이 화면 띄워놓고 파고들기 좋습니다.
큐: 마인드맵 노드 클릭으로 질문이 들어가는 걸 시연.
Claim C9, C18; evidence R10, R20
[R10] Gemini Notebook에서 노트북 만들기 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16206563?hl=ko
[R20] AI 동영상 오버뷰 생성 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16454555?hl=ko

## 슬라이드 25 — 실습③ 오디오 개요 만들기
생성에 몇 분 걸립니다. 기다리면서 4번 하세요. 그리고 오늘 이미 산출물을 여러 개 뽑으셨으니까 한도 조심하셔야 해요. 오디오는 하루 세 개입니다. 안 나온다고 여러 번 누르지 마시고, 한 번 눌러놓고 기다리세요.
큐: 생성 시작 후 4번으로 유도. 한도 초과한 분은 옆자리 결과를 같이 듣게 한다.
Claim C35; evidence R12
[R12] Gemini Notebook 업그레이드 요금제와 한도표 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16213268?hl=ko

## 슬라이드 26 — 교실과 회의에서 쓰는 법
만드는 건 배웠으니 어디에 쓸지가 남았죠. 두 번째가 저는 제일 효과가 컸습니다. 긴 공문을 오디오로 만들어서 회의 전에 뿌리면, 회의 시간에 그 내용을 처음부터 설명하지 않아도 돼요. 회의가 짧아집니다.
큐: 세 카드 중 청중에게 어느 게 제일 와닿는지 손 들어 물어본다.

## 슬라이드 27 — 자동화는 반복을 템플릿으로
자동화라고 하면 버튼 하나 누르면 끝나는 걸 상상하시는데, 여기서는 그런 게 아닙니다. 매번 같은 순서로 하는 것, 그게 자동화예요. 순서가 정해지면 십 분 걸리던 게 이 분이 됩니다. 지금부터는 그 순서를 어떻게 짜는지 보겠습니다.
큐: 큰 문장을 읽고 잠깐 쉬었다 다음으로.

## 슬라이드 28 — 복제 버튼은 없습니다
여기서 많이들 실망하십니다. 잘 만든 노트북을 복사해서 다음 학년에 쓰고 싶은데 그게 안 돼요. 그래서 저는 노트북마다 짝이 되는 문서를 하나씩 만듭니다. 어떤 자료를 넣었고 어떤 지시문을 썼는지 적어두는 거예요. 그 문서만 있으면 오 분이면 다시 만듭니다.
큐: 실제로 쓰는 짝 문서 예시를 화면에 잠깐 보여준다.
Claim C16; evidence R16
[R16] 자주 묻는 질문 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16269187?hl=ko

## 슬라이드 29 — 재사용되는 노트북의 조건
2번만 기억하셔도 오늘 본전 뽑으십니다. 계속 고치는 문서는 PDF로 올리지 마세요. 구글 문서로 올려두면 원본만 고쳐도 노트북이 따라옵니다. 반대로 PDF나 웹 주소는 올린 순간 사진처럼 굳어요. 원본이 바뀌어도 노트북은 옛날 내용으로 답합니다.
큐: 구글 문서를 고치고 노트북에서 다시 물어보는 시연이 가능하면 한다.
Claim C27; evidence R13, R26
[R13] 노트북에 새 소스 추가 또는 검색 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16215270?hl=ko
[R26] Keep your sources up to date with automatic Drive syncing — Google Workspace Updates — 2026-05-26 — https://workspaceupdates.googleblog.com/2026/05/keep-your-sources-up-to-date-with-automatic-Drive-syncing-in-NotebookLM.html

## 슬라이드 30 — 공유와 협업
오른쪽 두 번째를 특히 보세요. 채팅 화면만 공유하는 링크가 있는데, 소스가 안 보이니까 안전하다고 생각하기 쉬워요. 그런데 실제 접근 권한은 그대로 남아 있습니다. 구글이 자기 문서에 그렇게 써놨어요. 그러니까 민감한 자료가 든 노트북은 아예 공유하지 마세요.
큐: 지구본 아이콘 위치를 실제 화면에서 짚어준다.
Claim C28, C29; evidence R10, R18
[R10] Gemini Notebook에서 노트북 만들기 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16206563?hl=ko
[R18] 공개 노트북 및 추천 노트북 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16322204?hl=ko

## 슬라이드 31 — 주간 루틴 예시
금요일 것이 핵심입니다. 한 주 동안 저장해둔 메모들을 소스로 바꿔놓으면, 다음 주에 물어볼 때 이번 주 결론 위에서 답이 나옵니다. 학기 말쯤 되면 이 노트북이 저보다 우리 학교 사정을 더 잘 압니다. 여러분도 요일 하나만 정해서 시작해 보세요.
큐: 청중에게 어느 요일 하나만 골라보라고 권한다.

## 슬라이드 32 — 실습④ 내 반복 업무 설계
십오 분입니다. 오늘 유일하게 각자 업무로 하는 시간이에요. 완벽하게 안 채워도 됩니다. 1번 자료가 어디 있는지만 정확히 적어도 절반은 된 거예요. 다 하신 분은 옆자리와 바꿔 보시고, 상대 것에서 하나 훔쳐 오세요.
큐: 12분 지나면 조별로 한 명씩 발표하도록 유도.

## 슬라이드 33 — 계정에 따라 데이터 취급이 다르다
오늘 하나만 가져가신다면 이겁니다. 학생 자료가 든 노트북에서는 좋아요 싫어요 버튼을 누르지 마세요. 개인 계정에서 그걸 누르면 올린 파일까지 사람 검토 대상이 됩니다. 구글이 자기 문서에 의견에 민감한 정보 넣지 말라고 써놨어요. 학교 계정은 그 예외인데, 우리 학교가 어떤 버전인지는 정보부장님께 확인하셔야 합니다.
큐: 오른쪽 두 번째 줄에서 잠깐 멈춘다.
Claim C11, C12, C21; evidence R5, R6, R19, R24, R25
[R5] Quickstart Guide to Gemini and NotebookLM for Education — Google Workspace 관리자 — 날짜 미표기 — https://knowledge.workspace.google.com/admin/getting-started/editions/quickstart-guide-to-gemini-and-notebooklm-for-education
[R6] 사용자별 Gemini Notebook 사용 설정 — Google Workspace 관리자 — 2026-07-22 — https://knowledge.workspace.google.com/admin/users/access/turn-notebooklm-on-or-off-for-users
[R19] 직장 또는 학교 계정으로 사용하기 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16337734?hl=ko
[R24] 개인 정보 보호 및 이용약관 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/17004255?hl=ko
[R25] Education 코어 서비스 전환 — Google Workspace Updates — 2025-04-03 — https://workspaceupdates.googleblog.com/2025/04/notebookLM-and-gemini-app-core-services-for-education-customers.html

## 슬라이드 34 — 학생부와 수행평가 규범
뉴스만 보면 AI로 학생부 쓰면 큰일 나는 것처럼 들리는데, 원문은 다릅니다. 금지된 건 그대로 붙여넣는 거고, 문장 다듬는 데 쓰는 건 조건부로 허용돼요. 조건이 뭐냐면 최종 입력 전에 선생님이 확인하는 겁니다. 아까 검수 체크리스트 4번에서 말투를 내 말투로 고치라고 한 게 이거예요. 그리고 파일 속성 확인, 이거 놓치기 쉽습니다. 한글 파일 속성에 작성자 이름이 그대로 남아 있어요.
큐: 검수 체크리스트 슬라이드를 다시 언급하며 연결한다.
Claim C20, C22, C23; evidence R29, R38
[R29] 2026학년도 학교생활기록부 기재요령 중학교 — 교육부와 17개 시도교육청 — 2026-02 — https://www.goe.go.kr/resource/goe/na/bbs_2675/2026/02/78529f5a-80d1-4b84-bf5e-b6da96f09d30.pdf
[R38] 수행평가 시 AI 활용 관리 방안 — 교육부 — 2025-12-23 — https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=104984&lev=0&m=020402

## 슬라이드 35 — 개인정보와 저작권 최소 규칙
4번에서 많이들 놀라십니다. 흔히 열세 살이라고 알려져 있는데 그건 미국 기준이고, 한국은 구글 계정 자체가 만 열네 살부터입니다. 중1은 개인 계정으로 못 써요. 학교 계정은 다르니까 학교에 확인하시고요. 3번 저작권은 해석이 갈리는 부분이 있어서 단정하지 않겠습니다. 확실한 건 통째로 올리는 건 위험하다는 겁니다.
큐: 네 줄을 천천히 읽고 질문 받는다.
Claim C19, C24, C25, C26; evidence R5, R8, R33, R34, R35, R39
[R5] Quickstart Guide to Gemini and NotebookLM for Education — Google Workspace 관리자 — 날짜 미표기 — https://knowledge.workspace.google.com/admin/getting-started/editions/quickstart-guide-to-gemini-and-notebooklm-for-education
[R8] Google 계정의 연령 요건 — Google — 날짜 미표기 — https://support.google.com/accounts/answer/1350409?hl=ko
[R33] 생성형 AI 이용자 개인정보 보호 가이드 카드뉴스 — 대한민국 정책브리핑 — 2026-07-10 — https://www.korea.kr/multi/visualNewsView.do?newsId=148967924
[R34] 개인정보 보호법 — 법제처 — 시행 2025-10-02 — https://www.law.go.kr/법령/개인정보보호법
[R35] 저작권법 — 법제처 — 법률 제21336호 — https://www.law.go.kr/법령/저작권법
[R39] 생성형 AI 서비스 이용자를 위한 개인정보 보호 가이드 — 개인정보보호위원회 — 2026-05-19 — https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=12084

## 슬라이드 36 — 무료로 되는 범위와 요금
결론부터 말씀드리면 대부분 무료로 충분합니다. 오늘 두 시간 동안 하신 게 무료 한도 안에서 다 됐잖아요. 하루 오디오 세 개가 유일하게 빡빡한데, 매일 만들 일은 없습니다. 학교 계정 쓰시는 분은 이미 포함돼 있으니 결제하실 필요 없어요.
큐: 가격 숫자는 강의 당일 아침에 한 번 다시 확인할 것.
Claim C11, C34, C35; evidence R5, R7, R12, R16
[R5] Quickstart Guide to Gemini and NotebookLM for Education — Google Workspace 관리자 — 날짜 미표기 — https://knowledge.workspace.google.com/admin/getting-started/editions/quickstart-guide-to-gemini-and-notebooklm-for-education
[R7] Google One 요금제 — Google — 날짜 미표기 — https://one.google.com/about/plans?hl=ko
[R12] Gemini Notebook 업그레이드 요금제와 한도표 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16213268?hl=ko
[R16] 자주 묻는 질문 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16269187?hl=ko

## 슬라이드 37 — 자주 막히는 지점
실습하다 손 드신 분들 사유가 대체로 이 다섯 개 안에 있었습니다. 3번 스캔본 문제가 은근히 많아요. 옛날 자료를 복사기로 밀어서 만든 PDF는 그림이지 글자가 아니라서 못 읽습니다. 5번은 내 잘못이 아닐 수 있으니 대시보드 주소 저장해 두세요. 작년에도 몇 시간씩 멈춘 적이 있습니다.
큐: 대시보드 주소를 배포 자료에도 넣어두었다고 안내.
Claim C30, C31; evidence R13, R16, R30
[R13] 노트북에 새 소스 추가 또는 검색 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16215270?hl=ko
[R16] 자주 묻는 질문 — Google — 날짜 미표기 — https://support.google.com/gemininotebook/answer/16269187?hl=ko
[R30] Google Workspace 상태 대시보드 NotebookLM 이력 — Google — 갱신형 — https://www.google.com/appsstatus/dashboard/products/sqTm5ZmzCmb66kvyzcNS/history

## 슬라이드 38 — 예제 파일 출처표시
오늘 쓴 파일들은 제가 아무거나 고른 게 아니라 공공누리 제1유형만 골랐습니다. 출처만 밝히면 여러분이 연수 자료로 다시 쓰셔도 됩니다. 배포 폴더 안에 출처표시 문구를 적어놨으니 그대로 복사해서 쓰세요. 교과서나 문제집으로 실습 안 한 이유가 이겁니다.
큐: 배포 폴더의 출처표시 파일을 화면에 잠깐 띄운다.
Claim C32, C33; evidence R28, R31, R32, R33, R36, R37, R38
[R28] 학교알리미 공개용데이터 — KERIS 공공데이터포털 — 2025-09-24 — https://www.data.go.kr/data/15014351/fileData.do
[R31] 공공누리 제1유형 이용조건 — 한국문화정보원 — 날짜 미표기 — https://www.kogl.or.kr/info/licenseType1.do
[R32] 데이터로 읽는 우리 교육 제5호 — 교육부 — 2026-05-17 — https://www.korea.kr/briefing/pressReleaseView.do?newsId=156761980
[R33] 생성형 AI 이용자 개인정보 보호 가이드 카드뉴스 — 대한민국 정책브리핑 — 2026-07-10 — https://www.korea.kr/multi/visualNewsView.do?newsId=148967924
[R36] 2025년 교육기본통계 조사 결과 — 교육부 — 2025-08-28 — https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=103992&lev=0&m=020402
[R37] 2026년 교육부 업무계획 — 교육부 — 2025-12-12 — https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=104863&lev=0&m=020402
[R38] 수행평가 시 AI 활용 관리 방안 — 교육부 — 2025-12-23 — https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=104984&lev=0&m=020402

## 슬라이드 39 — 한 페이지 브리프
이 장만 사진 찍어 가시면 오늘 내용이 다 들어 있습니다. 맨 아랫줄이 제일 중요해요. 나머지는 틀려도 다시 하면 되는데 그건 되돌릴 수 없습니다.
큐: 사진 찍을 시간 15초 준다.

## 슬라이드 40 — 오늘부터 30일
오늘 배운 게 사라지지 않으려면 오늘 저녁이 중요합니다. 1번, 자료 세 개만 더 올려두세요. 그러면 내일부터 쓸 이유가 생깁니다. 3번은 잊어버리기 쉬운데, 우리 학교 계정이 어느 버전인지 알아야 학생 자료를 다뤄도 되는지 판단할 수 있습니다.
큐: 1번을 오늘 저녁에 할 분 손 들어보게 한다.

## 슬라이드 41 — 마무리
질문 받겠습니다. 실습 중에 안 풀린 게 있으면 지금 화면 띄워 주세요. 같이 보는 게 제일 빨리 배웁니다. 질문 없으시면 옆자리 분 노트북을 한 번 구경해 보세요. 남이 어떻게 썼는지 보는 게 제일 큰 힌트입니다.
큐: 노트북을 닫지 말고 대기. 개별 질문은 앞으로 나오게 한다.

## 슬라이드 42~46 — 출처 부록
출처를 다시 확인할 때는 같은 R 번호를 사용합니다. 구글 도움말 문서에는 최종 수정일 표기가 없어서 전부 2026-07-27 접근 기준입니다. 강의일에 한 번 다시 확인하세요.
큐: 넘기며 지나간다. 질문이 나올 때만 해당 장으로 돌아온다.

---

## 시간 배분 기준

| 구간 | 슬라이드 | 시간 |
|---|---|---|
| 도입 | 1~5 | 10분 |
| PART 1 | 6~12 | 25분 (실습 20분 포함) |
| PART 2 | 13~20 | 30분 (실습 20분 포함) |
| PART 3 | 21~26 | 20분 (실습 12분 포함) |
| PART 4 | 27~32 | 25분 (실습 15분 포함) |
| 마무리 | 33~41 | 15분 |

합계 125분. 90분으로 줄여야 하면 PART 4의 슬라이드 26, 31을 빼고 실습④를 8분으로 줄입니다.

## 강의 전날 점검

- [ ] 무료 한도 숫자와 Google AI Pro 가격을 공식 페이지에서 다시 확인 (슬라이드 36)
- [ ] 제품 명칭이 화면에서 어떻게 보이는지 확인 (슬라이드 2)
- [ ] 한국어 오디오 개요 샘플을 미리 만들어 둘 것 (슬라이드 21)
- [ ] 맞춤 지시 있는 것과 없는 것 두 벌 준비 (슬라이드 23)
- [ ] 예제 파일 5개 압축본 배포 준비 (슬라이드 5)
- [ ] 노트북 짝 문서 예시 하나 준비 (슬라이드 28)
