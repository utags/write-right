import 'whatwg-fetch'
import 'promise-polyfill/src/polyfill'
import 'url-search-params-polyfill'
import HanziWriter from 'hanzi-writer'
import { createIcons } from './lucide-loader'
import X from 'lucide/dist/esm/lucide/src/icons/x.js'
import Search from 'lucide/dist/esm/lucide/src/icons/search.js'
import Settings from 'lucide/dist/esm/lucide/src/icons/settings.js'
import Play from 'lucide/dist/esm/lucide/src/icons/play.js'
import Pause from 'lucide/dist/esm/lucide/src/icons/pause.js'
import RotateCcw from 'lucide/dist/esm/lucide/src/icons/rotate-ccw.js'
import Pencil from 'lucide/dist/esm/lucide/src/icons/pencil.js'
import CirclePlay from 'lucide/dist/esm/lucide/src/icons/circle-play.js'
import Maximize from 'lucide/dist/esm/lucide/src/icons/maximize.js'
import Minimize from 'lucide/dist/esm/lucide/src/icons/minimize.js'
import {
  calculateLayoutMode,
  calculateTianzigeSize,
  DEFAULT_LAYOUT_CONFIG,
} from './layout'
import { generateIconSvg, svgToPngUrl } from './icon-generator'
import './styles.css'

interface Settings {
  themeColor: string
  strokeColor: string
  gridColor: string
  gridStyle: 'rice' | 'cross' | 'tic' | 'x'
  gridLineStyle: 'dashed' | 'solid' | 'dotted'
  language: 'zh-CN' | 'zh-TW' | 'en'
  defaultText: string
  rememberLastSearch: boolean
  enableIconUpdates: boolean
  iconStyle: 'default' | 'red-gold' | 'red-black' | 'custom'
  iconCustomBgColor: string
  iconCustomFgColor: string
  iconCustomGridColor: string
  iconRotate180: boolean
}

const DEFAULT_SETTINGS: Settings = {
  themeColor: '#4CAF50',
  strokeColor: '#555555',
  gridColor: '#e0e0e0',
  gridStyle: 'rice',
  gridLineStyle: 'dashed',
  language: 'zh-CN',
  defaultText: '汉字笔顺',
  rememberLastSearch: false,
  enableIconUpdates: true,
  iconStyle: 'default',
  iconCustomBgColor: '#4CAF50',
  iconCustomFgColor: '#ffffff',
  iconCustomGridColor: '#A5D6A7',
  iconRotate180: false,
}

const TRANSLATIONS = {
  'zh-CN': {
    'settings.title': '设置',
    'settings.themeColor': '主题颜色',
    'settings.strokeColor': '笔画颜色',
    'settings.gridColor': '田字格颜色',
    'settings.gridStyle': '格线样式',
    'settings.gridStyle.rice': '米字格',
    'settings.gridStyle.cross': '十字格',
    'settings.gridStyle.tic': '井字格',
    'settings.gridStyle.x': 'X字格',
    'settings.gridLineStyle': '线条类型',
    'settings.gridLineStyle.dashed': '虚线',
    'settings.gridLineStyle.solid': '实线',
    'settings.gridLineStyle.dotted': '点线',
    'settings.language': '语言',
    'settings.defaultText': '默认文本',
    'settings.rememberLastSearch': '记住最后查询',
    'settings.enableIconUpdates': '动态图标',
    'settings.iconStyle': '图标风格',
    'settings.iconStyle.default': '默认 (绿底白字)',
    'settings.iconStyle.redGold': '红底金字',
    'settings.iconStyle.redBlack': '红底黑字',
    'settings.iconStyle.custom': '自定义',
    'settings.iconBgColor': '背景颜色',
    'settings.iconFgColor': '文字颜色',
    'settings.iconGridColor': '格线颜色',
    'settings.iconRotate180': '图标倒置 (180°)',
    'settings.privacyPolicy': '隐私政策',
    'settings.projectUrl': '项目地址',
    'settings.feedback': '问题反馈',
    'settings.reset': '恢复默认设置',
    'settings.resetConfirm': '确定要恢复所有默认设置吗？此操作无法撤销。',
    'app.title': '一笔一画',
    'app.pageTitle': '一笔一画 - 笔顺快查极简工具',
    'app.inputPlaceholder': '请输入汉字...',
    'app.genBtn': '输入',
    'app.inputError': '请输入汉字',
    'app.modeQuiz': '开始描笔练习',
    'app.modePlay': '播放模式',
  },
  'zh-TW': {
    'settings.title': '設置',
    'settings.themeColor': '主題顏色',
    'settings.strokeColor': '筆畫顏色',
    'settings.gridColor': '田字格顏色',
    'settings.gridStyle': '格線樣式',
    'settings.gridStyle.rice': '米字格',
    'settings.gridStyle.cross': '十字格',
    'settings.gridStyle.tic': '井字格',
    'settings.gridStyle.x': 'X字格',
    'settings.gridLineStyle': '線條類型',
    'settings.gridLineStyle.dashed': '虛線',
    'settings.gridLineStyle.solid': '實線',
    'settings.gridLineStyle.dotted': '點線',
    'settings.language': '語言',
    'settings.defaultText': '默認文本',
    'settings.rememberLastSearch': '記住最後查詢',
    'settings.enableIconUpdates': '動態圖標',
    'settings.iconStyle': '圖標風格',
    'settings.iconStyle.default': '默認 (綠底白字)',
    'settings.iconStyle.redGold': '紅底金字',
    'settings.iconStyle.redBlack': '紅底黑字',
    'settings.iconStyle.custom': '自定義',
    'settings.iconBgColor': '背景顏色',
    'settings.iconFgColor': '文字顏色',
    'settings.iconGridColor': '格線顏色',
    'settings.iconRotate180': '圖標倒置 (180°)',
    'settings.privacyPolicy': '隱私政策',
    'settings.projectUrl': '項目地址',
    'settings.feedback': '問題反饋',
    'settings.reset': '恢復默認設置',
    'settings.resetConfirm': '確定要恢復所有默認設置嗎？此操作無法撤銷。',
    'app.title': '一筆一畫',
    'app.pageTitle': '一筆一畫 - 筆順快查極簡工具',
    'app.inputPlaceholder': '請輸入漢字...',
    'app.genBtn': '輸入',
    'app.inputError': '請輸入漢字',
    'app.modeQuiz': '開始描筆練習',
    'app.modePlay': '播放模式',
  },
  en: {
    'settings.title': 'Settings',
    'settings.themeColor': 'Theme Color',
    'settings.strokeColor': 'Stroke Color',
    'settings.gridColor': 'Grid Color',
    'settings.gridStyle': 'Grid Style',
    'settings.gridStyle.rice': 'Rice Grid',
    'settings.gridStyle.cross': 'Cross Grid',
    'settings.gridStyle.tic': 'Tic-Tac-Toe',
    'settings.gridStyle.x': 'X Grid',
    'settings.gridLineStyle': 'Line Style',
    'settings.gridLineStyle.dashed': 'Dashed',
    'settings.gridLineStyle.solid': 'Solid',
    'settings.gridLineStyle.dotted': 'Dotted',
    'settings.language': 'Language',
    'settings.defaultText': 'Default Text',
    'settings.rememberLastSearch': 'Remember Last Search',
    'settings.enableIconUpdates': 'Dynamic Icons',
    'settings.iconStyle': 'Icon Style',
    'settings.iconStyle.default': 'Default (Green/White)',
    'settings.iconStyle.redGold': 'Red/Gold',
    'settings.iconStyle.redBlack': 'Red/Black',
    'settings.iconStyle.custom': 'Custom',
    'settings.iconBgColor': 'Background Color',
    'settings.iconFgColor': 'Text Color',
    'settings.iconGridColor': 'Grid Color',
    'settings.iconRotate180': 'Upside Down (180°)',
    'settings.privacyPolicy': 'Privacy Policy',
    'settings.projectUrl': 'Project URL',
    'settings.feedback': 'Feedback',
    'settings.reset': 'Reset All Settings',
    'settings.resetConfirm':
      'Are you sure you want to reset all settings? This cannot be undone.',
    'app.title': 'WriteRight',
    'app.pageTitle': 'WriteRight - Fast Chinese Stroke Order Guide',
    'app.inputPlaceholder': 'Enter Chinese characters...',
    'app.genBtn': 'Enter',
    'app.inputError': 'Please enter Chinese characters',
    'app.modeQuiz': 'Start Quiz',
    'app.modePlay': 'Play Mode',
  },
}

