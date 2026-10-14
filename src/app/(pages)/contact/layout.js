import { siteConfig } from '@/lib/siteConfig'

const title = 'Contact Quran West | Online Quran Classes UK, USA & Canada'
const description =
  'Contact Quran West on WhatsApp, phone or email. Ask about classes and prices, or book a free trial. Office in Watford, UK. We reply within 24 hours.'
const image = {
  url: '/hero.png',
  width: 1057,
  height: 795,
  alt: 'Boy reading the Quran during a live online lesson with his teacher',
}

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/contact' },
  // A page's openGraph replaces the root one rather than merging with it,
  // so the shared fields are repeated here
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: `${siteConfig.url}/contact`,
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
