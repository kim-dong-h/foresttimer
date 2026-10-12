# 초기 본문 및 모바일 성능 개선

검증일: 2026-10-12 (Asia/Seoul)

## 변경

- Vite 빌드 후 React 기본 화면을 HTML로 사전 렌더링한다. 대상은 `/`, `/kr/`, `/us/`, `/percent/`, `/percent/us/`이며, 완성된 HTML을 Cloudflare Workers Static Assets에 배포한다.
- 각 페이지 하단에 한국어·영어 기능 설명과 펼쳐 읽는 사용 안내를 추가했다. 같은 안내가 최초 HTML과 JavaScript 실행 후 화면에 모두 남는다. 숨긴 검색 전용 콘텐츠는 없다.
- 타이머 기본 상태, 계산 예시, 평균 매수 시뮬레이션도 최초 HTML에 포함된다. JavaScript를 끈 상태에서 5개 페이지의 제목·기본 화면·안내를 실제 브라우저로 확인했다. 조작에는 JavaScript가 필요하다는 안내도 표시한다.
- 빌드에서는 개인 저장소를 사용하지 않는다. 앱은 브라우저에서 기존 저장소를 읽어 정령과 숲을 복원한다. 개인화된 정령 이미지를 최초 HTML에서 제외해 다른 정령을 중복 다운로드하지 않는다.
- 사용 중인 PNG 19개를 무손실 WebP로 전환했다. 원본 치수, alpha 채널 및 alpha가 0이 아닌 모든 픽셀의 RGB가 동일함을 검사했다. 제작용 PNG는 유지한다.
- 식물이 없어도 5종 이미지를 내려받고 295개 텍스처를 만들던 경로를 제거했다. 현재 숲에서 필요한 종류·크기만 처리하고, 두 렌더링 레이어와 후속 요청이 캐시를 공유한다.
- 기존 타이머·계산기 UI를 유지하고 하단에 안내만 추가했다. 모바일 320px·390px와 데스크톱 화면을 검증했다.

## 수치

| 항목 | 수정 전 | 수정 후 |
| --- | ---: | ---: |
| 사용 이미지 19개의 합계 | 20,947,405 bytes | 13,951,148 bytes |
| 첫 방문 앱 자산 로드량 | 10,313,782 bytes | 3,028,570 bytes |
| 빈 숲에서 식물 이미지 요청 | 5개 | 0개 |
| 빈 숲에서 식물 텍스처 생성 | 구현상 295개 | 브라우저 측정 0개 |
| 800개 식물 상태의 텍스처 생성 | 구현상 295개 | 브라우저 측정 119개 |

이미지 파일 합계는 약 33.4%, 초기 앱 자산 로드량은 약 70.6% 감소했다. 초기 자산 수치는 Chrome의 390×844 뷰포트, 빈 저장소, 같은 새싹 정령 상태, 로컬 Vite 미리보기에서 측정한 이미지·JavaScript·CSS·폰트 응답 본문 크기 합계다. Google Analytics와 AdSense 외부 요청은 차단하고 제외했다. 운영 환경의 전송 압축·캐시·광고 및 네트워크 상태에 따른 LCP·INP 점수나 체감 시간은 별도로 측정해야 한다.

## 통과한 검증

- pnpm 10.11.1을 사용한 `pnpm run build`: 성공, HTML 5개 모두 사전 렌더링.
- Node 기존 테스트와 새 텍스처 캐시 테스트: 총 86개 통과.
- 모바일 브라우저: 시작, 일시정지, 초기화, 2초 타이머 완료, 집중 모드의 초기화 확인, 빗소리와 음소거.
- 한국어·영어 계산기: 1,000에 10%를 적용하면 1,100 표시.
- 저장된 숲: 1시간·식물 2개 및 400시간·식물 800개를 그대로 복원. 필요한 텍스처만 생성.
- 언어별 5개 페이지: JavaScript를 끈 상태에서도 기본 화면과 본문 표시.
- 최초 HTML의 타이머·계산기 이동 링크, canonical·hreflang 및 기존 GA4·AdSense 코드의 단일 포함도 검증했다. `/kr/`에서도 계산기로 정상 이동한다.
- 320px·390px 모바일: 문서의 가로 넘침 없음. 데스크톱에서도 기존 타이머 배치 유지.
- Cloudflare Wrangler 4.149.0 로컬 서버: 공개 페이지 5개 HTTP 200·`text/html; charset=utf-8`.
- 같은 서버: `/sitemap.xml` HTTP 200·`application/xml; charset=utf-8`, `/robots.txt` 및 `/ads.txt` HTTP 200·`text/plain; charset=utf-8`, 숲 배경 HTTP 200·`image/webp`.

## 자료와 배포

- [개선 전 자산 요청](performance-before.json)
- [개선 후 자산 요청](performance-after.json)
- [원본별 이미지 용량 및 픽셀 검증](image-optimization.json)
- [800개 식물 상태](full-forest-performance.json)
- [개선 전 모바일 화면](mobile-before-performance.png)
- [개선 후 모바일 화면](mobile-after-performance.png)
- [JavaScript를 끈 모바일 화면](mobile-no-javascript.png)
- [개선 후 데스크톱 화면](desktop-after-performance.png)

운영 배포는 실행하지 않았다. 변경 파일을 GitHub에 커밋·푸시하고 기존 Cloudflare 빌드 명령 `pnpm run build`로 재배포하면 된다. 추가 런타임 의존성은 없다.
