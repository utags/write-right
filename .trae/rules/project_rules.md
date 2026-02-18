# 项目规则（write-right）

本文件用于约定本项目在 Trae 中协作时需要遵守的规则，重点包括构建命令、代码风格以及对老设备的兼容性要求。

## 基本命令

- 构建产物：
  - `npm run build`
- 静态服务（本地预览 `dist/`）：
  - `npm start`（等价于 `npx serve dist`）
- 代码检查：
  - 代码格式与 ESLint 类检查：
    - `npm run lint`（内部为 `prettier` + `xo`）
    - 快速修复代码格式和部分问题：`npm run lint:code`
  - TypeScript 类型检查：
    - `npm run lint:type`
- 单元测试：
  - `npm test`（使用 Vitest）

在提交或重大改动前，建议至少运行：

- `npm run lint:type`
- `npm run build`

## 代码风格与约定

- 使用 TypeScript + 原生 DOM，打包工具为 `esbuild`。
- 严格禁止在源码中新增多余的调试输出：
  - 提交前去掉 `console.log` / `console.debug` 等调试语句（保留已有必要日志除外）。
- 不在源码中添加随意注释，只保留必要且简短的说明。
- DOM 查询与遍历：
  - 统一使用 `$$` 工具函数包装 `querySelectorAll`，避免直接依赖 `NodeList` 可迭代性：
    - 工具位置：`src/utils.ts`
    - 使用方式：
      - `$$<HTMLElement>('[data-i18n]')`
      - `$$<HTMLElement>('.char-item', this.listEl)`
  - 单元素查询仍可以使用 `document.querySelector` / `element.querySelector`。
- 语言与文案：
  - 所有面向用户的字符串通过 `TRANSLATIONS` 管理（`src/main.ts`）。
  - 新增 UI 文案时，保持至少 `zh-CN` / `zh-TW` / `en` 三种语言的键值齐全。

## 老设备兼容性要求

本项目需要兼容以下旧设备 / 浏览器环境：

- iPhone 6 系列（iOS 9+ Safari）
- iPad 2（iOS 9+ Safari）
- Android 6 及同代设备内置浏览器 / Chrome 旧版本

为保证兼容性，必须遵守以下原则：

### JavaScript 兼容性

- 语法目标：
  - TypeScript 使用 `ES2020` 类型库，但实际运行环境通过 `esbuild` 打包，并依赖 polyfill 保障兼容。
- 禁用或谨慎使用的特性（除非确认有 polyfill 且行为正确）：
  - 不直接依赖以下对象 / 方法在旧浏览器中的原生实现：
    - `NodeList.prototype[Symbol.iterator]`（例如 `for...of document.querySelectorAll(...)`）
    - `Array.from(NodeList)` / 展开运算符 `...[NodeList]`
    - 新增的 Web API（如 `IntersectionObserver` 等），若必须使用应加特性检测和降级方案。
- 对 DOM 集合的处理：
  - 一律通过 `$$` 将 `NodeList` 转为数组后再操作，避免依赖迭代器：
    - ✅ `for (const el of $$<HTMLElement>('[data-i18n]')) { ... }`
    - ✅ `const items = $$<HTMLElement>('.char-item', this.listEl)`
  - 不在业务代码中直接写：
    - `for (const el of document.querySelectorAll(...)) { ... }`
    - `[...document.querySelectorAll(...)]`
- Polyfill 约定（已在 `src/main.ts` 顶部统一引入）：
  - `whatwg-fetch`：提供 `fetch` 支持。
  - `promise-polyfill`：提供 `Promise` 支持。
  - `url-search-params-polyfill`：提供 `URLSearchParams` 支持。
  - 新增依赖时，如需要额外 polyfill，务必集中在入口文件统一引入。

### CSS 与布局兼容性

- 尽量避免依赖旧浏览器不支持的 CSS 特性：
  - `gap`：如需使用，确保已有 margin 备选方案。
  - `aspect-ratio`：已经通过 JS 和其他布局方案处理，不再新增依赖。
  - CSS 变量（`var(--xxx)`）已经是项目基础；在极端旧环境下若需要回退，需要通过构建或额外样式处理。
- 布局与尺寸：
  - Tianzige（田字格）区域、双栏布局等已通过 JS 动态计算，修改时保持对小屏和老设备的宽高估算准确。

### PWA / Service Worker

- Service Worker 代码位于 `src/sw.js`，构建后输出为 `dist/sw.js`。
- 缓存策略：
  - `/data/` 下的汉字数据使用 Cache First 策略。
  - App Shell 使用 Stale-While-Revalidate 策略，优先返回旧缓存，同时后台更新。
- 对于老设备：
  - 如不支持 Service Worker（例如非常老的浏览器），应用必须仍然可正常工作，SW 仅作为增强特性。

## 隐私与页面路由约定

- 隐私页模板：`src/privacy.html`，构建后会生成多语言版本：
  - `/privacy.html`
  - `/zh-CN/privacy.html`
  - `/zh-TW/privacy.html`
  - `/en/privacy.html`
- PWA standalone 模式下，“隐私政策”链接应在外部浏览器中打开（带地址栏），相关逻辑在 `src/main.ts` 中已实现，后续修改需保持这一行为。
