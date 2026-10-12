# forest-timer.com 사이트맵 점검

점검일: 2026-10-12 (Asia/Seoul)

## 결론

운영 사이트에서는 Google Search Console의 **가져올 수 없음** 오류가 재현되지 않았다. 수정 전과 최종 확인 시 `/sitemap.xml`은 리다이렉트 없이 HTTP 200과 `application/xml`을 반환했고, `/robots.txt`는 HTTP 200과 `text/plain; charset=utf-8`을 반환했다. 사이트맵 본문은 HTML이 아닌 올바른 XML이었다. 이 결과만으로 과거 Google의 실패 원인을 특정할 수는 없다.

로컬 저장소에는 Wrangler 배포 설정과 MIME 타입을 명시하는 파일이 없었다. Cloudflare 기본 동작이 이미 정상인 상태지만 배포 설정에 의존하지 않도록 `wrangler.jsonc`와 `public/_headers`를 추가했다. 타이머 및 계산기의 JavaScript, HTML, CSS는 수정하지 않았다.

## 수정 및 검증

1. Vite 빌드 성공. `public/sitemap.xml`, `public/robots.txt`, `public/_headers`가 각각 `dist/` 루트에 원본과 동일한 내용으로 복사됨을 SHA-256으로 확인했다.
2. `wrangler.jsonc`에서 Worker 이름 `foresttimer`, 호환성 날짜 `2026-10-06`, 정적 파일 폴더 `./dist`를 지정했다.
3. `assets.not_found_handling: "none"`을 명시했다. 실제 HTML 파일을 가진 다중 페이지 구조이므로 SPA fallback이 필요 없다. 로컬에서 없는 `/missing-sitemap.xml`을 GET·HEAD로 요청하면 HTTP 404였고, 타이머 HTML로 대체되지 않았다.
4. `assets.html_handling: "auto-trailing-slash"`로 폴더의 `index.html`을 기존 공개 경로에서 제공한다.
5. `public/_headers`에서 `/sitemap.xml`에 `application/xml; charset=utf-8`, `/robots.txt`에 `text/plain; charset=utf-8`을 지정했다. Wrangler 4.149.0이 유효한 헤더 규칙 2개를 인식했다.
6. 빌드 사이트맵의 UTF-8 인코딩과 XML 파싱, `urlset` 네임스페이스, 중복 없는 4개 URL 및 해당 빌드 HTML 파일을 확인했다. 운영 사이트맵도 XML 파싱과 네임스페이스·4개 URL 검증을 통과했다.
7. 사이트맵의 `/`, `/us/`, `/percent/`, `/percent/us/`는 운영 환경에서도 리다이렉트 없이 모두 HTTP 200과 `text/html`을 반환했다. 페이지 응답에서 noindex 지시를 발견하지 않았다. `/kr/`는 한국어 타이머 중복 주소이므로 사이트맵에 추가하지 않았다.
8. 운영 robots.txt에 `Sitemap: https://forest-timer.com/sitemap.xml`이 있다. Cloudflare가 AI 수집 제한을 추가했으나 Googlebot을 차단하는 규칙은 없었다.
9. 일반 User-Agent와 Googlebot User-Agent 요청 모두 사이트맵·robots.txt를 가져올 수 있었다. Googlebot User-Agent를 사용하는 요청은 실제 Google 크롤러의 IP 및 보안 정책을 재현하는 검사는 아니다.

## HTTP 결과

| 환경 | 경로 | GET / HEAD | Content-Type |
| --- | --- | --- | --- |
| 운영 사이트 | `/sitemap.xml` | 200 / 200 | `application/xml` |
| 운영 사이트 | `/robots.txt` | 200 / 200 | `text/plain; charset=utf-8` |
| 수정한 Wrangler 로컬 서버 | `/sitemap.xml` | 200 / 200 | `application/xml; charset=utf-8` |
| 수정한 Wrangler 로컬 서버 | `/robots.txt` | 200 / 200 | `text/plain; charset=utf-8` |
| 수정한 Wrangler 로컬 서버 | `/missing-sitemap.xml` | 404 / 404 | 없음 |

세부 응답 결과는 `cloudflare-seo-http-audit.json`에 기록했다. 로컬 검증에는 `Accept: text/html` 및 `Sec-Fetch-Mode: navigate`도 사용하여 HTML 탐색 요청에서도 사이트맵을 직접 제공하는지 확인했다.

## 배포 상태 및 Search Console 후속 확인

새 파일은 로컬에서 수정·검증했으며 운영 배포는 실행하지 않았다. `wrangler whoami` 결과 이 PC는 Cloudflare에 인증되어 있지 않다. 기존 GitHub 연결을 통해 변경 파일을 커밋·푸시하고 Cloudflare Builds를 실행하면 설정이 반영된다. 빌드 명령은 `pnpm run build`, 배포 명령은 `npx wrangler deploy`이며 기존 CLI 옵션도 같은 값을 사용하므로 유지할 수 있다.

운영 사이트는 현재도 정상 응답한다. Search Console에는 `https://forest-timer.com/sitemap.xml`을 다시 제출하고, 오류가 계속되면 상세 오류 및 마지막 읽은 시각을 확인해야 한다. **URL 검사 → 실제 URL 테스트**의 페이지 가져오기 결과를 확인하고, 실제 Google 요청만 실패하면 Cloudflare 보안 이벤트에서 차단·챌린지 여부를 확인한다. 계정에 접근하지 않았으므로 Search Console의 현재 상태와 Cloudflare 보안 이벤트는 검증하지 않았다.

공식 참고:

- [Cloudflare Static Assets 헤더](https://developers.cloudflare.com/workers/static-assets/headers/)
- [Cloudflare Static Assets 설정](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Google Search Console 사이트맵 가져오기 오류 확인](https://support.google.com/webmasters/answer/7451001)
