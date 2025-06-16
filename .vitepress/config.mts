import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "MechLab",
  description: "本網站致力於分享機械原理與機械應用的知識，提供豐富的線上學習資源，適合對機械工程、結構設計與動力傳動有興趣的學生與自學者。透過簡單易懂的圖文說明與實例分析，幫助使用者在網路上輕鬆學習機械相關知識。",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Link1515/mechanical-learning' }
    ]
  },
  srcDir: 'src'
})
