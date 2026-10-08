# 마실 앱인토스 (WebView)

토스 미니앱용 마실 클라이언트. 위치: `MASYL/apps-in-toss`

가이드: [기존 웹 프로젝트에 SDK 연동하기](https://developers-apps-in-toss.toss.im/ai-vibe-coding/tutorials/webview)  
설정 파일은 SDK 3.x 기준 `apps-in-toss.config.ts`를 쓴다. ([마이그레이션](https://developers-apps-in-toss.toss.im/documentation/integration/sdk-3.x))

## 실행

```bash
cp apps-in-toss/.env.example apps-in-toss/.env
# VITE_API_URL, VITE_KAKAO_MAP_API_KEY 채우기
pnpm --filter @masyl/toss dev
```

브라우저: http://localhost:5180  
우측 하단 AIT Devtools로 위치 권한 등을 mock 할 수 있다.

딥링크(콘솔 `appName`과 같아야 함): `intoss://masyl`

## 스택

- `@apps-in-toss/web-framework` 3.x
- TDS `@toss/tds-mobile` / `@toss/tds-mobile-ait` 2.4.1
- 위치: `getCurrentLocation` ([문서](https://developers-apps-in-toss.toss.im/documentation/common/permission/location))
- 할인 데이터: 기존 Nest API `/discounts/nearby`

## 빌드 (.ait)

```bash
pnpm --filter @masyl/toss build
```

산출물:

- 웹 번들: `apps-in-toss/dist/`
- 앱 번들: `apps-in-toss/masyl.ait`

콘솔 업로드 전 CORS에 아래 Origin을 API에 허용해야 한다.

- `https://masyl.web.tossmini.com`
- `https://masyl.private-web.tossmini.com`
- 로컬: `http://localhost:5180`

콘솔에 등록한 `appName`이 `masyl`이 아니면 `apps-in-toss.config.ts`의 `appName`을 맞출 것.
