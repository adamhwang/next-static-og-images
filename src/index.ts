import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import kill from 'tree-kill';
import { convertableToString, parseString } from 'xml2js';
import yargs from 'yargs';
import * as util from 'util';

import urlToImage from "./urlToImage";

(async () => {
    const { saveLocation, sitemapFilename, screenshotType, width, height, deviceScaleFactor } = await yargs(process.argv.slice(2))
        .default({
            saveLocation: './open-graph',
            sitemapFilename: 'sitemap.xml',
            screenshotType: 'png',
            width: 1200,
            height: 630,
            deviceScaleFactor: 1,
        })
        .argv;
    
    const sitemapXml = fs.readFileSync(path.join("./public/", sitemapFilename)).toString();
    const getSitemap = util.promisify<convertableToString, any>(parseString)(sitemapXml);

    const child = spawn('npm', ['start'], { shell: true });
    const getHost = new Promise<string>((resolve, reject) => {
        child.stdout.on('data', (data) => {
            const matchUrl = data.toString().match(/^ready.+url: ([^$]+)$/);
            if (matchUrl && matchUrl[1]) {
                resolve(matchUrl[1].trim());
            }
        });
        child.stderr.on('data', (err) => {
            reject(err.toString());
        });
    })

    try {
        const [sitemap, host] = await Promise.all([getSitemap, getHost]);
    
        const relativeUrls: string[] = sitemap.urlset.url.map((u: any) => new URL(u.loc[0]).pathname);

        const publicSaveLocation = path.join('./public', saveLocation);        
        if (fs.existsSync(publicSaveLocation)) {
            await util.promisify(fs.rm)(publicSaveLocation, { recursive: true });
            console.log(`Deleted folder ${publicSaveLocation}`);
        }

        await urlToImage({ type: screenshotType as "png" | "jpeg" | "webp", width, height, deviceScaleFactor }, relativeUrls.map(relativeUrl => {
            return {
                url: host + relativeUrl,
                path: path.join(publicSaveLocation, (relativeUrl === '/' ? 'index' : relativeUrl) + '.' + screenshotType),
            }
        }))
        
        child.pid && kill(child.pid);
    }
    catch (err) {
        child.pid && await util.promisify(kill)(child.pid);
    }
})();