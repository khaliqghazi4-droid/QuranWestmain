import { siteConfig } from '@/lib/siteConfig'

const title = 'About Quran West | Online Quran Academy UK, USA & Canada'
// Under ~155 characters so Google shows it in full
const description =
  'Online Quran academy run from the UK and Pakistan, teaching families in the UK, USA, Canada, Europe & Australia. Live 1-to-1 lessons, free trial.'
const image = {
  url: '/hero.png',
  width: 1057,
  height: 795,
  alt: 'Boy reading the Quran during a live online lesson with his teacher',
}

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/about' },
  // A page's openGraph replaces the root one rather than merging with it,
  // so the shared fields are repeated here
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: `${siteConfig.url}/about`,
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
