// 세일즈포스 길잡이 챗봇 위젯(widget.js)이 주입하는 기본 말풍선 아이콘을
// assets/images/chabot.svg 아이콘으로 교체하는 스크립트.
// widget.js는 #sfgw-bubble 버튼을 직접 DOM에 생성하므로, 우리 쪽 HTML에서는
// 그 마크업을 수정할 수 없어 주입이 끝난 뒤 innerHTML만 바꿔치기함.

function chatbotApplyCustomIcon() {
	const bubble = document.getElementById("sfgw-bubble");
	if (!bubble) return false;

	bubble.innerHTML =
		'<img src="./assets/images/chabot.svg" alt="챗봇 아이콘" class="chatbot-bubble-icon" />';
	return true;
}

// widget.js는 defer로 로드되어 이 스크립트보다 먼저 실행되지만,
// 네트워크 지연 등으로 순서가 어긋날 경우를 대비해 잠시 재시도함
if (!chatbotApplyCustomIcon()) {
	let tries = 0;
	const timer = setInterval(() => {
		tries += 1;
		if (chatbotApplyCustomIcon() || tries > 20) clearInterval(timer);
	}, 100);
}
