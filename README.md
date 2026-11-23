# alphaflow-guide

`@alpphaflow2027` 무료 자료 2종을 입력·로그인 없이 바로 읽는 모바일 뷰어.

- 라이브: https://setoo28-hue.github.io/alphaflow-guide/
- 구성: `index.html` + `assets/style.css` + `assets/app.js` (빌드 없음, 정적 3파일)
- 내용: 「온라인 상점 수익화 세팅법 10장」, 「2027 머니 트렌드 미리보기 5쪽」 + 3단 가격 타임라인 CTA
- 개인정보 입력 필드 없음(의도), 외부 추적 스크립트 없음

## 배포 메모

GitHub Pages가 **`gh-pages` 브랜치**를 배포 소스로 사용 중입니다(Pages API 권한이 없어 앱에서 소스 변경 불가).
수정 시 두 브랜치를 같이 올립니다.

```
git push origin main
git branch -f gh-pages main && git push -f origin gh-pages
```

소스를 `main`으로 바꾸려면 저장소 Settings → Pages → Branch를 `main`으로 변경하면 됩니다.
