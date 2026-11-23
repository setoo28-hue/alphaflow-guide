#!/usr/bin/env bash
# 알파플로우 2027 무료 뷰어 — 저장소 생성 후 배포 스크립트
# 사용: bash work/alphaflow-viewer/deploy.sh [owner/repo]
set -euo pipefail
REPO="${1:-setoo28-hue/alphaflow-guide}"
DIR="$(cd "$(dirname "$0")" && pwd)"

if ! gh repo view "$REPO" >/dev/null 2>&1; then
  echo "저장소 $REPO 가 없습니다. https://github.com/new?name=${REPO#*/}&visibility=public 에서 생성하세요." >&2
  exit 1
fi

cd "$DIR"
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$REPO.git"
git -c user.name="setoo28-hue" -c user.email="setoo28-hue@users.noreply.github.com" push -u origin main

# GitHub Pages 활성화 (이미 켜져 있으면 409 — 무시)
gh api -X POST "repos/$REPO/pages" --input - <<'JSON' >/dev/null 2>&1 || true
{"source":{"branch":"main","path":"/"}}
JSON

gh api -X PUT "repos/$REPO/pages" --input - <<'JSON' >/dev/null 2>&1 || true
{"source":{"branch":"main","path":"/"}}
JSON

OWNER="${REPO%%/*}"; NAME="${REPO##*/}"
URL="https://${OWNER}.github.io/${NAME}/"
echo "Pages URL: $URL"
for i in $(seq 1 30); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  echo "  try $i: HTTP $CODE"
  [ "$CODE" = "200" ] && break
  sleep 20
done
echo "$URL"
