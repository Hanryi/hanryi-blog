import { defineConfig } from 'vitepress'
import markdownItKatex from 'markdown-it-katex'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head: [
    ['link', { rel: 'icon', href: '/hanryi-art.svg' }],
    ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css', crossorigin: '' }]
  ],
  
  base: '/',
  title: "Hanryi Blog",
  description: "Powered by VitePress",
  themeConfig: {
    logo: '/hanryi-art.svg',    
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Tech', link: '/tech/reservoir-sampling-algo' },
    ],

    sidebar: {
      '/tech/': [
        {
          text: 'Algorithm',
          collapsed: false,
          items: [
            { text: 'Reservoir Sampling', link: '/reservoir-sampling-algo' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Hanryi' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present <a href="https://github.com/Hanryi">Hanryi</a>'
    }
  },
  lastUpdated: true,

  markdown: {
    lineNumbers: true,
    // katex render
    config: (md) => {
      md.use(markdownItKatex)
    }
  },
})