class App {
  private writerPlay: HanziWriter | null = null
  private writerQuiz: HanziWriter | null = null
  private currentChar: string = ''
  private charList: string[] = []
  // State
  private isQuizMode: boolean = false
  private isPlaying: boolean = true // Default to playing for Play Mode
  private isLoopDelay: boolean = false
  private isPausedMidAnimation: boolean = false
  private loopTimer: any = null
  private animationScopeId: number = 0
  private settings: Settings

  // Data Caching
  private charDataCache: Record<string, any> = {}
  private charDataRequests: Record<string, Promise<any> | undefined> = {}

  // DOM Elements
  private inputEl: HTMLInputElement
  private clearBtn: HTMLButtonElement
  private genBtn: HTMLButtonElement
  private listEl: HTMLElement
  private toastEl: HTMLElement
  private toastTimer: any = null

  // Sections
  private playSection: HTMLElement
  private quizSection: HTMLElement
  private targetElPlay: HTMLElement
  private targetElQuiz: HTMLElement

  // Debug
  private isDebugMode: boolean = false
  private debugInfoPlay: HTMLElement
  private debugInfoQuiz: HTMLElement
  private isCurrentEmpty: boolean = false

  // Play Mode Buttons
  private togglePlayBtn: HTMLButtonElement
  private restartBtn: HTMLButtonElement
  private modeQuizBtn: HTMLButtonElement
  private iconPlay: HTMLElement
  private iconPause: HTMLElement

  // Quiz Mode Buttons
  private quizResetBtn: HTMLButtonElement
  private modePlayBtn: HTMLButtonElement

  // Settings Elements
  private settingsBtn: HTMLButtonElement
  private zenModeBtn: HTMLButtonElement
  private iconMaximize: HTMLElement
  private iconMinimize: HTMLElement
  private settingsModal: HTMLElement
  private closeSettingsBtn: HTMLButtonElement
  private themeColorPicker: HTMLInputElement
  private strokeColorPicker: HTMLInputElement
  private gridColorPicker: HTMLInputElement
  private gridStyleSelect: HTMLSelectElement
  private gridLineStyleSelect: HTMLSelectElement
  private languageSelect: HTMLSelectElement
  private defaultTextInput: HTMLInputElement
  private rememberLastSearchCheck: HTMLInputElement
  private iconUpdatesSetting: HTMLElement
  private enableIconUpdatesCheck: HTMLInputElement
  private iconStyleSelect: HTMLSelectElement
  private iconBgColorPicker: HTMLInputElement
  private iconFgColorPicker: HTMLInputElement
  private iconGridColorPicker: HTMLInputElement
  private iconRotateCheck: HTMLInputElement
  private iconStyleSettings: HTMLElement
  private resetSettingsBtn: HTMLButtonElement

