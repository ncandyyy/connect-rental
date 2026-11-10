/**
 * 페이지 진입점 — 각 기능 모듈을 켭니다.
 * 기능별 코드는 js/modules/ 에 있습니다.
 */
import { initReveal } from "./modules/reveal.js";
import { initMarquees } from "./modules/marquee.js";
import { initReviewRows } from "./modules/review-rows.js";
import { initMotionMedia } from "./modules/motion-media.js";
import { initCountUp } from "./modules/count-up.js";
import { initStackCards } from "./modules/stack-cards.js";
import { initApplyForm } from "./modules/form.js";
import { initFloatingCta } from "./modules/floating-cta.js";
import { initApplySheet } from "./modules/apply-sheet.js";
import { initViewCounter } from "./modules/view-counter.js";
import { captureAttribution } from "./modules/attribution.js";
import { toast } from "./modules/toast.js";

function start() {
  captureAttribution();
  initViewCounter();
  initMarquees();
  initReviewRows();
  initMotionMedia();
  initStackCards();
  initCountUp();
  initApplyForm();
  initFloatingCta();
  initApplySheet();
  initReveal();

  // 아직 준비되지 않은 링크 (약관 등)
  document.querySelectorAll("[data-pending]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      toast("준비 중인 페이지예요");
    }),
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
