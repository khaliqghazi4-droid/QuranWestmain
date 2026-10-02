import { siteConfig } from '@/lib/siteConfig'

export default function manifest() {
  return {
    name: siteConfig.name,
    short_name: 'QuranWest',
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0B1A37',
    icons: [
      { src: '/favicon.ico', sizes: '192x192', type: 'image/png' },
      { src: '/favicon.ico', sizes: '512x512', type: 'image/png' },
    ],
  }
}