  constructor() {
    this.settings = this.loadSettings()

    createIcons({
      icons: {
        X,
        Search,
        Settings,
        Play,
        Pause,
        RotateCcw,
        Pencil,
        CirclePlay,
        Maximize,
        Minimize,
      },
    })

    this.inputEl = document.getElementById('char-input') as HTMLInputElement
    this.clearBtn = document.getElementById('clear-btn') as HTMLButtonElement
    this.genBtn = document.getElementById('gen-btn') as HTMLButtonElement
    this.listEl = document.getElementById('char-list') as HTMLElement
    this.toastEl = document.getElementById('toast-msg') as HTMLElement

    // Sections
    this.playSection = document.getElementById('play-section') as HTMLElement
    this.quizSection = document.getElementById('quiz-section') as HTMLElement
    this.targetElPlay = document.getElementById(
      'character-target-play'
    ) as HTMLElement
    this.targetElQuiz = document.getElementById(
      'character-target-quiz'
    ) as HTMLElement

    // Debug
    this.isDebugMode = new URLSearchParams(window.location.search).has('debug')
    this.debugInfoPlay = document.getElementById(
      'debug-info-play'
    ) as HTMLElement
    this.debugInfoQuiz = document.getElementById(
      'debug-info-quiz'
    ) as HTMLElement

    if (this.isDebugMode) {
      this.debugInfoPlay.classList.remove('hidden')
      this.debugInfoQuiz.classList.remove('hidden')
    }

    this.togglePlayBtn = document.getElementById(
      'toggle-play-btn'
    ) as HTMLButtonElement
    this.restartBtn = document.getElementById(
      'restart-btn'
    ) as HTMLButtonElement
    this.modeQuizBtn = document.getElementById(
      'mode-quiz-btn'
    ) as HTMLButtonElement
    this.iconPlay = this.togglePlayBtn.querySelector(
      '.icon-play'
    ) as HTMLElement
    this.iconPause = this.togglePlayBtn.querySelector(
      '.icon-pause'
    ) as HTMLElement

    this.quizResetBtn = document.getElementById(
      'quiz-reset-btn'
    ) as HTMLButtonElement
    this.modePlayBtn = document.getElementById(
      'mode-play-btn'
    ) as HTMLButtonElement

    // Settings
    this.settingsBtn = document.getElementById(
      'settings-btn'
    ) as HTMLButtonElement
    this.settingsModal = document.getElementById(
      'settings-modal'
    ) as HTMLElement
    this.closeSettingsBtn = document.getElementById(
      'close-settings'
    ) as HTMLButtonElement

    // Zen Mode
    this.zenModeBtn = document.getElementById(
      'zen-mode-btn'
    ) as HTMLButtonElement
    this.iconMaximize = this.zenModeBtn.querySelector(
      '.icon-maximize'
    ) as HTMLElement
    this.iconMinimize = this.zenModeBtn.querySelector(
      '.icon-minimize'
    ) as HTMLElement

    this.themeColorPicker = document.getElementById(
      'theme-color-picker'
    ) as HTMLInputElement
    this.strokeColorPicker = document.getElementById(
      'stroke-color-picker'
    ) as HTMLInputElement
    this.gridColorPicker = document.getElementById(
      'grid-color-picker'
    ) as HTMLInputElement
    this.gridStyleSelect = document.getElementById(
      'grid-style-select'
    ) as HTMLSelectElement
    this.gridLineStyleSelect = document.getElementById(
      'grid-line-style-select'
    ) as HTMLSelectElement
    this.languageSelect = document.getElementById(
      'language-select'
    ) as HTMLSelectElement
    this.defaultTextInput = document.getElementById(
      'default-text-input'
    ) as HTMLInputElement
    this.rememberLastSearchCheck = document.getElementById(
      'remember-last-search-check'
    ) as HTMLInputElement
    this.iconUpdatesSetting = document.getElementById(
      'icon-updates-setting'
    ) as HTMLElement
    this.enableIconUpdatesCheck = document.getElementById(
      'enable-icon-updates-check'
    ) as HTMLInputElement
    this.iconStyleSelect = document.getElementById(
      'icon-style-select'
    ) as HTMLSelectElement
    this.iconBgColorPicker = document.getElementById(
      'icon-bg-color-picker'
    ) as HTMLInputElement
    this.iconFgColorPicker = document.getElementById(
      'icon-fg-color-picker'
    ) as HTMLInputElement
    this.iconGridColorPicker = document.getElementById(
      'icon-grid-color-picker'
    ) as HTMLInputElement
    this.iconRotateCheck = document.getElementById(
      'icon-rotate-check'
    ) as HTMLInputElement
    this.iconStyleSettings = document.getElementById(
      'icon-style-settings'
    ) as HTMLElement
    this.resetSettingsBtn = document.getElementById(
      'reset-settings-btn'
    ) as HTMLButtonElement

    // Check language redirect immediately after elements init (or even before)
    this.checkLanguageRedirect()

    this.initSettingsUI()
    this.initEventListeners()
    this.handleResize()

    // Check for 'q' parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const query = urlParams.get('q')

    if (query) {
      // Decode if necessary, though URLSearchParams handles basic decoding
      try {
        this.inputEl.value = decodeURIComponent(query)
      } catch (e) {
        console.warn('Malformed URL query parameter:', e)
        this.inputEl.value = query
      }
    } else {
      // Check localStorage if enabled
      let lastSearch = ''
      if (this.settings.rememberLastSearch) {
        lastSearch = localStorage.getItem('last-search-content') || ''
      }

      if (lastSearch) {
        this.inputEl.value = lastSearch
      } else {
        // Initial example if no query param
        this.inputEl.value = this.settings.defaultText || '汉字笔顺'
      }
    }

    // Only generate list if there is a value
    if (this.inputEl.value) {
      this.generateList(false) // Pass false to avoid pushing state again on load
    }

    // Update UI state
    this.toggleClearBtn()
    // DEBUG
    // this.showToast(location.href)
  }

  private loadSettings(): Settings {
    // 1. Check for injected language from HTML (highest priority for determining current session context if we want to respect URL)
    // However, we want to respect USER PREFERENCE if it exists.
    const injectedLang = (window as any).HANZI_LANG

    const saved = localStorage.getItem('app-settings')
    if (saved) {
      const savedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }

      // If we have saved settings, we might need to redirect if they mismatch current URL.
      // But we do NOT overwrite the saved language with the URL language here.
      // We will handle redirection in constructor.
      return savedSettings
    }

    // 2. No saved settings -> Use URL language (injected) or System Language
    // But if we are at root (/), we treat it as "undecided" and fallback to System Language
    // to determine the correct redirection target.
    const pathname = window.location.pathname
    const isRoot = pathname === '/' || pathname === '/index.html'

    if (injectedLang && !isRoot) {
      // If user visits /en/ for the first time, default to English
      return { ...DEFAULT_SETTINGS, language: injectedLang }
    }

