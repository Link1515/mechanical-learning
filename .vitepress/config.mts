import { defineConfig } from 'vitepress';
import linkageSidebar from './sidbars/linkage';
import drawLineSidebar from './sidbars/drawLine';

const base = '/mechanical-learning/';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'MechLab',
  description:
    '本網站致力於分享機械原理與機械應用的知識，提供豐富的線上學習資源，適合對機械工程、結構設計與動力傳動有興趣的學生與自學者。透過簡單易懂的圖文說明與實例分析，幫助使用者在網路上輕鬆學習機械相關知識。',
  base,
  head: [
    ['link', { rel: 'icon', href: `${base}logo.svg`}],
    [
      'script',
      {
        async: '',
        src: 'https://www.googletagmanager.com/gtag/js?id=G-JB6NE4N87S'
      }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-JB6NE4N87S');`
    ]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首頁', link: '/' },
      { text: '關於本站', link: '/about-project' },
      { text: '連桿機構', link: '/linkage/four-bar/home' },
      { text: '線條繪製機構', link: '/draw-line/straight-line' }
    ],

    sidebar: {
      '/linkage': linkageSidebar,
      '/draw-line': drawLineSidebar
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/Link1515/mechanical-learning'
      }
    ],

    footer: {
      copyright: 'Copyright © 2016-present Terry Lin'
    },

    search: {
      provider: 'local'
    }
  },
  srcDir: 'src',
  markdown: {
    math: true
  }
});
