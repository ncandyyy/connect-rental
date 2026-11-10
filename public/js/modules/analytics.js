/**
 * 분석 이벤트 전송 (설치된 도구가 있을 때만 동작)
 * - Google Tag Manager: window.dataLayer
 * - GA4: window.gtag
 * - Meta 픽셀: window.fbq
 * - 네이버 광고 전환추적: window.wcs (공통 스크립트는 index.html 맨 아래)
 * 아무것도 설치되어 있지 않거나 광고 차단기로 막혀 있으면 조용히 무시합니다.
 */
export function track(event, params = {}) {
  try {
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event, ...params });
    if (typeof window.gtag === "function") window.gtag("event", event, params);
    if (event === "lead_submit") {
      if (typeof window.fbq === "function") window.fbq("track", "Lead");
      naverLead();
    }
  } catch {
    /* ignore */
  }
}

/**
 * 네이버 신청완료(lead) 전환 — 신청이 시트에 접수됐을 때 한 번 보냅니다.
 * 계정 ID 는 index.html 공통 스크립트에서 넣은 wcs_add.wa 를 그대로 씁니다.
 * (테스트 모드·스팸 차단으로 끝난 신청은 lead_submit 이 불리지 않아 전환에 잡히지 않습니다)
 */
function naverLead() {
  if (!window.wcs || typeof window.wcs.trans !== "function") return;
  if (!window.wcs_add) window.wcs_add = {};
  const conv = { type: "lead" };
  window.wcs.trans(conv);
}
