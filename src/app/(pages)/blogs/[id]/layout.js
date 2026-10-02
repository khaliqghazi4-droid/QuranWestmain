import { blogs } from '@/app/(pages)/blogs/data'
import { siteConfig } from '@/lib/siteConfig'

export async function generateMetadata({ params }) {
  const { id } = await params
  const blog = blogs.find((b) => b.id === id)

  if (!blog) {
    return {
      title: 'Article Not Found',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: blog.title,
    description: blog.excerpt,
    keywords: blog.tags,
    authors: blog.author ? [{ name: blog.author }] : undefined,
    alternates: { canonical: `/blogs/${id}` },
    openGraph: {
      title: `${blog.title} | ${siteConfig.name}`,
      description: blog.excerpt,
      url: `${siteConfig.url}/blogs/${id}`,
      type: 'article',
      publishedTime: blog.date,
      authors: blog.author ? [blog.author] : undefined,
      tags: blog.tags,
      images: blog.image ? [{ url: blog.image, width: 1200, height: 630, alt: blog.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.excerpt,
      images: blog.image ? [blog.image] : undefined,
    },
  }
}

export default function Layout({ children }) {
  return children
}
