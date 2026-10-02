import Link from 'next/link'

export const metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center"
      style={{ fontFamily: 'sans-serif' }}
    >
      <h1 className="text-6xl font-bold text-[#0B1A37] mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-[#0B1A37] mb-3">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/"
          className="bg-[#0B1A37] text-white px-6 py-3 rounded-lg hover:bg-[#EECC65] hover:text-[#0B1A37] transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/coursesGrid"
          className="border border-[#0B1A37] text-[#0B1A37] px-6 py-3 rounded-lg hover:bg-[#0B1A37] hover:text-white transition-colors"
        >
          Browse Courses
        </Link>
        <Link
          href="/contact"
          className="border border-[#0B1A37] text-[#0B1A37] px-6 py-3 rounded-lg hover:bg-[#0B1A37] hover:text-white transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </main>
  )
}
