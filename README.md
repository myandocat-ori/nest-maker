# 둥지메이커

코드 없이 드래그로 개인 홈페이지를 만드는 편집기예요. 서버 없이 정적 파일만으로 동작해요.

## 저작권

© 2026 duck. All rights reserved. 둥지메이커의 저작권은 duck에게 있어요. 자세한 내용은 `LICENSE.txt`를 보세요.

## 구성

- `index.html` — 화면 뼈대
- `css/app.css` — 편집기 스타일
- `js/app.js` — 편집기 동작
- `favicon.svg` — 아이콘
- `robots.txt` — 모든 페이지에 검색 제외(noindex) 표시를 넣어 두었어요. 크롤러가 표시를 읽도록 접근은 막지 않아요.

## 쓰는 법

- 작업 내용은 브라우저에서만 처리돼요(서버로 보내지 않아요). **💾 파일**에서 작업 파일(.json)로 저장해 두세요.
- 완성한 사이트는 **내보내기 → ZIP**으로 받아 Netlify · Cloudflare Pages · GitHub Pages 등에 올려요.

## 올리기 (GitHub Pages)

저장소의 **Settings → Pages**에서 Branch를 `main`, 폴더를 `/ (root)`로 정하고 Save.
