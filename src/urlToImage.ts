import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

const urlToImage = async (options: puppeteer.Viewport & { type?: puppeteer.ScreenshotOptions["type"], ogImageSelector?: string, waitUntil: puppeteer.PuppeteerLifeCycleEvent }, urlPaths: { url: string, path: string }[]) => {
  const { type, ogImageSelector, waitUntil, ...viewPortOptions } = options;

  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: viewPortOptions ? viewPortOptions : null,
  });

  await Promise.all(urlPaths.map(async (urlPath) => {
    const dir = path.dirname(urlPath.path);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const page = await browser.newPage();

    await page.goto(urlPath.url, {
      waitUntil
    });
  
    let target: Pick<puppeteer.Page, "screenshot"> = page;
    try {
      if (ogImageSelector) {
        await page.waitForSelector(ogImageSelector, { timeout: 100 });
        target = await page.$(ogImageSelector) || page;
      }
    }
    catch {
      target = page;
    }
    await target.screenshot({ omitBackground: true, path: urlPath.path, type });
    console.log(`Saved screenshot of ${urlPath.url} to ${urlPath.path}`);
  
    await page.close();
  }));
  await browser.close();
};

export default urlToImage;