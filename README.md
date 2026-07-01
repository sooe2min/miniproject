### 1. 서버 실행: `json-server --watch db.json --port`

### 2. [branch 작업 프로세스](https://app.notion.com/p/branch-38fabd06af53802380f4fa848d236372)

- `feature/컴포넌트이름` 형식.
- PR은 제가(수민) 하겠습니다.

### 3. [Claude Rules](https://app.notion.com/p/Claude-Rules-38fabd06af5380e3b475cbdec8a277d3)

클로드를 위한 지침이지만 코드에 적용되는 규칙이니 중간중간 참고하시면 됩니다.
저는 클로드가 문서 대로 얼마나 말을 잘 드을지 몰라서 처음부터 내용을 인지시키고 작업하려고 합니다.

예) "우리 프로젝트 개발 규칙 파일(CLAUDE_RULES.md)을 올렸어. 이 규칙을 철저히 지켜서 기능을 작성해줘. 참고로 내 고유 접두사는 sm(본인 이름)- 이야. 네가 새로 만드는 모든 함수, id, 클래스명 앞에는 무조건 sm-을 붙여서 코드를 짜줘."

### 4. 폴더 구조

```bash
miniproject/
  ├── .gitignore
  ├── CLAUDE_RULES.md
  │
  ├── backend/
  │     └── db.json
  │
  └── frontend/             <-- 프론트엔드 작업 공간
        ├── assets/         <-- [여기에 이미지와 아이콘 몰아넣기]
        │     ├── images/   <-- png, jpg, jpeg 등 일반 이미지
        │     └── icons/    <-- svg 파일들
        │
        ├── detail.html
        ├── main.css (또는 각 팀원의 css 파일들)
        └── main.js  (또는 각 팀원의 js 파일들)
```

### 5. `.gitignore` 설정 항목

```bash
backend/db.json  # 각자 로컬에서 테스트한 방명록 데이터 (충돌 방지)

.DS_Store        # 맥(Mac) OS가 자동으로 만드는 폴더 메타데이터
Thumbs.db        # 윈도우(Windows) OS가 자동으로 만드는 미리보기 찌꺼기
.vscode/         # VS Code 개인 에디터 설정 폴더
.idea/           # 인텔리제이/웹스톰 개인 에디터 설정 폴더
```
