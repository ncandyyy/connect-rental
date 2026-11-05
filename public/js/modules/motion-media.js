/**
 * 움직이는 화면 (원래 GIF → 영상으로 바꿔 용량을 줄인 것)
 *
 * <div class="motion-media" data-motion>
 *   <img src="첫 장면.webp">                              ← 영상이 준비되기 전·모션 최소화 설정일 때 보이는 이미지
 *   <video muted playsinline loop preload="none">
 *     <source data-src="영상.mp4" type="video/mp4">      ← 화면 가까이 오면 그때 받아옵니다
 *     <source data-src="영상.webm" type="video/webm">
 *   </video>
 * </div>
 *
 * - 화면에 보일 때만 재생하고, 지나가거나 다른 탭으로 가면 멈춥니다 (배터리/데이터 절약)
 * - 쌓인 카드 밑에 완전히 덮인 경우(.is-covered, stack-cards.js)에도 멈춥니다
 * - 영상이 실제로 재생되기 시작하면 첫 장면 이미지 위로 부드럽게 나타납니다
 * - 불러오지 못하면 첫 장면 이미지가 그대로 남습니다
 */
export function initMotionMedia(root = document) {
  const items = [...root.querySelectorAll("[data-motion]")];
  if (!items.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const states = new Map(); // video → 화면에 보이는지

  const sync = (video) => {
    const covered = Boolean(video.closest(".is-covered"));
    const shouldPlay = states.get(video) && !covered && !document.hidden && !video.dataset.failed;
    if (shouldPlay) {
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    } else if (!video.paused) {
      video.pause();
    }
  };

  // 미리 받아오기: 화면 아래 한 화면 거리쯤에서 시작
  const loader = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const video = entry.target.querySelector("video");
        if (video) load(video);
        loader.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px 100% 0px" },
  );

  // 재생/정지: 20% 이상 보일 때만 재생
  const player = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target.querySelector("video");
        if (!video) return;
        states.set(video, entry.isIntersecting);
        if (entry.isIntersecting) load(video);
        sync(video);
      });
    },
    { threshold: 0.2 },
  );

  items.forEach((el) => {
    loader.observe(el);
    player.observe(el);
  });

  const syncAll = () => states.forEach((_, video) => sync(video));
  document.addEventListener("visibilitychange", syncAll);
  document.addEventListener("stack:change", syncAll);
}

function load(video) {
  if (video.dataset.loaded) return;
  video.dataset.loaded = "1";
  video.addEventListener("playing", () => video.classList.add("is-playing"));

  const sources = [...video.querySelectorAll("source[data-src]")];
  if (!sources.length) return;
  sources.forEach((source) => {
    source.addEventListener("error", () => console.warn("[motion-media] 영상을 불러오지 못했어요:", source.dataset.src));
  });
  // 모든 후보(mp4 → webm)가 실패하면 첫 장면 이미지만 남깁니다
  sources[sources.length - 1].addEventListener("error", () => {
    video.dataset.failed = "1";
  });
  sources.forEach((source) => {
    source.src = source.dataset.src;
  });
  video.preload = "auto";
  video.load();
}
