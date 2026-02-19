# 법인카드 사용내역 관리

Next.js + Prisma 기반 법인카드 사용내역 등록·조회 웹앱.

---

## 적용항목 색상 팔레트

적용항목은 **등록 순서(인덱스)** 기준으로 아래 색상이 순서대로 배정됩니다.
새 항목을 추가하면 아직 사용되지 않은 다음 색상이 자동으로 적용됩니다.
(7가지를 모두 사용하면 처음부터 순환)

| 순번 | 색상 이름 | 색상 코드 | 미리보기 |
|:---:|:---|:---:|:---:|
| 1 | 민트 틸 | `#2dd4bf` | ![#2dd4bf](https://placehold.co/60x20/2dd4bf/2dd4bf) |
| 2 | 골든 앰버 | `#fbbf24` | ![#fbbf24](https://placehold.co/60x20/fbbf24/fbbf24) |
| 3 | 소프트 인디고 | `#818cf8` | ![#818cf8](https://placehold.co/60x20/818cf8/818cf8) |
| 4 | 소프트 로즈 | `#fb7185` | ![#fb7185](https://placehold.co/60x20/fb7185/fb7185) |
| 5 | 스카이 블루 | `#38bdf8` | ![#38bdf8](https://placehold.co/60x20/38bdf8/38bdf8) |
| 6 | 에메랄드 | `#34d399` | ![#34d399](https://placehold.co/60x20/34d399/34d399) |
| 7 | 소프트 오렌지 | `#fb923c` | ![#fb923c](https://placehold.co/60x20/fb923c/fb923c) |

> 색상 배정 로직: `src/app/page.tsx` · `src/components/UsageForm.tsx` 의 `CATEGORY_COLORS` 배열 참고

---

## 개발 환경 실행

```bash
npm run dev
```

## 빌드

```bash
npm run build
npm run start
```
