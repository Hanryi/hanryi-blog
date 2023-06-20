import { defineConfig } from 'vitepress'
import markdownItKatex from 'markdown-it-katex'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head: [
    ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css', crossorigin: '' }]
  ],
  
  base: '/',
  title: "Hanryi Blog",
  description: "Powered by VitePress",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Tech', link: '/tech/reservoir-sampling-algo' },
      { text: 'Examples', link: '/examples/markdown-examples' }
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
      '/examples/': [
        {
          text: 'Examples',
          collapsed: true,
          items: [
            { text: 'Markdown Examples', link: '/markdown-examples' },
            { text: 'Runtime API Examples', link: '/api-examples' }
          ]
        }
      ]
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
