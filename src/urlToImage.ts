import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

const urlToImage = async (options: puppeteer.Viewport & { type?: puppeteer.ScreenshotOptions["type"], ogImageSelector?: string }, urlPaths: { url: string, path: string }[]) => {
  const { type, ogImageSelector, ...viewPortOptions } = options;

  const browser = await puppeteer.launch();

  await Promise.all(urlPaths.map(async (urlPath) => {
    const dir = path.dirname(urlPath.path);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const page = await browser.newPage();
    viewPortOptions && await page.setViewport(viewPortOptions)

    await page.goto(urlPath.url, {
      waitUntil: "networkidle0"
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