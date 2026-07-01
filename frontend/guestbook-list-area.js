// json-server가 떠 있는 로컬 서버 주소
const GB_API = "http://localhost:3000";

// 현재 화면에 렌더링된 댓글 목록 (삭제 시 비밀번호 대조용으로 보관)
let sfGbComments = [];

document.addEventListener("DOMContentLoaded", () => {
  sfGbRenderForm();
  sfGbRenderList();

  // 렌더링이 끝난 후 등록 버튼에 클릭 이벤트를 연결
  const submitBtn = document.getElementById("sf-gb-submit-btn");
  submitBtn.addEventListener("click", sfGbHandleSubmit);

  // 댓글이 동적으로 생성되므로, 삭제 버튼 클릭 이벤트는 리스트 영역에 위임해서 처리
  const listArea = document.querySelector(".guestbook-list-area");
  listArea.addEventListener("click", sfGbHandleDeleteClick);
});

// 방명록 상단 — 타이틀 + 입력창(이름/비밀번호/내용) + 등록 버튼을 한 줄로 렌더링
function sfGbRenderForm() {
  const inputArea = document.querySelector(".guestbook-input-area");

  inputArea.innerHTML = `
    <h3 class="sf-gb-title">나의 취업 다짐 - 한 줄 방명록</h3>
    <div class="sf-gb-input-row">
      <input type="text" id="sf-gb-author-input" class="sf-gb-input" placeholder="이름" />
      <input type="password" id="sf-gb-password-input" class="sf-gb-input" placeholder="비밀번호" />
      <input type="text" id="sf-gb-content-input" class="sf-gb-input" placeholder="내용을 입력하세요" />
      <button type="button" id="sf-gb-submit-btn" class="sf-gb-submit-btn">등록</button>
    </div>
  `;
}

// 등록 버튼 클릭 시 입력값을 검증하고, 통과하면 서버 등록 함수로 넘김
function sfGbHandleSubmit(event) {
  const authorInput = document.getElementById("sf-gb-author-input");
  const passwordInput = document.getElementById("sf-gb-password-input");
  const contentInput = document.getElementById("sf-gb-content-input");

  // 이름이 입력되었는지 확인
  if (authorInput.value.trim() === "") {
    alert("이름을 입력해주세요.");
    return;
  }

  // 비밀번호가 입력되었는지 확인
  if (passwordInput.value.trim() === "") {
    alert("비밀번호를 입력해주세요.");
    return;
  }

  // 내용이 입력되었는지 확인
  if (contentInput.value.trim() === "") {
    alert("내용을 입력해주세요.");
    return;
  }

  const newComment = {
    author: authorInput.value.trim(),
    password: passwordInput.value.trim(),
    content: contentInput.value.trim(),
  };

  sfGbSubmitComment(newComment);
}

// 검증된 댓글 데이터를 db.json(comments)에 등록하는 함수
async function sfGbSubmitComment(data) {
  const apiUrl = `${GB_API}/comments`;

  try {
    // 1. 기존 댓글 목록을 조회해서 현재 마지막 id 값을 확인
    const listResponse = await fetch(apiUrl);
    const comments = await listResponse.json();

    // 2. 목록이 비어있으면 1, 아니면 (가장 큰 id + 1)을 새 id로 사용
    const maxId = comments.reduce(
      (max, comment) => Math.max(max, comment.id),
      0,
    );
    const newComment = {
      id: maxId + 1,
      ...data,
      created_at: new Date().toISOString().slice(0, 10), // YYYY-MM-DD 형식의 오늘 날짜
    };

    // 3. 새 댓글 데이터를 서버(db.json)에 등록
    const postResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComment),
    });

    if (!postResponse.ok) {
      throw new Error("서버 등록에 실패했습니다.");
    }

    // 입력창 초기화
    document.getElementById("sf-gb-author-input").value = "";
    document.getElementById("sf-gb-password-input").value = "";
    document.getElementById("sf-gb-content-input").value = "";

    // 최신 댓글 목록으로 다시 렌더링
    await sfGbRenderList();
  } catch (error) {
    console.error(error);
    alert("등록 중 오류가 발생했습니다. json-server가 켜져 있는지 확인해주세요.");
  }
}

// 방명록 하단 — db.json의 comments를 가져와 작성일 기준 내림차순(최신순)으로 렌더링
async function sfGbRenderList() {
  const listArea = document.querySelector(".guestbook-list-area");

  try {
    const response = await fetch(`${GB_API}/comments`);
    const comments = await response.json();

    // created_at이 최신인 댓글이 맨 위로 오도록 내림차순 정렬
    sfGbComments = comments.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );

    listArea.innerHTML = sfGbComments
      .map(
        (comment) => `
          <div class="guestbook-item-box" id="sf-gb-item-${comment.id}">
            <div class="sf-gb-item-header">
              <span class="sf-gb-item-author">${comment.author}</span>
              <span class="sf-gb-item-date">${comment.created_at}</span>
              <input
                type="password"
                class="sf-gb-delete-password-input"
                data-id="${comment.id}"
                placeholder="비밀번호"
              />
              <button type="button" class="sf-gb-delete-btn" data-id="${comment.id}">삭제</button>
            </div>
            <p class="sf-gb-item-content">${comment.content}</p>
          </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error(error);
    alert("방명록 목록을 불러오지 못했습니다. json-server가 켜져 있는지 확인해주세요.");
  }
}

// 삭제 버튼 클릭 시 비밀번호를 대조하고, 일치하면 화면과 db.json에서 함께 삭제
async function sfGbHandleDeleteClick(event) {
  if (!event.target.classList.contains("sf-gb-delete-btn")) return;

  const commentId = Number(event.target.dataset.id);
  const passwordInput = document.querySelector(
    `.sf-gb-delete-password-input[data-id="${commentId}"]`,
  );

  // 비밀번호가 입력되었는지 확인
  if (passwordInput.value.trim() === "") {
    alert("비밀번호를 입력해주세요.");
    return;
  }

  // 화면에 보관 중인 댓글 목록에서 같은 id의 댓글을 찾아 비밀번호를 비교
  const targetComment = sfGbComments.find((comment) => comment.id === commentId);
  if (!targetComment || targetComment.password !== passwordInput.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    // db.json에서도 해당 댓글을 삭제
    const response = await fetch(`${GB_API}/comments/${commentId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("삭제에 실패했습니다.");
    }

    // 화면에서도 해당 댓글 카드를 제거
    document.getElementById(`sf-gb-item-${commentId}`).remove();
    sfGbComments = sfGbComments.filter((comment) => comment.id !== commentId);
  } catch (error) {
    console.error(error);
    alert("삭제 중 오류가 발생했습니다. json-server가 켜져 있는지 확인해주세요.");
  }
}
