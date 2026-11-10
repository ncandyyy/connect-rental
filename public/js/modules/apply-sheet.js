/**
 * 신청 창 — [data-open-apply] 버튼(하단 고정 버튼)을 누르면 신청 폼을 창으로 띄웁니다.
 *  - 휴대폰: 아래에서 올라오는 창 / 데스크톱: 가운데 창 (모양은 css/components/sheet.css)
 *  - 신청 폼은 페이지에 하나만 있습니다. 창이 열리면 폼을 창 안으로 옮기고, 닫으면 원래 자리로 돌려놓습니다.
 *    (입력하던 내용·진행 단계가 그대로 이어지고, 시트 전송 코드도 하나로 유지)
 *  - 닫기: X 버튼, 바깥 어두운 곳, ESC, 휴대폰 뒤로가기, 손잡이를 아래로 끌기
 */
import { track } from "./analytics.js";

const CLOSE_DRAG = 90; // 이만큼(px) 아래로 끌면 닫힘

export function initApplySheet() {
  const sheet = document.querySelector("[data-sheet]");
  const form = document.getElementById("apply-form");
  const openers = document.querySelectorAll("[data-open-apply]");
  if (!sheet || !form || !openers.length) return;

  const panel = sheet.querySelector(".sheet__panel");
  const body = sheet.querySelector("[data-sheet-body]");
  const handle = sheet.querySelector("[data-sheet-handle]");
  const root = document.documentElement;

  // 폼이 빠져나간 자리를 같은 높이로 채워서 뒤 페이지가 흔들리지 않게
  const placeholder = document.createElement("div");
  placeholder.setAttribute("aria-hidden", "true");

  let isOpen = false;
  let lastFocus = null;
  let closeTimer = 0;

  function open(e) {
    e?.preventDefault();
    if (isOpen) return;
    isOpen = true;
    clearTimeout(closeTimer);
    lastFocus = document.activeElement;

    placeholder.style.height = `${form.offsetHeight}px`;
    form.replaceWith(placeholder);
    body.appendChild(form);
    form.classList.add("is-in"); // 스크롤 등장 효과 전이어도 바로 보이게
    body.scrollTop = 0;

    root.style.setProperty("--scrollbar", `${window.innerWidth - root.clientWidth}px`);
    root.classList.add("is-sheet-open");
    sheet.hidden = false;
    sheet.style.removeProperty("--drag");
    requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add("is-open")));
    panel.focus({ preventScroll: true });

    history.pushState({ applySheet: true }, ""); // 휴대폰 뒤로가기로 닫을 수 있게
    track("form_open", { location: "sheet" });
  }

  function close(fromHistory = false) {
    if (!isOpen) return;
    // 창을 열 때 쌓아둔 기록을 먼저 지우면, 그 결과(popstate)로 다시 이 함수가 불립니다
    if (!fromHistory && history.state && history.state.applySheet) {
      history.back();
      return;
    }
    isOpen = false;
    sheet.classList.remove("is-open", "is-dragging");
    sheet.style.removeProperty("--drag");
    closeTimer = setTimeout(() => {
      sheet.hidden = true;
      placeholder.replaceWith(form);
      root.classList.remove("is-sheet-open");
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }, 420);
  }

  openers.forEach((btn) => btn.addEventListener("click", open));
  sheet.querySelectorAll("[data-sheet-close]").forEach((el) => el.addEventListener("click", () => close()));
  window.addEventListener("popstate", () => close(true));

  // ESC 로 닫기 + 창 안에서만 Tab 이동
  sheet.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab") return;
    const items = [...panel.querySelectorAll('button, [href], input:not([type="hidden"]), select, [tabindex]:not([tabindex="-1"])')].filter(
      (el) => !el.disabled && el.offsetParent !== null && !el.closest("[hidden]"),
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // 휴대폰: 손잡이를 아래로 끌어서 닫기
  const mobile = window.matchMedia("(max-width: 599px)");
  let startY = 0;
  let startT = 0;
  let dy = 0;
  let dragging = false;
  handle.addEventListener("pointerdown", (e) => {
    if (!mobile.matches || e.target.closest("[data-sheet-close]")) return;
    dragging = true;
    startY = e.clientY;
    startT = performance.now();
    dy = 0;
    handle.setPointerCapture?.(e.pointerId);
    sheet.classList.add("is-dragging");
  });
  handle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    dy = Math.max(0, e.clientY - startY);
    sheet.style.setProperty("--drag", `${dy}px`);
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove("is-dragging");
    const fast = dy > 30 && dy / Math.max(1, performance.now() - startT) > 0.6;
    if (dy > CLOSE_DRAG || fast) close();
    else sheet.style.removeProperty("--drag");
  };
  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);
}
