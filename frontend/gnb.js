// ============================================================
// gnb.js — GNB 브레드크럼 컴포넌트 (접두사: gnb-bc-)
// URL 쿼리 파라미터 ?career=xxx 를 읽어 직무명을 브레드크럼에 동적 주입
// ============================================================

// URL 파라미터 값 → 브레드크럼 표시 레이블 매핑
const GNB_CAREER_LABELS = {
  admin:      'Admin',
  dev:        'Dev',
  consultant: 'Consultant',
  pu:         'Power User',
};

/**
 * URL 파라미터 ?career= 값을 읽어 브레드크럼의 직무명 span을 업데이트
 * 매핑되지 않는 값은 파라미터 값을 그대로 표시
 */
function gnbUpdateBreadcrumb() {
  const jobLabel = document.getElementById('gnb-bc-job');
  if (!jobLabel) return;

  const careerId = new URLSearchParams(window.location.search).get('career') || 'dev';
  jobLabel.textContent = GNB_CAREER_LABELS[careerId] ?? careerId;
}

document.addEventListener('DOMContentLoaded', gnbUpdateBreadcrumb);