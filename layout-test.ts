import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  // Check positions
  const menubarRect = await page.evaluate(() => {
    const el = document.querySelector('.menubar');
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return { left: r.left, top: r.top, width: r.width, height: r.height, pos: cs.position, z: cs.zIndex };
  });

  const dockRect = await page.evaluate(() => {
    const el = document.querySelector('.dock-container');
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return { left: r.left, top: r.top, width: r.width, height: r.height, pos: cs.position, z: cs.zIndex, flexDir: cs.flexDirection };
  });

  const appleDropdown = await page.evaluate(() => {
    const el = document.querySelector('#apple-dropdown');
    const cs = window.getComputedStyle(el);
    return { pos: cs.position, z: cs.zIndex, top: cs.top, left: cs.left };
  });

  console.log("Menubar:", menubarRect);
  console.log("Dock:", dockRect);
  console.log("Apple Dropdown:", appleDropdown);

  await browser.close();
})();
