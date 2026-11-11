const { chromium } = require('C:/Users/Administrator/.workbuddy/binaries/node/versions/22.22.2-6/node_modules/@playwright/cli/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await page.goto('file:///C:/Users/Administrator/banktransactions/store/shot-src.html');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshot-1280x800.png' });
  await browser.close();
  console.log('shot saved');
})();
