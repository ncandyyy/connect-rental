# 영상 파일 (첨부 GIF → 영상)

디자인에서 정지 이미지로 들어가 있던 두 화면을 첨부해주신 GIF 로 움직이게 했습니다.
GIF 는 용량이 커서(결제 GIF 9.4MB) 페이지가 느려지기 때문에, 같은 화면을 **mp4 / webm 영상**으로 바꿔 넣었습니다.
겉보기는 GIF 와 같고(소리 없음, 자동 반복), 화면에 보일 때만 재생됩니다.

| 파일 | 원본 GIF | 위치 | 용량 |
| --- | --- | --- | --- |
| `connect-pay.mp4` / `.webm` | `gif_01_pay_v2.gif` (854×1234, 9.4MB) | 패키지 1번 카드 "커넥트로 결제부터 리뷰까지" | 약 85KB / 29KB |
| `connect-benefit.mp4` / `.webm` | `gif_04_marketing.gif` (1084×1568, 0.6MB) | 패키지 2번 카드 "자동으로 혜택 제공" | 약 51KB / 43KB |

- 폭 560px(화면 칸의 약 2.4배, 레티나 선명도), 원본 재생 시간 그대로(결제 6초, 혜택 4초) 반복
- 혜택 GIF 의 투명 모서리는 카드 배경(흰색)으로 채웠습니다
- 영상이 준비되기 전·모션 최소화 설정에서는 첫 장면 이미지(`assets/images/package/connect-*-poster.webp`)가 보입니다

## 영상을 바꿀 때

새 GIF 를 받으면 아래처럼 변환해서 같은 이름으로 덮어쓰고, `index.html` 의 `?v=1` 숫자를 하나 올려주세요.
(첫 장면 이미지도 함께 바꾸면 좋습니다)

```bash
# 결제 화면 (배경이 있는 GIF)
ffmpeg -i 새파일.gif -vf "scale=560:-2:flags=lanczos,format=yuv420p" -c:v libx264 -crf 22 -preset slow -movflags +faststart -an connect-pay.mp4
ffmpeg -i 새파일.gif -vf "scale=560:-2:flags=lanczos,format=yuv420p" -c:v libvpx-vp9 -crf 33 -b:v 0 -an connect-pay.webm

# 투명 배경 GIF 는 흰색 위에 합성 (1084x1568 자리에 원본 크기를 넣으세요)
ffmpeg -i 새파일.gif -filter_complex "color=c=white:s=1084x1568:r=30[bg];[bg][0:v]overlay=shortest=1,fps=30,scale=560:-2:flags=lanczos,format=yuv420p" -c:v libx264 -crf 22 -preset slow -movflags +faststart -an connect-benefit.mp4

# 첫 장면 이미지
ffmpeg -i connect-pay.mp4 -frames:v 1 첫장면.png   # → webp 로 저장해 assets/images/package/ 에 넣기
```
