# NotebookLM 슬라이드 만들기 (선생님 PC에서 실행)

NotebookLM은 구글 로그인이 필요해서 클라우드 세션에서는 만들 수 없습니다.
PDF 굽기와 덩어리 나누기는 이미 끝내 두었습니다(`notebooklm-chunks/`).
선생님 PC에서는 **로그인 → 실행** 두 가지만 하시면 됩니다.

- 덩어리 1: 1~12장 (열기, 첨성대, 천마총, 석굴암)
- 덩어리 2: 13~23장 (불국사, 닫기, 출처)

> Windows에서는 **Git Bash**에서 실행하세요. PowerShell은 `bash`를 못 찾을 수 있습니다.

## 1. 저장소 받기 (처음 한 번)

```bash
git clone https://github.com/shway81-droid/lecture-deck.git
cd lecture-deck
git checkout ccr-d82dbdc3-inc31p
```

이미 받아 두셨다면 `git pull` 만 하시면 됩니다.

## 2. 필요한 프로그램 설치 (처음 한 번)

```bash
pip install "notebooklm-py[browser]" pymupdf python-pptx
```

## 3. 구글 로그인 (선생님이 직접)

```bash
notebooklm -p default login
```

브라우저 창이 열리면 구글 계정으로 로그인하고, 창을 닫은 뒤 터미널로 돌아오세요.

## 4. 실행 (40~120분)

```bash
bash skills/lecture-deck/assets/nlm2deck/run.sh "lectures/경주-문화유산-체험학습-사전학습/index.html" --profile default
```

- `레이트 리밋 대기 (시도 n/24)` 가 반복되면 정상입니다. 5분마다 다시 시도합니다.
- 중간에 끊겨도 같은 명령을 다시 실행하면 이어서 합니다.
- 끝나면 입력·출력 장수 대조표가 나옵니다. `← 압축됨` 이 있으면 Claude에게 알려 주세요.

## 5. 결과

```
lectures/경주-문화유산-체험학습-사전학습/
  경주-문화유산-체험학습-사전학습-notebooklm.pptx   (NotebookLM 디자인, 슬라이드마다 그림 한 장)
  경주-문화유산-체험학습-사전학습-notebooklm.pdf
```

- 이 PPTX는 **글자를 고칠 수 없습니다.** 문구를 고칠 때는 `경주-문화유산-체험학습-사전학습.pptx` 를 쓰세요.
- 덩어리마다 NotebookLM 노트북이 하나씩 생깁니다(2개). 필요 없으면 NotebookLM에서 지우셔도 됩니다.
- 결과를 저장소에 올리려면:

```bash
git add lectures/경주-문화유산-체험학습-사전학습
git commit -m "경주 사전학습: NotebookLM 슬라이드 추가"
git push
```
