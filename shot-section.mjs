import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const selector = process.argv[3] || '#nosotros';
const label = process.argv[4] || 'section';
const outDir = path.join(__dirname, 'temporary screenshots');
fs.mkdirSync(outDir, { recursive: true });

const existing = fs.readdirSync(outDir).filter((f) => /^screenshot-\d+/.test(f));
const next = existing.length
  ? Math.max(...existing.map((f) => Number(f.match(/^screenshot-(\d+)/)[1]))) + 1
  : 1;
const file = path.join(outDir, `screenshot-${next}-${label}.png`);

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
const el = await page.$(selector);
await el.scrollIntoView();
await new Promise((r) => setTimeout(r, 800));
// Use bounding box screenshot so we capture even tall elements clipped at viewport
const box = await el.boundingBox();
if (box) {
  await page.setViewport({ width: 1440, height: Math.ceil(box.y + box.height + 100), deviceScaleFactor: 1 });
  await new Promise((r) => setTimeout(r, 300));
}
await el.screenshot({ path: file });
await browser.close();
console.log(file);
