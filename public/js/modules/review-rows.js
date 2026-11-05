/**
 * 후기 자동 캐러셀 줄 나누기 — 데스크톱은 한 줄, 휴대폰(600px 미만)은 두 줄
 *
 * <div class="reviews__rows" data-review-rows>
 *   <div class="marquee"><ul class="marquee__track"> 후기 li 전부 </ul></div>
 * </div>
 *
 * - 후기는 HTML 에 한 번만 적습니다. 이 파일이 화면 폭에 맞게 줄을 만들고 자동 캐러셀(marquee.js)을 켭니다.
 * - 휴대폰에서는 앞쪽 절반이 윗줄(←), 나머지가 아랫줄(→)로 서로 반대 방향으로 흐릅니다.
 * - 화면 폭이 기준선을 넘나들면(창 크기 조절, 태블릿 회전) 줄을 다시 만듭니다.
 */
import { initMarquees } from "./marquee.js";

/** 줄별 설정: 방향, 속도(1초에 움직이는 px), 시작 위치(0~1) */
const ROWS = {
  desktop: [{ direction: "left", speed: 36, start: 0.08 }],
  mobile: [
    { direction: "left", speed: 34, start: 0.12 },
    { direction: "right", speed: 30, start: 0.4 },
  ],
};

export function initReviewRows(root = document) {
  const wrap = root.querySelector("[data-review-rows]");
  if (!wrap) return;

  const source = [...wrap.querySelectorAll(".marquee__track > li")].map((li) => li.cloneNode(true));
  if (!source.length) return;

  const mobile = window.matchMedia("(max-width: 599px)");
  let marquees = [];

  const render = () => {
    marquees.forEach((m) => m.destroy());
    const rows = mobile.matches ? ROWS.mobile : ROWS.desktop;
    const per = Math.ceil(source.length / rows.length);
    const els = rows.map((row, i) => makeRow(row, source.slice(i * per, (i + 1) * per)));
    wrap.replaceChildren(...els);
    marquees = initMarquees(wrap);
  };

  render();
  mobile.addEventListener("change", render);
}

function makeRow({ direction, speed, start }, items) {
  const el = document.createElement("div");
  el.className = "marquee";
  el.setAttribute("data-marquee", "");
  el.setAttribute("data-hover-pause", "");
  el.dataset.direction = direction;
  el.dataset.speed = String(speed);
  el.dataset.start = String(start);
  const track = document.createElement("ul");
  track.className = "marquee__track";
  items.forEach((item) => track.appendChild(item.cloneNode(true)));
  el.appendChild(track);
  return el;
}
