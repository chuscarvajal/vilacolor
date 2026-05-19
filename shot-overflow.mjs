import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const selector = process.argv[3] || '#cita';
const extra = Number(process.argv[4] || 250);
const label = process.argv[5] || 'overflow';

const outDir = path.join(__dirname, 'temporary screenshots');
const existing = fs.readdirSync(outDir).filter((f) => /^screenshot-\d+/.test(f));
const next = existing.length ? Math.max(...existing.map((f) => Number(f.match(/^screenshot-(\d+)/)[1]))) + 1 : 1;
const file = path.join(outDir, `screenshot-${next}-${label}.png`);

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
const sec = await page.$(selector);
const box = await sec.boundingBox();
await page.setViewport({ width: 1440, height: Math.ceil(box.y + box.height + extra + 50), deviceScaleFactor: 1 });
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: file, clip: { x: 0, y: box.y, width: 1440, height: box.height + extra } });
await browser.close();
console.log(file);
