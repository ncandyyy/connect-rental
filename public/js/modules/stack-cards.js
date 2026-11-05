/**
 * 카드 쌓기 — 스크롤하면 카드가 화면 위쪽에 한 장씩 붙고, 다음 카드가 올라오면 앞 카드는 뒤로 물러납니다.
 *
 * <ol data-stack> <li>카드</li> <li>카드</li> ... </ol>
 *
 * - 붙는 동작 자체는 CSS(position: sticky)이고, 이 파일은 "다음 카드가 얼마나 덮었는지"(--p: 0~1)만 계산합니다.
 *   CSS 에서 --p 로 크기·밝기를 줄입니다. (css/sections/package.css)
 * - 스크롤을 막지 않습니다. 평소처럼 내리면 카드가 넘어갑니다.
 * - 거의 다 덮인 카드에는 .is-covered 를 붙이고, 그 안의 영상은 멈춥니다. (motion-media.js)
 * - 화면 높이가 600px 미만이거나 모션 최소화 설정이면 쌓지 않고 일반 목록으로 보입니다.
 */
export function initStackCards(root = document) {
  root.querySelectorAll("[data-stack]").forEach(setup);
}

function setup(list) {
  const cards = [...list.children];
  if (cards.length < 2) return;
  cards.forEach((card, i) => card.style.setProperty("--i", i));

  const tall = window.matchMedia("(min-height: 600px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let gap = 0;
  let step = 16;
  let near = false;
  let ticking = false;

  const measure = () => {
    const cs = getComputedStyle(list);
    gap = parseFloat(cs.rowGap) || 0;
    step = parseFloat(cs.getPropertyValue("--stack-step")) || 16;

    // 마지막 카드가 다 올라올 때까지 앞 카드들이 붙어 있도록, 목록 아래 여백을 카드 높이에 맞춰 늘립니다.
    // (카드 높이가 서로 다르면 짧은 카드가 마지막일 때 묶음 전체가 먼저 밀려 올라가는 것을 막음)
    if (tall.matches && !reduced.matches) {
      // 카드 높이를 가장 큰 카드에 맞춥니다 (짧은 카드 아래로 앞 카드가 삐져나오지 않게)
      list.style.removeProperty("--stack-h");
      const tallest = Math.max(...cards.map((c) => c.offsetHeight));
      list.style.setProperty("--stack-h", `${tallest}px`);
      const last = cards.length - 1;
      const heights = cards.map((c) => c.offsetHeight);
      const lastBottom = last * step + heights[last];
      const need = Math.max(0, ...heights.map((h, i) => i * step + h - lastBottom));
      // sticky 는 부모의 padding 을 무시하므로, 목록 끝의 빈 칸(::after) 높이로 늘립니다. (빈 칸 앞 간격 gap 만큼은 빼기)
      const tail = Math.max(0, need + window.innerHeight * 0.15 - gap);
      list.style.setProperty("--stack-tail", `${Math.round(tail)}px`);
    } else {
      list.style.removeProperty("--stack-tail");
      list.style.removeProperty("--stack-h");
    }
  };

  const update = () => {
    ticking = false;
    const enabled = tall.matches && !reduced.matches;
    let changed = false;
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      let p = 0;
      if (enabled && next) {
        // 다음 카드가 원래 자리(카드 높이 + 간격 아래)에서 출발해 앞 카드 위 step 만큼 아래까지 올라오면 1
        const dist = next.getBoundingClientRect().top - card.getBoundingClientRect().top;
        const span = card.offsetHeight + gap - step;
        p = Math.min(1, Math.max(0, 1 - (dist - step) / span));
      }
      card.style.setProperty("--p", p.toFixed(3));
      const covered = p > 0.92;
      if (covered !== card.classList.contains("is-covered")) {
        card.classList.toggle("is-covered", covered);
        changed = true;
      }
    });
    if (changed) document.dispatchEvent(new CustomEvent("stack:change"));
  };

  const request = () => {
    if (!near || ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  measure();
  update();

  // 목록이 화면 근처에 있을 때만 스크롤마다 계산합니다
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        if (near) request();
      },
      { rootMargin: "50% 0px" },
    ).observe(list);
  } else {
    near = true;
  }

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    request();
  });
}
