import { siteConfig } from '@/lib/siteConfig'

const title = 'Quran West Reviews | What Families Say About Our Online Quran Classes'
const description =
  'Read real reviews from parents and students learning the Quran online with Quran West. Qualified teachers, live one-to-one lessons. Book a free trial.'
const image = {
  url: '/hero.png',
  width: 1057,
  height: 795,
  alt: 'Boy reading the Quran during a live online lesson with his teacher',
}

// The old /testimonials address redirects here (next.config.mjs)
export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/reviews' },
  // A page's openGraph replaces the root one rather than merging with it,
  // so the shared fields are repeated here
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: `${siteConfig.url}/reviews`,
    title,
    description,
    images: [image],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [image.url],
  },
}

export default function Layout({ children }) {
  return children
}
