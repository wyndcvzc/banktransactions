const { chromium } = require('C:/Users/Administrator/.workbuddy/binaries/node/versions/22.22.2-6/node_modules/@playwright/cli/node_modules/playwright');
const { readFileSync } = require('fs');

(async () => {
  const svg = readFileSync('C:/Users/Administrator/banktransactions/store/assets/bill-icon.svg', 'utf-8');
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 128, height: 128 } });

  // 128 / 48 / 16 三档，透明背景，SVG 等比缩放（留 4% 呼吸边）。
  const sizes = [
    { size: 128, out: 'C:/Users/Administrator/banktransactions/bill-128.png' },
    { size: 48,  out: 'C:/Users/Administrator/banktransactions/bill-48.png' },
    { size: 16,  out: 'C:/Users/Administrator/banktransactions/bill-16.png' },
  ];
  for (const { size, out } of sizes) {
    const pad = Math.round(size * 0.04);
    await page.setContent(
      `<html><body style="margin:0;background:transparent">
        <div style="width:${size}px;height:${size}px">${svg.replace('<svg ', `<svg style="width:100%;height:100%;display:block;padding:${pad}px;box-sizing:border-box" `)}</div>
      </body></html>`,
      { waitUntil: 'load' },
    );
    await page.setViewportSize({ width: size, height: size });
    await page.screenshot({ path: out, omitBackground: true });
    console.log('saved', out);
  }
  await browser.close();
})();
