const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const sharp = require('sharp')
const packageJson = require('./package.json')

async function build() {
  const distDir = path.join(__dirname, 'dist')

  // 1. Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true })
  }
  fs.mkdirSync(distDir)

  // 2. Build with esbuild
  const result = await esbuild.build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    outdir: 'dist',
    entryNames: '[name]-[hash]',
    minify: true,
    sourcemap: false,
    target: ['es2015'],
    format: 'iife',
    metafile: true,
    loader: {
      '.css': 'css',
      '.png': 'file',
      '.jpg': 'file',
      '.svg': 'file',
    },
  })

  // 3. Get generated filenames from metafile
  const outputs = Object.keys(result.metafile.outputs)
  const jsFile = outputs.find((f) => f.endsWith('.js') && !f.endsWith('.map'))
  const cssFile = outputs.find((f) => f.endsWith('.css') && !f.endsWith('.map'))

  const jsFileName = path.basename(jsFile)
  const cssFileName = cssFile ? path.basename(cssFile) : null

  console.log(`Generated: ${jsFileName}, ${cssFileName || 'no css file'}`)

  // 3.5 Generate PNG icons from SVG
  console.log('Generating PNG icons...')
  const iconSvgPath = path.join(__dirname, 'src', 'icon.svg')
  const iconsDir = path.join(distDir, 'icons')

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir)
  }

  if (fs.existsSync(iconSvgPath)) {
    try {
      await sharp(iconSvgPath)
        .resize(192, 192)
        .png()
        .toFile(path.join(iconsDir, 'icon-192.png'))

      await sharp(iconSvgPath)
        .resize(512, 512)
        .png()
        .toFile(path.join(iconsDir, 'icon-512.png'))

      console.log('Generated icon-192.png and icon-512.png')

      // Generate favicon.png (32x32) in dist root
      await sharp(iconSvgPath)
        .resize(32, 32)
        .png()
        .toFile(path.join(distDir, 'favicon.png'))
      console.log('Generated favicon.png')

      // Generate apple-touch-icon.png (180x180) in dist root
      await sharp(iconSvgPath)
        .resize(180, 180)
        .png()
        .toFile(path.join(distDir, 'apple-touch-icon.png'))
      console.log('Generated apple-touch-icon.png')

      // Generate apple-touch-startup-image.png (2048x2732) for iOS Splash Screen
      // Using a large portrait size with white background to cover most devices
      // NOTE: User requested specific sizes and media queries, so we will generate multiple files below.
      // This generic one might still be useful as fallback or we can remove it if we generate comprehensive set.
      // We will generate specific ones now.

      const iOSScreens = [
        // iPad Pro 12.9"
        { width: 2048, height: 2732, ratio: 2 },
        // iPad Pro 11" / iPad Air
        { width: 1668, height: 2388, ratio: 2 },
        // iPad 10.2"
        { width: 1620, height: 2160, ratio: 2 },
        // iPhone 14 Pro Max, 13 Pro Max, 12 Pro Max
        { width: 1290, height: 2796, ratio: 3 }, // Updated to 1290x2796 for 14 Pro Max
        { width: 1284, height: 2778, ratio: 3 }, // 12/13 Pro Max
        // iPhone 14 Pro, 13 Pro, 12 Pro, 12
        { width: 1179, height: 2556, ratio: 3 }, // 14 Pro
        { width: 1170, height: 2532, ratio: 3 }, // 12/13 Pro/12
        // iPhone 13 mini, 12 mini
        { width: 1080, height: 2340, ratio: 3 },
        // iPhone 11 Pro Max, XS Max
        { width: 1242, height: 2688, ratio: 3 },
        // iPhone 11, XR
        { width: 828, height: 1792, ratio: 2 },
        // iPhone 11 Pro, XS, X
        { width: 1125, height: 2436, ratio: 3 },
        // iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus
        { width: 1242, height: 2208, ratio: 3 },
        // iPhone 8, 7, 6s, 6, SE 2nd/3rd Gen
        { width: 750, height: 1334, ratio: 2 },
        // iPhone SE 1st Gen, 5s, 5
        { width: 640, height: 1136, ratio: 2 },
      ]

      const splashLinks = []

      for (const screen of iOSScreens) {
        // Portrait
        const pFileName = `apple-splash-${screen.width}-${screen.height}.png`
        await sharp({
          create: {
            width: screen.width,
            height: screen.height,
            channels: 4,
            background: '#FDFDFD',
          },
        })
          .composite([
            {
              input: await sharp(iconSvgPath)
                .resize(
                  Math.round(screen.width * 0.2),
                  Math.round(screen.width * 0.2)
                )
                .toBuffer(), // Scale icon relative to screen width
              gravity: 'center',
            },
          ])
          .png()
          .toFile(path.join(distDir, pFileName))

        splashLinks.push(
          `<link rel="apple-touch-startup-image" media="(device-width: ${screen.width / screen.ratio}px) and (device-height: ${screen.height / screen.ratio}px) and (-webkit-device-pixel-ratio: ${screen.ratio}) and (orientation: portrait)" href="{{PREFIX}}${pFileName}" />`
        )

        // Landscape
        const lFileName = `apple-splash-${screen.height}-${screen.width}.png`
        await sharp({
          create: {
            width: screen.height,
            height: screen.width,
            channels: 4,
            background: '#FDFDFD',
          },
        })
          .composite([
            {
              input: await sharp(iconSvgPath)
                .resize(
                  Math.round(screen.height * 0.15),
                  Math.round(screen.height * 0.15)
                )
                .toBuffer(), // Slightly smaller relative icon for landscape? or same logic
              gravity: 'center',
            },
          ])
          .png()
          .toFile(path.join(distDir, lFileName))

        splashLinks.push(
          `<link rel="apple-touch-startup-image" media="(device-width: ${screen.width / screen.ratio}px) and (device-height: ${screen.height / screen.ratio}px) and (-webkit-device-pixel-ratio: ${screen.ratio}) and (orientation: landscape)" href="{{PREFIX}}${lFileName}" />`
        )
      }

      console.log('Generated iOS splash screens')

      // Store splashLinks for injection later
      global.splashLinksTemplate = splashLinks.join('\n    ')
    } catch (err) {
      console.error('Error generating PNG icons:', err)
    }
  } else {
    console.warn('src/icon.svg not found, skipping PNG generation')
  }

  // 4. Process index.html variants
  const srcHtmlPath = path.join(__dirname, 'src', 'index.html')
  const baseHtmlContent = fs.readFileSync(srcHtmlPath, 'utf8')

  // Define variants
  const variants = [
    {
      lang: 'zh-CN',
      dir: '', // Root
      manifest: 'manifest.json',
      dataRoot: 'data/',
      jsPrefix: './',
      cssPrefix: './',
      swPrefix: './', // Register sw.js
    },
    {
      lang: 'zh-CN',
      dir: 'zh-CN',
      manifest: 'manifest-zh-CN.json',
      dataRoot: '../data/',
      jsPrefix: '../',
      cssPrefix: '../',
      swPrefix: '../',
    },
    {
      lang: 'zh-TW',
      dir: 'zh-TW',
      manifest: 'manifest-zh-TW.json',
      dataRoot: '../data/',
      jsPrefix: '../',
      cssPrefix: '../',
      swPrefix: '../',
    },
    {
      lang: 'en',
      dir: 'en',
      manifest: 'manifest-en.json',
      dataRoot: '../data/',
      jsPrefix: '../',
      cssPrefix: '../',
      swPrefix: '../',
    },
  ]

  const generatedFiles = []

  variants.forEach((variant) => {
    const variantDir = path.join(distDir, variant.dir)
    if (!fs.existsSync(variantDir)) {
      fs.mkdirSync(variantDir, { recursive: true })
    }

    let htmlContent = baseHtmlContent

    // Inject JS
    htmlContent = htmlContent.replace(
      /<script src=".*main\.js.*"/,
      `<script src="${variant.jsPrefix}${jsFileName}"`
    )

    // Inject CSS
    if (cssFileName) {
      htmlContent = htmlContent.replace(
        /<link rel="stylesheet" href="styles\.css"/,
        `<link rel="stylesheet" href="${variant.cssPrefix}${cssFileName}"`
      )
    }

    // Inject Manifest & Update Title/Description
    // Inject Favicon & Apple Touch Icon (Before Manifest)
    htmlContent = htmlContent.replace(
      /<link rel="manifest"/,
      `<link rel="icon" type="image/png" href="${variant.jsPrefix}favicon.png" />
    <link rel="apple-touch-icon" href="${variant.jsPrefix}apple-touch-icon.png" />
    <link rel="manifest"`
    )

    // Ensure manifest exists in the variant directory
    const srcManifestPath = path.join(__dirname, 'src', variant.manifest)
    let manifestName = '一笔一画 - 笔顺快查极简工具' // Default fallback
    let manifestShortName = '一笔一画' // Default fallback
    let manifestDesc = '学习汉字笔顺的单页面 Web 应用' // Default fallback

    if (fs.existsSync(srcManifestPath)) {
      // Parse manifest to update icon paths if needed
      try {
        const manifestContent = JSON.parse(
          fs.readFileSync(srcManifestPath, 'utf8')
        )

        // Use manifest name/desc for HTML injection
        if (manifestContent.name) manifestName = manifestContent.name
        if (manifestContent.short_name)
          manifestShortName = manifestContent.short_name
        if (manifestContent.description)
          manifestDesc = manifestContent.description

        // Update icon paths for subdirectories
        // If variant.dir is not empty (i.e., not root), prepend ../ to icon paths
        // BUT ONLY if the path is relative or starts with / but we want to be relative to the manifest location?
        // Actually, if src is "/icon.svg", it is absolute to the domain root.
        // If the app is deployed at domain root, "/icon.svg" works everywhere.
        // If the app is deployed in a subfolder (e.g. github pages), "/icon.svg" breaks.
        // Safer to use relative paths: "../icon.svg" for subdirs.

        if (variant.dir && manifestContent.icons) {
          manifestContent.icons.forEach((icon) => {
            // Remove leading slash if present to make it relative, then prepend prefix
            // Or just prepend prefix if it's a local file
            // Assuming icons are at root dist/
            // If icon.src is "/icon.svg", and we want relative, it should be "../icon.svg"
            // If we use relative paths in manifest, they are relative to manifest URL.

            // Let's normalize: force relative path to root
            let cleanPath = icon.src.startsWith('/')
              ? icon.src.substring(1)
              : icon.src

            // If it's already a relative path structure we don't want to break it, but we know our structure.
            // dist/icon.svg is the target.
            // dist/zh-CN/manifest.json needs to point to ../icon.svg

            // However, the current manifest uses "/icon.svg" (Absolute).
            // If we change it to relative, it's better for portability.

            if (variant.dir !== '') {
              // Subdirectory
              icon.src = '../' + cleanPath
            } else {
              // Root directory, ensure it's relative or absolute as preferred.
              // Let's keep it relative for safety: "icon.svg"
              icon.src = cleanPath
            }
          })
        }

        fs.writeFileSync(
          path.join(variantDir, 'manifest.json'),
          JSON.stringify(manifestContent, null, 2)
        )
        generatedFiles.push(path.join(variant.dir, 'manifest.json'))
      } catch (e) {
        console.warn(`Failed to process manifest: ${variant.manifest}`, e)
        // Fallback copy if parsing fails (though unlikely)
        fs.copyFileSync(srcManifestPath, path.join(variantDir, 'manifest.json'))
      }
    } else {
      console.warn(`Manifest not found: ${variant.manifest}`)
    }

    // Replace Title
    htmlContent = htmlContent.replace(
      /<title.*?>.*?<\/title>/,
      `<title data-i18n="app.pageTitle" data-short-name="${manifestShortName}">${manifestName}</title>`
    )

    // Replace Description
    htmlContent = htmlContent.replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${manifestDesc}" />`
    )

    // Update Logo Path in HTML
    // Assuming <img src="logo.svg" ...>
    // variant.jsPrefix is usually "./" or "../"
    // We can use that for logo as well.
    htmlContent = htmlContent.replace(
      /src="logo\.svg"/,
      `src="${variant.jsPrefix}logo.svg"`
    )

    // Update apple-touch-startup-image path
    if (global.splashLinksTemplate) {
      const splashLinks = global.splashLinksTemplate.replace(
        /{{PREFIX}}/g,
        variant.jsPrefix
      )
      htmlContent = htmlContent.replace(
        /<!-- SPLASH_SCREENS_PLACEHOLDER -->/,
        splashLinks
      )
    }

    // NOTE: The link tag in index.html is already <link rel="manifest" href="manifest.json" />
    // So we don't need to change the href if we copy manifest.json to the same directory.
    // However, we should double check if it's correct.
    // Yes, href="manifest.json" resolves to current directory.

    // Inject Lang and Data Root
    const scriptInject = `
    <script>
      window.HANZI_LANG = '${variant.lang}';
      window.HANZI_DATA_ROOT = '${variant.dataRoot}';
    </script>
    `
    htmlContent = htmlContent.replace('</head>', `${scriptInject}</head>`)

    // Update SW registration path
    if (variant.swPrefix !== './') {
      htmlContent = htmlContent.replace(
        /navigator\.serviceWorker\s*\.register\(['"]sw\.js['"]\)/,
        `navigator.serviceWorker.register('${variant.swPrefix}sw.js')`
      )
    }

    // Update HTML lang attribute
    htmlContent = htmlContent.replace(
      /<html lang="[^"]*"/,
      `<html lang="${variant.lang}"`
    )

    // Update Canonical URL
    const canonicalUrl = variant.dir
      ? `https://writeright.pipecraft.net/${variant.dir}/`
      : 'https://writeright.pipecraft.net/'

    htmlContent = htmlContent.replace(
      /<link rel="canonical" href=".*?" \/>/,
      `<link rel="canonical" href="${canonicalUrl}" />`
    )

    // Inject Version
    htmlContent = htmlContent.replace('{{VERSION}}', packageJson.version)

    fs.writeFileSync(path.join(variantDir, 'index.html'), htmlContent)
    generatedFiles.push(path.join(variant.dir, 'index.html'))
  })

  // Copy icon and logo to root
  fs.copyFileSync(
    path.join(__dirname, 'src', 'icon.svg'),
    path.join(distDir, 'icon.svg')
  )
  generatedFiles.push('icon.svg')

  fs.copyFileSync(
    path.join(__dirname, 'src', 'logo.svg'),
    path.join(distDir, 'logo.svg')
  )
  generatedFiles.push('logo.svg')

  // 6. Copy hanzi-writer-data
  const dataDir = path.join(distDir, 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
  }

  const sourceDataDir = path.join(
    __dirname,
    'node_modules',
    'hanzi-writer-data'
  )
  if (fs.existsSync(sourceDataDir)) {
    console.log('Copying hanzi-writer-data...')
    fs.cpSync(sourceDataDir, dataDir, { recursive: true })
  } else {
    console.warn('Warning: node_modules/hanzi-writer-data not found.')
  }

  // 7. Process sw.js
  const srcSwPath = path.join(__dirname, 'src', 'sw.js')
  let swContent = fs.readFileSync(srcSwPath, 'utf8')

  // Generate Privacy Policy Pages
  const privacyTemplate = fs.readFileSync(
    path.join(__dirname, 'src', 'privacy.html'),
    'utf8'
  )

  const privacyTranslations = {
    'zh-CN': {
      TITLE: '隐私政策',
      CONTENT: `
        <h3>1. 数据收集与使用</h3>
        <p><strong>本应用不收集、不存储、不共享任何用户个人信息。</strong>我们无需注册，无需登录即可使用。</p>
        <p>所有汉字笔顺数据的解析与渲染均在用户本地完成，无需连接服务器上传查询记录。</p>
        
        <h3>2. 第三方 SDK 声明</h3>
        <p><strong>本应用未集成任何第三方分析、广告或跟踪 SDK</strong>（如 Firebase, Google Analytics, Facebook SDK 等）。您的使用行为完全私密，不会被任何第三方追踪。</p>
        
        <h3>3. 技术性本地存储</h3>
        <p>本应用仅使用浏览器的 <strong>LocalStorage</strong> 来存储您的个性化设置（如笔画颜色、网格样式、语言偏好等）。这些数据仅保存在您的设备上，永远不会上传到服务器或离开您的设备。清除浏览器缓存或卸载应用即可完全删除这些数据。</p>
        
        <h3>4. 儿童隐私 (COPPA & GDPR-K)</h3>
        <p>由于本应用不收集任何个人信息，因此完全符合 <strong>COPPA</strong> (儿童在线隐私保护法) 和 <strong>GDPR-K</strong> 针对儿童隐私保护的要求。我们不向任何年龄段的用户请求数据，也不包含任何针对儿童的定向广告或追踪行为。</p>
        
        <h3>5. 权限说明</h3>
        <p>本应用不请求地理位置、摄像头、麦克风或通讯录等敏感权限。</p>
        
        <h3>6. 联系我们</h3>
        <p>如果您对本隐私政策有任何疑问，请通过 <a href="https://github.com/utags/write-right/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a> 联系我们。</p>
      `,
      BACK_TEXT: '返回应用',
    },
    'zh-TW': {
      TITLE: '隱私政策',
      CONTENT: `
        <h3>1. 數據收集與使用</h3>
        <p><strong>本應用不收集、不存儲、不共享任何用戶個人信息。</strong>我們無需註冊，無需登錄即可使用。</p>
        <p>所有漢字筆順數據的解析與渲染均在用戶本地完成，無需連接服務器上傳查詢記錄。</p>
        
        <h3>2. 第三方 SDK 聲明</h3>
        <p><strong>本應用未集成任何第三方分析、廣告或追踪 SDK</strong>（如 Firebase, Google Analytics, Facebook SDK 等）。您的使用行為完全私密，不會被任何第三方追踪。</p>
        
        <h3>3. 技術性本地存儲</h3>
        <p>本應用僅使用瀏覽器的 <strong>LocalStorage</strong> 來存儲您的個性化設置（如筆畫顏色、網格樣式、語言偏好等）。這些數據僅保存在您的設備上，永遠不會上傳到服務器或離開您的設備。清除瀏覽器緩存或卸載應用即可完全刪除這些數據。</p>
        
        <h3>4. 兒童隱私 (COPPA & GDPR-K)</h3>
        <p>由於本應用不收集任何個人信息，因此完全符合 <strong>COPPA</strong> (兒童在線隱私保護法) 和 <strong>GDPR-K</strong> 針對兒童隱私保護的要求。我們不向任何年齡段的用戶請求數據，也不包含任何針對兒童的定向廣告或追踪行為。</p>
        
        <h3>5. 權限說明</h3>
        <p>本應用不請求地理位置、攝像頭、麥克風或通訊錄等敏感權限。</p>
        
        <h3>6. 聯繫我們</h3>
        <p>如果您對本隱私政策有任何疑問，請通過 <a href="https://github.com/utags/write-right/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a> 聯繫我們。</p>
      `,
      BACK_TEXT: '返回應用',
    },
    en: {
      TITLE: 'Privacy Policy',
      CONTENT: `
        <h3>1. Data Collection and Use</h3>
        <p><strong>We do not collect, store, or share any personal information.</strong> No registration or login is required to use this app.</p>
        <p>All character stroke order data processing and rendering are performed locally on your device. No lookup records or usage data are uploaded to any server.</p>
        
        <h3>2. No Third-Party SDKs</h3>
        <p><strong>This app does not integrate any third-party analytics, advertising, or tracking SDKs</strong> (such as Firebase, Google Analytics, Facebook SDK, etc.). Your usage behavior is completely private and is not tracked by any third parties.</p>
        
        <h3>3. Technical Local Storage</h3>
        <p>This app only uses the browser's <strong>LocalStorage</strong> to store your personalized settings (such as stroke color, grid style, language preference, etc.). This data resides solely on your device and is never uploaded to any server or shared elsewhere. Clearing your browser cache or uninstalling the app will completely delete this data.</p>
        
        <h3>4. Children's Privacy (COPPA & GDPR-K)</h3>
        <p>As the app does not collect any personal information, it is fully compliant with <strong>COPPA</strong> (Children's Online Privacy Protection Act) and <strong>GDPR</strong> requirements for children's privacy. We do not solicit data from users of any age, nor do we include any targeted advertising or tracking directed at children.</p>
        
        <h3>5. Permissions</h3>
        <p>This app does not request sensitive permissions such as location, camera, microphone, or contacts.</p>
        
        <h3>6. Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, please contact us via <a href="https://github.com/utags/write-right/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a>.</p>
      `,
      BACK_TEXT: 'Back to App',
    },
  }

  variants.forEach((variant) => {
    const variantDir = path.join(distDir, variant.dir)
    const translation =
      privacyTranslations[variant.lang] || privacyTranslations['en']

    let privacyHtml = privacyTemplate
      .replace('{{LANG}}', variant.lang)
      .replace(/{{TITLE}}/g, translation.TITLE)
      .replace('{{CONTENT}}', translation.CONTENT)
      .replace('{{BACK_TEXT}}', translation.BACK_TEXT)
    // Removed apple-touch-startup-image injection for privacy.html as requested

    fs.writeFileSync(path.join(variantDir, 'privacy.html'), privacyHtml)
    generatedFiles.push(path.join(variant.dir, 'privacy.html'))
  })

  const filesToCache = [
    './',
    `./${jsFileName}`,
    cssFileName ? `./${cssFileName}` : '',
    ...generatedFiles.map((f) => `./${f}`),
    // Add common assets manually if not in generatedFiles
    // We added index.html and manifest.json for each variant to generatedFiles
  ].filter(Boolean)

  // Deduplicate and clean paths
  const uniqueFilesToCache = [...new Set(filesToCache)].map((p) =>
    p.replace(/\\/g, '/')
  )

  const urlsString = JSON.stringify(uniqueFilesToCache, null, 2)

  // Calculate hash based on files content to cache
  const hash = crypto
    .createHash('md5')
    .update(urlsString)
    .digest('hex')
    .slice(0, 8)
  const cacheName = `write-right-v${hash}`

  swContent = swContent.replace(
    /const APP_CACHE_NAME = .*/,
    `const APP_CACHE_NAME = '${cacheName}';`
  )

  swContent = swContent.replace(
    /const urlsToCache = \[[^\]]*\]/s,
    `const urlsToCache = ${urlsString};`
  )

  fs.writeFileSync(path.join(distDir, 'sw.js'), swContent)

  // 8. Copy assetlinks.json
  const assetLinksPath = path.join(__dirname, 'assetlinks.json')
  if (fs.existsSync(assetLinksPath)) {
    const wellKnownDir = path.join(distDir, '.well-known')
    if (!fs.existsSync(wellKnownDir)) {
      fs.mkdirSync(wellKnownDir)
    }
    fs.copyFileSync(assetLinksPath, path.join(wellKnownDir, 'assetlinks.json'))
    console.log('Copied assetlinks.json to dist/.well-known/')
  } else {
    console.warn('assetlinks.json not found in root, skipping.')
  }

  console.log('Build complete. Output directory: dist')
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
