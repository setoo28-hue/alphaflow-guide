"""알파플로우 2027 뷰어 검증 — 390px 모바일, 무료/잠금 두 상태."""
import json, sys, re
from playwright.sync_api import sync_playwright

URL = "https://setoo28-hue.github.io/alphaflow-guide/"
report = {}

def run(page, url, tag, shots):
    errors = []
    page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    page.goto(url, wait_until="networkidle")
    page.wait_for_timeout(800)
    info = page.evaluate("""() => {
      const q = s => document.querySelector(s);
      const cs = (s) => { const e=q(s); if(!e) return null; const c=getComputedStyle(e); return {display:c.display, filter:c.filter, maxHeight:c.maxHeight, opacity:c.opacity}; };
      const lock = q('#lockCard');
      const lr = lock ? lock.getBoundingClientRect() : null;
      return {
        locked: document.documentElement.classList.contains('is-locked'),
        title: document.title,
        s3: cs('#s3'), s9: cs('#s9'),
        lockVisible: lock ? getComputedStyle(lock).display !== 'none' && lock.getBoundingClientRect().height > 0 : false,
        lockTop: lr ? Math.round(lr.top + window.scrollY) : null,
        lockBtn: q('#lockCard .btn') ? q('#lockCard .btn').getAttribute('href') : null,
        pays: q('#lockCard .btn') ? q('#lockCard .btn').textContent.trim() : null,
        whenFree: [...document.querySelectorAll('.when-free')].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.textContent.trim()),
        whenPaid: [...document.querySelectorAll('.when-paid')].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.textContent.trim()),
        heroH1: q('h1').innerText,
        heroLead: q('.hero .lead').innerText,
        bodyText: document.body.innerText.length,
        scrollH: document.documentElement.scrollHeight,
        hasName: /권성현|클라이짐|klygym|설화/i.test(document.body.innerText),
      };
    }""")
    info["errors"] = errors
    info["url"] = page.url
    report[tag] = info
    for name, path, full in shots:
        page.screenshot(path=path, full_page=full)
    return info

with sync_playwright() as p:
    b = p.chromium.launch()
    for tag, url in (("free", URL), ("locked", URL + "?lock=1")):
        ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2,
                            is_mobile=True, has_touch=True, locale="ko-KR")
        page = ctx.new_page()
        shots = []
        if tag == "free":
            shots = [("free-full", f"downloads/alphaflow-free-viewer-v2-20261123.png", True),
                     ("free-top", f"browser/alphaflow-free-top-390.png", False)]
        else:
            shots = [("locked-full", f"downloads/alphaflow-lock-viewer-20261123.png", True),
                     ("locked-top", f"browser/alphaflow-lock-top-390.png", False)]
        info = run(page, url, tag, shots)
        if tag == "locked":
            # 목차 03 클릭 → 잠금 카드로 이동하는지
            page.evaluate("window.scrollTo(0,0)")
            page.click('#guide-setup .tnav a[href="#s3"]')
            page.wait_for_timeout(1200)
            info["navS3_target"] = page.evaluate("""() => {
              const c = document.querySelector('#lockCard').getBoundingClientRect();
              return {lockCardTopInView: Math.round(c.top), scrollY: Math.round(window.scrollY)};
            }""")
            info["navS3_marked"] = page.evaluate("document.querySelectorAll('.tnav a.is-pay').length")
            page.screenshot(path="browser/alphaflow-lock-card-390.png")
            # 잠금 카드 근접 컷
            el = page.query_selector('#lockCard')
            el.screenshot(path="downloads/alphaflow-lock-card-20261123.png")
        ctx.close()
    b.close()

print(json.dumps(report, ensure_ascii=False, indent=1))
