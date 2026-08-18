/** Aka Nasu — Docusaurus landing site.
 *  Single-page landing under /aka-nasu/; docs + blog plugins are disabled until
 *  there is real content to ship. See src/pages/index.tsx for the page.
 */

export default {
  title: 'Aka Nasu · トマトの時計',
  tagline: 'A pomodoro focus timer built around one tomato.',
  favicon: 'img/favicon.svg',

  url: 'https://d3ucey.github.io',
  baseUrl: '/aka-nasu/',
  organizationName: 'd3uceY',
  projectName: 'aka-nasu',
  trailingSlash: true,

  onBrokenLinks: 'throw',

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  headTags: [
    { tagName: 'meta', attributes: { property: 'og:title', content: 'Aka Nasu · トマトの時計' } },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:description',
        content: 'A pomodoro focus timer for the desktop, built around one tomato.',
      },
    },
    {
      tagName: 'meta',
      attributes: { property: 'og:image', content: 'https://d3ucey.github.io/aka-nasu/screenshots/home/home.png' },
    },
    { tagName: 'meta', attributes: { property: 'og:url', content: 'https://d3ucey.github.io/aka-nasu/' } },
    { tagName: 'meta', attributes: { property: 'og:type', content: 'website' } },
    { tagName: 'meta', attributes: { name: 'twitter:card', content: 'summary_large_image' } },
    { tagName: 'meta', attributes: { name: 'theme-color', content: '#fcfbf9' } },
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
  },
};
