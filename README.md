# next-static-og-images
Generate static Open Graph images for Next.js at build time

## Getting started

### Installation

```npm i -D next-static-og-images```

or

```yarn add -D next-static-og-images```

### Building Open Graph images

Add next-static-og-images to your postbuild script

```json
{
  "build": "next build",
  "postbuild": "next-sitemap && next-static-og-images"
}
```

The sitemap.xml is used to identify pages that need Open Graph images generated. next-static-og-images works best with a sitemap generator like `next-sitemap` and assumes that a sitemap.xml file is created in the public directory.

### Add og:image meta tags

Add the og:image tags to your `_app.js` or to reference the generated images.

```
<meta property="og:image" content="{`${host}/open-graph${asPath == "/" ? "/index" : asPath}.png`}" />
<meta property="og:image:alt" content="..." />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

## Configuration options

property|description|type
:-----|:-----|:-----
saveLocation|Directory where images should be saved. This directory will be cleared on each build. Default `"./public/open-graph"`|string
sitemapFilename|File path to the sitemap.xml location. Default `"./public/sitemap.xml"`|string
screenshotType|Specify screenshot type, can be either jpeg or png. Defaults to `"png"`.|string
width|Page width used to create screenshot. Default `1200`|number
height|Page height used to create screenshot. Default `630`|number
deviceScaleFactor|Page device scale factor used to create screenshot. See [devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) for more info. Default `1`|number
ogImageSelector|If specified, screenshot will be based on the first instance a matching instance. If no elements match, the page will be used. Default `undefined`|string

Image sizes will match the page height and width unless an image selector is used.

## Contribution

PRs welcome