    // 3. Fallback to System Language
    const lang = navigator.language
    let defaultLang: 'zh-CN' | 'zh-TW' | 'en' = 'zh-CN'
    if (lang.startsWith('zh-TW') || lang.startsWith('zh-HK')) {
      defaultLang = 'zh-TW'
    } else if (lang.startsWith('zh')) {
      defaultLang = 'zh-CN'
    } else {
      defaultLang = 'en'
    }
    return { ...DEFAULT_SETTINGS, language: defaultLang }
  }

  private checkLanguageRedirect() {
    const currentLang = this.settings.language

    // Define canonical paths
    // zh-CN -> /zh-CN/
    // zh-TW -> /zh-TW/
    // en -> /en/

    let targetPrefix = '/zh-CN/'
    if (currentLang === 'en') {
      targetPrefix = '/en/'
    } else if (currentLang === 'zh-TW') {
      targetPrefix = '/zh-TW/'
    }

    const pathname = window.location.pathname

    // We redirect if:
    // 1. We are not at the target prefix (e.g. at / or /en/ when lang is zh-CN)
    // Note: We check startsWith to allow for potential sub-paths or file names (e.g. index.html)
    // but typically we just want to ensure we are in the right directory.

    if (!pathname.startsWith(targetPrefix)) {
      // Perform redirect
      const search = window.location.search
      // Ensure targetPrefix ends with / and we append search params
      const targetUrl = targetPrefix + search

      console.log(
        `Language redirect: ${pathname} -> ${targetUrl} (Lang: ${currentLang})`
      )
      window.location.replace(targetUrl)
    }
  }

  private saveSettings() {
    const oldLang = JSON.parse(
      localStorage.getItem('app-settings') || '{}'
    ).language
    localStorage.setItem('app-settings', JSON.stringify(this.settings))

    // If language changed, check for redirect
    if (oldLang !== this.settings.language) {
      this.checkLanguageRedirect()
    }
  }

  private initSettingsUI() {
    this.themeColorPicker.value = this.settings.themeColor
    this.strokeColorPicker.value = this.settings.strokeColor
    this.gridColorPicker.value = this.settings.gridColor
    this.gridStyleSelect.value = this.settings.gridStyle
    this.gridLineStyleSelect.value = this.settings.gridLineStyle
    this.languageSelect.value = this.settings.language
    this.defaultTextInput.value = this.settings.defaultText || '汉字笔顺'
    this.rememberLastSearchCheck.checked = this.settings.rememberLastSearch

    this.iconStyleSelect.value = this.settings.iconStyle || 'default'
    this.iconBgColorPicker.value = this.settings.iconCustomBgColor || '#4CAF50'
    this.iconFgColorPicker.value = this.settings.iconCustomFgColor || '#ffffff'
    this.iconGridColorPicker.value =
      this.settings.iconCustomGridColor || '#A5D6A7'
    this.iconRotateCheck.checked = this.settings.iconRotate180

    if (this.isMobileDevice() && !this.isStandalone()) {
      this.iconUpdatesSetting.style.display = 'flex'
      this.enableIconUpdatesCheck.checked = this.settings.enableIconUpdates

      if (this.settings.enableIconUpdates) {
        this.iconStyleSettings.style.display = 'flex'
        this.updateIconCustomColorsVisibility()
      } else {
        this.iconStyleSettings.style.display = 'none'
      }
    } else {
      this.iconUpdatesSetting.style.display = 'none'
      this.iconStyleSettings.style.display = 'none'
    }

    this.applySettings()
  }

  private updateIconCustomColorsVisibility() {
    const isCustom = this.settings.iconStyle === 'custom'
    const display = isCustom ? 'flex' : 'none'
    const customColorItems =
      this.iconStyleSettings.querySelectorAll('.icon-custom-color')
    customColorItems.forEach((item) => {
      ;(item as HTMLElement).style.display = display
    })
  }

  private applySettings() {
    // Apply Theme Color
    const primaryColor = this.settings.themeColor
    document.documentElement.style.setProperty(
      '--md-sys-color-primary',
      primaryColor
    )

    // Update Meta Theme Color
    const metaThemeColor = document.getElementById('theme-color-meta')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', primaryColor)
    }

    // Derived colors
    const rgb = this.hexToRgb(primaryColor)
    if (rgb) {
      // Primary Container (Light) - Mix with white (e.g. 90% white)
      const container = this.mixColor(rgb, { r: 255, g: 255, b: 255 }, 0.9)
      document.documentElement.style.setProperty(
        '--md-sys-color-primary-container',
        `rgb(${container.r}, ${container.g}, ${container.b})`
      )

      // On Primary Container (Dark) - Mix with black (e.g. 60% black) or use dark version
      const onContainer = this.mixColor(rgb, { r: 0, g: 0, b: 0 }, 0.6)
      document.documentElement.style.setProperty(
        '--md-sys-color-on-primary-container',
        `rgb(${onContainer.r}, ${onContainer.g}, ${onContainer.b})`
      )

      // Success Flash Shadow - Primary color with 0.6 opacity
      document.documentElement.style.setProperty(
        '--success-flash-shadow',
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`
      )
    }

    // Apply Grid Color
    document.documentElement.style.setProperty(
      '--grid-line-color',
      this.settings.gridColor
    )

    // Apply Grid Background
    const gridBg = this.generateGridBackground(
      this.settings.gridStyle,
      this.settings.gridLineStyle,
      this.settings.gridColor
    )

    // Update both play and quiz targets
    // Note: We need to ensure we don't overwrite other styles, but background-image is specific enough
    this.targetElPlay.style.backgroundImage = gridBg
    this.targetElQuiz.style.backgroundImage = gridBg

    // Apply Language
    this.updateLanguage()

    // Re-render writer if exists to apply stroke color
    if (this.currentChar) {
      this.renderWriter(this.currentChar)
    }
  }

  private generateGridBackground(
    style: string,
    lineStyle: string,
    color: string
  ): string {
    let dashArray = ''
    if (lineStyle === 'dashed') {
      dashArray = 'stroke-dasharray="5,5"'
    } else if (lineStyle === 'dotted') {
      dashArray = 'stroke-dasharray="1,3" stroke-linecap="round"'
    }

    // Helper to create line with optional start offset
    const createLine = (x1: number, y1: number, x2: number, y2: number) => {
      let sx = x1,
        sy = y1
      // Apply offset for dotted lines to prevent center overlap
      if (lineStyle === 'dotted') {
        const offset = 2.0 // Distance to shift start point
        const dx = x2 - x1
        const dy = y2 - y1
        const length = Math.sqrt(dx * dx + dy * dy)
        if (length > 0) {
          sx = x1 + (dx / length) * offset
          sy = y1 + (dy / length) * offset
        }
      }
      return `<line x1="${sx}" y1="${sy}" x2="${x2}" y2="${y2}" ${strokeAttr} />`
    }

    let paths = ''

    // Common attributes
    const strokeAttr = `stroke="${color}" stroke-width="1" ${dashArray} fill="none"`

    switch (style) {
      case 'rice': // 米字格
        paths = `
                ${createLine(50, 50, 0, 0)}
                ${createLine(50, 50, 100, 100)}
                ${createLine(50, 50, 100, 0)}
                ${createLine(50, 50, 0, 100)}
                ${createLine(50, 50, 50, 0)}
                ${createLine(50, 50, 50, 100)}
                ${createLine(50, 50, 0, 50)}
                ${createLine(50, 50, 100, 50)}
                <rect x="0" y="0" width="100" height="100" stroke="${color}" stroke-width="2" fill="none" />
            `
        break
      case 'cross': // 十字格
        paths = `
                ${createLine(50, 50, 50, 0)}
                ${createLine(50, 50, 50, 100)}
                ${createLine(50, 50, 0, 50)}
                ${createLine(50, 50, 100, 50)}
                <rect x="0" y="0" width="100" height="100" stroke="${color}" stroke-width="2" fill="none" />
            `
        break
      case 'tic': // 井字格
        paths = `
                ${createLine(33.3, 50, 33.3, 0)}
                ${createLine(33.3, 50, 33.3, 100)}
                ${createLine(66.6, 50, 66.6, 0)}
                ${createLine(66.6, 50, 66.6, 100)}
                ${createLine(50, 33.3, 0, 33.3)}
                ${createLine(50, 33.3, 100, 33.3)}
                ${createLine(50, 66.6, 0, 66.6)}
                ${createLine(50, 66.6, 100, 66.6)}
                <rect x="0" y="0" width="100" height="100" stroke="${color}" stroke-width="2" fill="none" />
            `
        break
      case 'x': // X字格
        paths = `
                ${createLine(50, 50, 0, 0)}
                ${createLine(50, 50, 100, 100)}
                ${createLine(50, 50, 100, 0)}
                ${createLine(50, 50, 0, 100)}
                <rect x="0" y="0" width="100" height="100" stroke="${color}" stroke-width="2" fill="none" />
            `
        break
      default: // Default to rice
        paths = `
                ${createLine(50, 50, 0, 0)}
                ${createLine(50, 50, 100, 100)}
                ${createLine(50, 50, 100, 0)}
                ${createLine(50, 50, 0, 100)}
                ${createLine(50, 50, 50, 0)}
                ${createLine(50, 50, 50, 100)}
                ${createLine(50, 50, 0, 50)}
                ${createLine(50, 50, 100, 50)}
                <rect x="0" y="0" width="100" height="100" stroke="${color}" stroke-width="2" fill="none" />
            `
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">${paths}</svg>`
    return `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}')`
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  private mixColor(
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number },
    weight: number
  ) {
    // weight is how much of color2 to mix in (0 to 1)
    return {
      r: Math.round(color1.r * (1 - weight) + color2.r * weight),
      g: Math.round(color1.g * (1 - weight) + color2.g * weight),
      b: Math.round(color1.b * (1 - weight) + color2.b * weight),
    }
  }

  private updateLanguage() {
    const lang = this.settings.language
    const t = TRANSLATIONS[lang]

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n')
      if (key && t[key as keyof typeof t]) {
        el.textContent = t[key as keyof typeof t]
      }
    })

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder')
      if (key && t[key as keyof typeof t]) {
        ;(el as HTMLInputElement).placeholder = t[key as keyof typeof t]
      }
    })

    document.title = t['app.pageTitle']
    this.inputEl.placeholder = t['app.inputPlaceholder']
    // this.genBtn.textContent = t['app.genBtn']; // Button is now an icon button, text is in aria-label or tooltip if added.
    // Update aria-label for accessibility
    this.genBtn.setAttribute('aria-label', t['app.genBtn'])
    this.modeQuizBtn.setAttribute('aria-label', t['app.modeQuiz'])
    this.modePlayBtn.setAttribute('aria-label', t['app.modePlay'])
  }

  private initEventListeners() {
    // Search Button Visibility Logic
    const inputGroup = this.inputEl.closest('.input-group')
    if (inputGroup) {
      inputGroup.addEventListener('focusin', () => {
        inputGroup.classList.add('focused')
      })

      inputGroup.addEventListener('focusout', (e) => {
        const focusEvent = e as FocusEvent
        const related = focusEvent.relatedTarget as Node
        if (!inputGroup.contains(related)) {
          inputGroup.classList.remove('focused')
        }
      })
    }

    // Generate List Button
    this.genBtn.addEventListener('mousedown', (e) => {
      // Prevent default to avoid blur on input which causes layout shift
      e.preventDefault()
    })
    this.genBtn.addEventListener('click', () => this.generateList())

    // Clear Button
    this.clearBtn.addEventListener('mousedown', (e) => {
      // Prevent default to avoid blur on input which causes layout shift
      e.preventDefault()
    })

    this.clearBtn.addEventListener('click', () => {
      this.inputEl.value = ''
      this.toggleClearBtn()
      this.inputEl.focus()
    })

    // Input changes
    this.inputEl.addEventListener('input', () => this.toggleClearBtn())
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.generateList()
      }
    })

    // Window Resize
    window.addEventListener('resize', () => {
      this.handleResize()
    })

    // Handle browser history navigation (Back/Forward)
    window.addEventListener('popstate', (_event) => {
      const urlParams = new URLSearchParams(window.location.search)
      const query = urlParams.get('q')

      if (query) {
        try {
          this.inputEl.value = decodeURIComponent(query)
        } catch (e) {
          console.warn('Malformed URL query parameter:', e)
          this.inputEl.value = query
        }
      } else {
        // Restore default if no query parameter
        this.inputEl.value = this.settings.defaultText || '汉字笔顺'
      }
      this.toggleClearBtn()
      this.generateList(false) // Update view without pushing new state
    })

    // --- Play Mode Controls ---
    this.togglePlayBtn.addEventListener('click', () => this.togglePlayState())

    this.restartBtn.addEventListener('click', () => {
      this.enterPlayMode(true)
    })

    this.modeQuizBtn.addEventListener('click', () => this.enterQuizMode())

    // --- Quiz Mode Controls ---
    this.quizResetBtn.addEventListener('click', () => {
      if (this.writerQuiz) {
        this.startQuiz()
      }
    })

    this.modePlayBtn.addEventListener('click', () => this.enterPlayMode(true))

    this.zenModeBtn.addEventListener('click', () => this.toggleZenMode())

    this.initSettingsListeners()
  }

  private initSettingsListeners() {
    this.settingsBtn.addEventListener('click', () => this.openSettings())
    this.closeSettingsBtn.addEventListener('click', () => this.closeSettings())

    // Close modal when clicking outside
    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) {
        this.closeSettings()
      }
    })

    // Theme Color
    this.themeColorPicker.addEventListener('input', (e) => {
      this.settings.themeColor = (e.target as HTMLInputElement).value
      this.saveSettings()
      this.applySettings()
    })

    // Stroke Color
    this.strokeColorPicker.addEventListener('input', (e) => {
      this.settings.strokeColor = (e.target as HTMLInputElement).value
      this.saveSettings()
      this.applySettings()
    })

    // Grid Color
    this.gridColorPicker.addEventListener('input', (e) => {
      this.settings.gridColor = (e.target as HTMLInputElement).value
      this.saveSettings()
      this.applySettings()
    })

    // Grid Style
    this.gridStyleSelect.addEventListener('change', (e) => {
      this.settings.gridStyle = (e.target as HTMLSelectElement).value as any
      this.saveSettings()
      this.applySettings()
    })

    // Grid Line Style
    this.gridLineStyleSelect.addEventListener('change', (e) => {
      this.settings.gridLineStyle = (e.target as HTMLSelectElement).value as any
      this.saveSettings()
      this.applySettings()
    })

    // Language
    this.languageSelect.addEventListener('change', (e) => {
      this.settings.language = (e.target as HTMLSelectElement).value as any
      this.saveSettings()
      this.applySettings()
    })

    // Default Text
    this.defaultTextInput.addEventListener('input', (e) => {
      this.settings.defaultText = (e.target as HTMLInputElement).value
      this.saveSettings()
    })

    // Remember Last Search
    this.rememberLastSearchCheck.addEventListener('change', (e) => {
      this.settings.rememberLastSearch = (e.target as HTMLInputElement).checked
      this.saveSettings()
      // Clear localStorage if disabled?
      // User didn't specify, but it's cleaner.
      // Or maybe not, in case they re-enable.
      // Let's stick to "Enable: save... Next time: read...".
      // If disabled, we just stop saving and stop reading.
      // Existing data can stay or be stale. I'll leave it.
    })

    // Enable Icon Updates
    this.enableIconUpdatesCheck.addEventListener('change', (e) => {
      this.settings.enableIconUpdates = (e.target as HTMLInputElement).checked
      this.saveSettings()
      if (this.settings.enableIconUpdates) {
        this.iconStyleSettings.style.display = 'flex'
        this.updateIconCustomColorsVisibility()
      } else {
        this.iconStyleSettings.style.display = 'none'
      }
      if (this.currentChar) {
        this.updatePageIcons(this.currentChar)
      }
    })

    // Icon Style
    this.iconStyleSelect.addEventListener('change', (e) => {
      this.settings.iconStyle = (e.target as HTMLSelectElement).value as any
      this.saveSettings()
      this.updateIconCustomColorsVisibility()
      if (this.currentChar) {
        this.updatePageIcons(this.currentChar)
      }
    })

    // Icon Custom Bg Color
    this.iconBgColorPicker.addEventListener('input', (e) => {
      this.settings.iconCustomBgColor = (e.target as HTMLInputElement).value
      this.saveSettings()
      if (this.settings.iconStyle === 'custom' && this.currentChar) {
        this.updatePageIcons(this.currentChar)
      }
    })

    // Icon Custom Fg Color
    this.iconFgColorPicker.addEventListener('input', (e) => {
      this.settings.iconCustomFgColor = (e.target as HTMLInputElement).value
      this.saveSettings()
      if (this.settings.iconStyle === 'custom' && this.currentChar) {
        this.updatePageIcons(this.currentChar)
      }
    })

    // Icon Custom Grid Color
    this.iconGridColorPicker.addEventListener('input', (e) => {
      this.settings.iconCustomGridColor = (e.target as HTMLInputElement).value
      this.saveSettings()
      if (this.settings.iconStyle === 'custom' && this.currentChar) {
        this.updatePageIcons(this.currentChar)
      }
    })

    // Icon Rotation
    this.iconRotateCheck.addEventListener('change', (e) => {
      this.settings.iconRotate180 = (e.target as HTMLInputElement).checked
      this.saveSettings()
      if (this.currentChar) {
        this.updatePageIcons(this.currentChar)
      }
    })

    // Reset Settings
    this.resetSettingsBtn.addEventListener('click', () => {
      const lang = this.settings.language
      const t = TRANSLATIONS[lang]
      if (confirm(t['settings.resetConfirm' as keyof typeof t])) {
        localStorage.removeItem('app-settings')
        window.location.reload()
      }
    })
  }

  private openSettings() {
    this.settingsModal.classList.remove('hidden')
  }

  private closeSettings() {
    this.settingsModal.classList.add('hidden')
  }

  private toggleZenMode() {
    document.body.classList.toggle('zen-mode')
    const isZen = document.body.classList.contains('zen-mode')

    if (isZen) {
      this.iconMaximize.style.display = 'none'
      this.iconMinimize.style.display = 'block'
    } else {
      this.iconMaximize.style.display = 'block'
      this.iconMinimize.style.display = 'none'
    }

    // Trigger resize to adjust layout
    this.handleResize()
  }

  private togglePlayState() {
    if (!this.writerPlay) return

    if (this.isPlaying) {
      // Pause
      this.isPlaying = false
      this.updatePlayIcon()

      if (this.isLoopDelay) {
        clearTimeout(this.loopTimer)
      } else {
        this.writerPlay.pauseAnimation()
        this.isPausedMidAnimation = true
      }
    } else {
      // Play
      this.isPlaying = true
      this.updatePlayIcon()

      if (this.isLoopDelay) {
        this.isLoopDelay = false
        this.playLoop()
      } else if (this.isPausedMidAnimation) {
        this.writerPlay.resumeAnimation()
        this.isPausedMidAnimation = false
      } else {
        this.playLoop()
      }
    }
  }

  private updatePlayIcon() {
    if (this.isPlaying) {
      this.iconPlay.style.display = 'none'
      this.iconPause.style.display = 'block'
    } else {
      this.iconPlay.style.display = 'block'
      this.iconPause.style.display = 'none'
    }
  }

  private enterQuizMode() {
    this.isQuizMode = true
    this.playSection.style.display = 'none'
    this.quizSection.style.display = 'flex'

    // Re-render to update layout and initialize writer for the new mode
    this.renderWriter(this.currentChar, true)
  }

  private startQuiz() {
    if (!this.writerQuiz) return

    this.writerQuiz.quiz({
      onComplete: (_summaryData: any) => {
        this.targetElQuiz.classList.add('success-flash')

        setTimeout(() => {
          this.targetElQuiz.classList.remove('success-flash')
          this.startQuiz()
        }, 1500)
      },
    })
  }

  private enterPlayMode(autoPlay: boolean = false) {
    this.isQuizMode = false
    this.playSection.style.display = 'flex'
    this.quizSection.style.display = 'none'

    if (autoPlay) {
      // Reset states for fresh start
      this.animationScopeId++
      this.isPlaying = true
      this.isLoopDelay = false
      this.isPausedMidAnimation = false
      if (this.loopTimer) {
        clearTimeout(this.loopTimer)
        this.loopTimer = null
      }
      this.updatePlayIcon()
    }

    // Re-render to update layout and initialize writer for the new mode
    this.renderWriter(this.currentChar, true)
  }

  private playLoop() {
    if (!this.writerPlay || !this.isPlaying) return

    const scopeId = this.animationScopeId

    this.writerPlay.animateCharacter({
      onComplete: () => {
        if (this.animationScopeId !== scopeId) return
        if (!this.isPlaying) return

        this.isLoopDelay = true
        this.loopTimer = setTimeout(() => {
          if (this.animationScopeId !== scopeId) return
          this.isLoopDelay = false
          this.playLoop()
        }, 1000)
      },
    })
  }

  private toggleClearBtn() {
    this.clearBtn.style.display = this.inputEl.value ? 'flex' : 'none'
  }

  private showToast(msgKey: string) {
    const lang = this.settings.language
    const msg =
      TRANSLATIONS[lang][msgKey as keyof (typeof TRANSLATIONS)['zh-CN']] ||
      msgKey
    this.toastEl.textContent = msg
    this.toastEl.classList.remove('hidden')
    this.toastEl.classList.add('show')

    if (this.toastTimer) {
      clearTimeout(this.toastTimer)
    }

    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.remove('show')
      this.toastEl.classList.add('hidden')
      this.toastTimer = null
    }, 2000)
  }

  private generateList(pushState: boolean = true) {
    const text = this.inputEl.value.trim()

    if (this.settings.rememberLastSearch) {
      localStorage.setItem('last-search-content', text)
    }

    if (!text) return

    // Filter for Chinese characters (basic range)
    this.charList = text
      .split('')
      .filter((char) => /[\u4e00-\u9fa5]/.test(char))

    if (this.charList.length === 0) {
      this.showToast('app.inputError')
      // Show empty grid
      this.isCurrentEmpty = true
      this.currentChar = '一' // Dummy character for grid
      this.renderList()
      this.renderWriter('一', false)
      return
    }

    // Update URL if requested
    if (pushState) {
      const url = new URL(window.location.href)
      url.searchParams.set('q', text)
      window.history.pushState({ q: text }, '', url.toString())
    }

    this.renderList()
    // Select first character
    if (this.charList.length > 0) {
      this.selectChar(this.charList[0], 0)
    }
  }

  private renderList() {
    this.listEl.innerHTML = ''
    this.charList.forEach((char, index) => {
      const item = document.createElement('div')
      item.className = 'char-item'
      item.textContent = char
      item.dataset.index = index.toString()
      item.tabIndex = 0 // Make focusable
      item.setAttribute('role', 'button') // Accessibility
      item.addEventListener('click', () => this.selectChar(char, index))
      // Add keyboard support
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          this.selectChar(char, index)
        }
      })
      this.listEl.appendChild(item)
    })
  }

  private selectChar(char: string, index: number) {
    this.isCurrentEmpty = false
    this.currentChar = char

    // Update UI active state
    const items = this.listEl.querySelectorAll('.char-item')
    items.forEach((item) => item.classList.remove('active'))
    if (items[index]) {
      const targetItem = items[index] as HTMLElement
      targetItem.classList.add('active')
      targetItem.focus({ preventScroll: true }) // Focus the item without scrolling wildly
      targetItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      }) // Ensure visible
    }

    this.renderWriter(char)

    // Update Page Icons
    this.updatePageIcons(char)
  }

  private renderWriter(char: string, preserveState: boolean = false) {
    console.debug('[renderWriter] Start', {
      char,
      preserveState,
      oldScopeId: this.animationScopeId,
      state: {
        playing: this.isPlaying,
        loopDelay: this.isLoopDelay,
        paused: this.isPausedMidAnimation,
        hasTimer: !!this.loopTimer,
      },
    })

    // ALWAYS invalidate old callbacks because we are destroying the DOM/Writer instances
    this.animationScopeId++

    // Clear any existing loop timer
    if (this.loopTimer) {
      clearTimeout(this.loopTimer)
      this.loopTimer = null
    }

    if (!preserveState) {
      this.isLoopDelay = false
      this.isPausedMidAnimation = false
      this.isPlaying = !this.isCurrentEmpty // Auto-play new char only if not empty
      this.updatePlayIcon()
    } else {
      // On resize: Reset transient animation states to avoid race conditions.
      // If we were playing, we restart the loop from the beginning.
      // If we were paused, we stay paused at the beginning.
      this.isLoopDelay = false
      this.isPausedMidAnimation = false
    }

    // 1. Clear previous content and RESET SIZES to allow flex containers to resize naturally
    this.targetElPlay.innerHTML = ''
    this.targetElPlay.style.width = ''
    this.targetElPlay.style.height = ''

    this.targetElQuiz.innerHTML = ''
    this.targetElQuiz.style.width = ''
    this.targetElQuiz.style.height = ''

    // 2. Measure containers after styles are reset (flex layout should be balanced now)
    // We update layout mode (horizontal vs vertical) based on available aspect ratio
    this.updateSectionLayout(this.playSection)
    this.updateSectionLayout(this.quizSection)

    // We calculate size for both, then use the minimum if both are visible (desktop) to keep them symmetric
    let sizePlay = this.getContainerSize(this.playSection)
    let sizeQuiz = this.getContainerSize(this.quizSection)

    // Check if both are visible (Dual Mode: Wide width OR Tall height)
    const isDualMode = window.innerWidth >= 800 || window.innerHeight >= 900

    if (isDualMode && sizePlay > 0 && sizeQuiz > 0) {
      // Enforce symmetry on dual mode
      const commonSize = Math.min(sizePlay, sizeQuiz)
      sizePlay = commonSize
      sizeQuiz = commonSize
    }

    console.debug('[renderWriter] Calculated Sizes', {
      sizePlay,
      sizeQuiz,
      isDualMode,
    })

    if (this.isDebugMode) {
      const playStyle = window.getComputedStyle(this.playSection)
      const playW = this.playSection.clientWidth
      const playH = this.playSection.clientHeight
      const layout = this.playSection.classList.contains('horizontal-layout')
        ? 'Side'
        : 'Bottom'

      this.debugInfoPlay.textContent = `Size: ${sizePlay}px | W:${playW} H:${playH} | ${layout}`
      this.debugInfoPlay.classList.remove('hidden')

      if (sizeQuiz > 0) {
        this.debugInfoQuiz.textContent = `Size: ${sizeQuiz}px`
        this.debugInfoQuiz.classList.remove('hidden')
      }
    }

    // 3. Initialize Writers with calculated sizes
    if (sizePlay > 0) {
      this.initWriterPlay(char, sizePlay, this.isCurrentEmpty)
    } else {
      this.writerPlay = null
    }

    if (sizeQuiz > 0) {
      this.initWriterQuiz(char, sizeQuiz, this.isCurrentEmpty)
    } else {
      this.writerQuiz = null
    }

    // Start animation if needed
    if (this.isPlaying) {
      console.debug('[renderWriter] Starting loop')
      this.playLoop()
    }
  }

  private initWriterPlay(char: string, size: number, isEmpty: boolean = false) {
    this.targetElPlay.style.width = `${size}px`
    this.targetElPlay.style.height = `${size}px`

    this.writerPlay = HanziWriter.create(this.targetElPlay, char, {
      width: size,
      height: size,
      padding: 5,
      showOutline: !isEmpty,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 1000,
      strokeColor: this.settings.strokeColor,
      showCharacter: !isEmpty,
      highlightOnComplete: true,
      charDataLoader: this.getCharDataLoader(),
    })
  }

  private initWriterQuiz(char: string, size: number, isEmpty: boolean = false) {
    this.targetElQuiz.style.width = `${size}px`
    this.targetElQuiz.style.height = `${size}px`

    this.writerQuiz = HanziWriter.create(this.targetElQuiz, char, {
      width: size,
      height: size,
      padding: 5,
      showOutline: !isEmpty,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 1000,
      strokeColor: this.settings.strokeColor,
      showCharacter: false, // Always false for quiz initially
      showHintAfterMisses: 3,
      highlightOnComplete: true,
      drawingWidth: 20, // Make user input strokes thicker
      charDataLoader: this.getCharDataLoader(),
    })

    if (!isEmpty) {
      this.startQuiz()
    }
  }

  private loadCharData(char: string): Promise<any> {
    // 1. Check Cache
    if (this.charDataCache[char]) {
      return Promise.resolve(this.charDataCache[char])
    }

    // 2. Check In-flight request
    if (this.charDataRequests[char]) {
      return this.charDataRequests[char] as Promise<any>
    }

    // 3. New Request
    const root = (window as any).HANZI_DATA_ROOT || 'data/'
    const request = fetch(`${root}${char}.json`)
      .then((res) => res.json())
      .then((data) => {
        this.charDataCache[char] = data
        delete this.charDataRequests[char]
        return data
      })

    this.charDataRequests[char] = request
    return request
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }

  private isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    )
  }

  private updatePageIcons(char: string) {
    if (this.isStandalone()) return
    if (!this.isMobileDevice()) return
    if (!this.settings.enableIconUpdates) return

    this.loadCharData(char)
      .then((data) => {
        let options: any = {}
        switch (this.settings.iconStyle) {
          case 'red-gold':
            options = {
              backgroundColor: '#D32F2F',
              fillColor: '#FFD700',
              gridColor: '#EF9A9A',
            }
            break
          case 'red-black':
            options = {
              backgroundColor: '#D32F2F',
              fillColor: '#000000',
              gridColor: '#EF9A9A',
            }
            break
          case 'custom':
            options = {
              backgroundColor: this.settings.iconCustomBgColor,
              fillColor: this.settings.iconCustomFgColor,
              gridColor: this.settings.iconCustomGridColor,
            }
            break
          default:
            break
        }

        // Apply rotation if enabled
        options.rotate180 = this.settings.iconRotate180

        const svg = generateIconSvg(data, options)

        // 1. Update Favicon (32x32)
        svgToPngUrl(svg, 32).then((url) => {
          let link = document.querySelector(
            'link[rel="icon"]'
          ) as HTMLLinkElement
          if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
          }
          link.href = url
          link.type = 'image/png'
        })

        // 2. Update Apple Touch Icon (180x180)
        svgToPngUrl(svg, 180).then((url) => {
          let link = document.querySelector(
            'link[rel="apple-touch-icon"]'
          ) as HTMLLinkElement
          if (!link) {
            link = document.createElement('link')
            link.rel = 'apple-touch-icon'
            document.head.appendChild(link)
          }
          link.href = url
        })

        // 3. Update Manifest
        Promise.all([svgToPngUrl(svg, 192), svgToPngUrl(svg, 512)]).then(
          ([icon192, icon512]) => {
            const shortName =
              document
                .querySelector('title')
                ?.getAttribute('data-short-name') || document.title
            const manifest = {
              name: document.title,
              short_name: shortName,
              start_url: '.',
              display: 'standalone',
              background_color: this.settings.themeColor,
              theme_color: this.settings.themeColor,
              icons: [
                { src: icon192, sizes: '192x192', type: 'image/png' },
                { src: icon512, sizes: '512x512', type: 'image/png' },
              ],
            }
            const stringManifest = JSON.stringify(manifest)
            const blob = new Blob([stringManifest], {
              type: 'application/json',
            })
            const manifestUrl = URL.createObjectURL(blob)

            let link = document.querySelector(
              'link[rel="manifest"]'
            ) as HTMLLinkElement
            if (link) {
              link.href = manifestUrl
            }
          }
        )
      })
      .catch((err) => console.error('Failed to update page icons', err))
  }

  private getCharDataLoader() {
    return (char: string, onComplete: any) => {
      this.loadCharData(char)
        .then((data) => onComplete(data))
        .catch((err) => console.error('Failed to load character data', err))
    }
  }

  private getContainerSize(container: HTMLElement): number {
    if (container.offsetParent === null) return 0

    const style = window.getComputedStyle(container)
    const containerWidth =
      container.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight)
    const containerHeight =
      container.clientHeight -
      parseFloat(style.paddingTop) -
      parseFloat(style.paddingBottom)

    const isHorizontal = container.classList.contains('horizontal-layout')
    const controls = container.querySelector('.control-bar') as HTMLElement

    let actualControlsWidth = 0
    let actualControlsHeight = 0

    if (controls) {
      actualControlsWidth = controls.offsetWidth || 0
      actualControlsHeight = controls.offsetHeight || 0
    }

    return calculateTianzigeSize(
      containerWidth,
      containerHeight,
      isHorizontal,
      actualControlsWidth,
      actualControlsHeight
    )
  }

  private updateSectionLayout(section: HTMLElement) {
    if (section.offsetParent === null) return

    const style = window.getComputedStyle(section)
    const w =
      section.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight)
    const h =
      section.clientHeight -
      parseFloat(style.paddingTop) -
      parseFloat(style.paddingBottom)

    const isHorizontal = calculateLayoutMode(w, h)

    if (isHorizontal) {
      section.classList.add('horizontal-layout')
    } else {
      section.classList.remove('horizontal-layout')
    }
  }

  private resizeTimer: any = null

  private handleResize() {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer)
    }

    this.resizeTimer = setTimeout(() => {
      if (this.currentChar) {
        console.debug('Resize debounce triggered. Re-rendering...')
        this.renderWriter(this.currentChar, true)
      }
    }, 200)
  }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  new App()
})
