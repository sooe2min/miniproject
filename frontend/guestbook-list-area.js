// json-server가 떠 있는 로컬 서버 주소
const glIsLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const GB_API = glIsLocalhost
  ? "http://localhost:3000"
  : "https://miniproject-ijxt.onrender.com";

// 현재 화면에 렌더링된 댓글 목록 (삭제 시 비밀번호 대조용으로 보관)
let sfGbComments = [];

document.addEventListener("DOMContentLoaded", () => {
  sfGbRenderForm();
  sfGbRenderList();

  // 등록 버튼
  const submitBtn = document.getElementById("sf-gb-submit-btn");
  submitBtn.addEventListener("click", sfGbHandleSubmit);

  // 삭제 아이콘·팝오버 확인 버튼 — 리스트 영역에 이벤트 위임
  const listArea = document.querySelector(".guestbook-list-area");
  listArea.addEventListener("click", sfGbHandleListClick);

  // 팝오버 외부 클릭 시 모두 닫기
  document.addEventListener("click", sfGbCloseAllPopovers);
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
    alert(
      "등록 중 오류가 발생했습니다. json-server가 켜져 있는지 확인해주세요.",
    );
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
            <div class="sf-gb-delete-wrapper">
              <div class="sf-gb-delete-popover" id="sf-gb-popover-${comment.id}">
                <input type="password" class="sf-gb-popover-input" data-id="${comment.id}" placeholder="비밀번호" />
                <button type="button" class="sf-gb-popover-confirm-btn" data-id="${comment.id}">확인</button>
              </div>
              <button type="button" class="sf-gb-delete-icon-btn" data-id="${comment.id}" aria-label="댓글 삭제">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                  <path d="M10 11v6"></path>
                  <path d="M14 11v6"></path>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                </svg>
              </button>
            </div>
            <div class="sf-gb-item-header">
              <span class="sf-gb-item-author">${comment.author}</span>
              <span class="sf-gb-item-date">${comment.created_at}</span>
            </div>
            <p class="sf-gb-item-content">${comment.content}</p>
          </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error(error);
    alert(
      "방명록 목록을 불러오지 못했습니다. json-server가 켜져 있는지 확인해주세요.",
    );
  }
}

// 리스트 영역 클릭 이벤트 위임 — 쓰레기통 아이콘 / 팝오버 확인 버튼 처리
function sfGbHandleListClick(event) {
  const iconBtn = event.target.closest(".sf-gb-delete-icon-btn");
  const confirmBtn = event.target.closest(".sf-gb-popover-confirm-btn");

  if (iconBtn) {
    event.stopPropagation(); // 문서 클릭 핸들러(닫기)로 버블링 차단
    const commentId = iconBtn.dataset.id;
    sfGbTogglePopover(commentId);
    return;
  }

  if (confirmBtn) {
    event.stopPropagation();
    const commentId = confirmBtn.dataset.id;
    sfGbHandleDeleteConfirm(commentId);
    return;
  }

  // 팝오버 내부 클릭 시 닫히지 않도록 버블링 차단
  if (event.target.closest(".sf-gb-delete-popover")) {
    event.stopPropagation();
  }
}

// 쓰레기통 아이콘 클릭 → 해당 팝오버 토글, 나머지 팝오버 닫기
function sfGbTogglePopover(commentId) {
  const target = document.getElementById(`sf-gb-popover-${commentId}`);
  const isOpen = target.classList.contains("is-open");

  sfGbCloseAllPopovers();

  if (!isOpen) {
    target.classList.add("is-open");
    target.querySelector(".sf-gb-popover-input")?.focus();
  }
}

// 모든 팝오버 닫기 (외부 클릭 시 호출)
function sfGbCloseAllPopovers() {
  document.querySelectorAll(".sf-gb-delete-popover.is-open").forEach((el) => {
    el.classList.remove("is-open");
    el.querySelector(".sf-gb-popover-input").value = "";
  });
}

// 팝오버 확인 버튼 → 비밀번호 대조 후 삭제
async function sfGbHandleDeleteConfirm(commentId) {
  const popover = document.getElementById(`sf-gb-popover-${commentId}`);
  const passwordInput = popover.querySelector(".sf-gb-popover-input");
  const id = Number(commentId);

  if (passwordInput.value.trim() === "") {
    alert("비밀번호를 입력해주세요.");
    return;
  }

  const targetComment = sfGbComments.find((c) => c.id === id);
  if (!targetComment || targetComment.password !== passwordInput.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    const response = await fetch(`${GB_API}/comments/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("삭제에 실패했습니다.");

    document.getElementById(`sf-gb-item-${id}`).remove();
    sfGbComments = sfGbComments.filter((c) => c.id !== id);
  } catch (error) {
    console.error(error);
    alert(
      "삭제 중 오류가 발생했습니다. json-server가 켜져 있는지 확인해주세요.",
    );
  }
}
