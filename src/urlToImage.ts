import * as fs from 'fs';
import * as path from 'path';
import { map } from 'bluebird';
import { Viewport, ScreenshotOptions, PuppeteerLifeCycleEvent, launch, Page, ElementHandle, Browser} from 'puppeteer';

const urlToImage = async (options: Viewport & { type?: ScreenshotOptions["type"], ogImageSelector?: string, waitUntil: PuppeteerLifeCycleEvent }, urlPaths: { url: string, path: string }[]) => {
  const { type, ogImageSelector, waitUntil, ...viewPortOptions } = options;

  const withBrowser = async (fn: (browser: Browser) => Promise<unknown>) => {
    const browser = await launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: viewPortOptions ? viewPortOptions : null,
    });
    try {
      return await fn(browser);
    } finally {
      await browser.close();
    }
  }
  
  const withPage = (browser: Browser) => async (fn: (page: Page) => Promise<unknown>) => {
    const page = await browser.newPage();
    try {
      return await fn(page);
    } finally {
      await page.close();
    }
  }

  await withBrowser(async (browser) => {
    await map(urlPaths, async (urlPath) => {
      const dir = path.dirname(urlPath.path);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      return withPage(browser)(async (page) => {
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
      });
    }, { concurrency: 6 });
  })
};

export default urlToImage;