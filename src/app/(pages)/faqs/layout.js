import { siteConfig } from '@/lib/siteConfig'

const title = 'Online Quran Classes FAQ | Prices, Teachers & Free Trial | Quran West'
const description =
  "Answers to parents' top questions about online Quran classes: prices, ages, female teachers, safety and time zones. Book a free trial with Quran West."
const image = {
  url: '/hero.png',
  width: 1057,
  height: 795,
  alt: 'Boy reading the Quran during a live online lesson with his teacher',
}

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/faqs' },
  // A page's openGraph replaces the root one rather than merging with it,
  // so the shared fields are repeated here
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: `${siteConfig.url}/faqs`,
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
