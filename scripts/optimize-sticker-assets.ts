/// <reference lib="dom" />

import { chromium } from '@playwright/test';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const APPROVED_STICKERS = [
  ['sunny-sticker-v1-preview.png', 'sunny-sticker.webp'],
  ['cloud-sticker-v2-preview.png', 'cloud-sticker.webp'],
  ['biscuit-sticker-v1-preview.png', 'biscuit-sticker.webp'],
  ['juniper-sticker-v1-preview.png', 'juniper-sticker.webp'],
  ['moonbeam-sticker-v1-preview.png', 'moonbeam-sticker.webp'],
  ['patches-sticker-v1-preview.png', 'patches-sticker.webp'],
  ['gizmo-sticker-v1-preview.png', 'gizmo-sticker.webp'],
  ['pepper-sticker-v1-preview.png', 'pepper-sticker.webp'],
  ['aurora-sticker-v1-preview.png', 'aurora-sticker.webp'],
  ['comet-sticker-v1-preview.png', 'comet-sticker.webp'],
  ['button-bunny-sticker-v1-preview.png', 'button-bunny-sticker.webp'],
] as const;

const SOURCE_DIRECTORY = resolve('src/dev/assets');
const OUTPUT_DIRECTORY = resolve('public/collectibles');
const WEBP_QUALITY = 0.86;

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  for (const [sourceName, outputName] of APPROVED_STICKERS) {
    const sourcePath = resolve(SOURCE_DIRECTORY, sourceName);
    const outputPath = resolve(OUTPUT_DIRECTORY, outputName);
    const source = await readFile(sourcePath);
    const sourceUrl = `data:image/png;base64,${source.toString('base64')}`;
    const encoded = await page.evaluate(
      async ({ sourceUrl: url, quality }) => {
        const image = new Image();
        image.src = url;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas 2D context is unavailable.');
        context.drawImage(image, 0, 0);
        const blob = await new Promise<Blob>((resolveBlob, reject) => {
          canvas.toBlob(
            (value) => (value ? resolveBlob(value) : reject(new Error('WebP encoding failed.'))),
            'image/webp',
            quality,
          );
        });
        const bytes = new Uint8Array(await blob.arrayBuffer());
        let binary = '';
        for (const byte of bytes) binary += String.fromCharCode(byte);
        return btoa(binary);
      },
      { sourceUrl, quality: WEBP_QUALITY },
    );
    await writeFile(outputPath, Buffer.from(encoded, 'base64'));
    const output = await stat(outputPath);
    console.log(`${sourceName} -> ${outputName} (${Math.round(output.size / 1_024)} KiB)`);
  }
} finally {
  await browser.close();
}
