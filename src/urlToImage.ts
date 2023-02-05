import * as fs from 'fs';
import * as path from 'path';
import { Viewport, ScreenshotOptions, PuppeteerLifeCycleEvent, launch, Page, ElementHandle} from 'puppeteer';

const urlToImage = async (options: Viewport & { type?: ScreenshotOptions["type"], ogImageSelector?: string, waitUntil: PuppeteerLifeCycleEvent }, urlPaths: { url: string, path: string }[]) => {
  const { type, ogImageSelector, waitUntil, ...viewPortOptions } = options;

  const browser = await launch({ 
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
  
    let target: ElementHandle<Element> | null = null;
    
    if (ogImageSelector) {
      try
      {
        await page.waitForSelector(ogImageSelector);
        target = await page.$(ogImageSelector);
      } catch {}

      if (target) {
        await target.screenshot({ omitBackground: true, path: urlPath.path, type });
      }
    }

    if (!target) {
      await page.screenshot({ omitBackground: true, path: urlPath.path, type });
    }
    console.log(`Saved screenshot of ${urlPath.url} to ${urlPath.path}`);
  
    await page.close();
  }));
  await browser.close();
};

export default urlToImage;