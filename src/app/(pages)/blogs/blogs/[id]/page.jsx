'use client'

import Footer from '@/components/footer/footer'
import Header from '@/components/header/header'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import { getBlogById, blogs } from '../data'
import { LuMoveUpRight } from 'react-icons/lu'
import { motion } from 'framer-motion'

const Page = () => {
    const { id } = useParams()
    const blog = getBlogById(id)

    if (!blog) {
        notFound()
    }

    const relatedBlogs = blogs.filter((b) => b.id !== blog.id).slice(0, 3)

    return (
        <>
            <Header />
            <section className="page-content">
                <div className="page-banner bg-ovrl1 !bg-[#0B1A37]">
                    <div className="container">
                        <div className="row align-items-center h-[25rem]">
                            <div className="col-xl-8 col-lg-9 col-md-11">
                                <div className="page-banner-entry">
                                    <img className="animted-star star1" src="/assets/images/star/star5.svg" alt="" />
                                    <img className="animted-star star2" src="/assets/images/star/star6.svg" alt="" />
                                    <motion.h1
                                        className="text-white !hidden md:!block"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        {blog.title}
                                    </motion.h1>
                                    <motion.h3
                                        className="!font-extralight text-white md:!hidden"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        {blog.excerpt}
                                    </motion.h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="section-area section-sp1 bg-light">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8">
                                <motion.div
                                    className="instructor-card m-b30"
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: false, amount: 0.3 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <div className="card-body p-0">
                                        <img
                                            src={blog.image}
                                            alt={blog.title}
                                            style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="instructor-card m-b30"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.3 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                >
                                    <div className="card-head">
                                        <div className="d-flex align-items-center gap-3">
                                            <img
                                                src={blog.authorImage}
                                                alt={blog.author}
                                                style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            <div>
                                                <h6 className="m-b0">{blog.author}</h6>
                                                <span className="text-muted" style={{ fontSize: '13px' }}>{blog.category} · {blog.readTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {blog.content.split('\n\n').map((paragraph, i) => (
                                            <p key={i} style={{ marginBottom: '1rem', lineHeight: '1.8' }}>{paragraph}</p>
                                        ))}
                                        <div className="d-flex flex-wrap gap-2 mt-4">
                                            {blog.tags.map((tag) => (
                                                <span key={tag} className="badge bg-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="col-lg-4">
                                <motion.div
                                    className="course-features-detail"
                                    initial={{ opacity: 0, x: 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, amount: 0.3 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    <div className="course-features-list">
                                        <h5 className="featured-title">About the Author</h5>
                                        <div className="divider" />
                                        <div className="text-center py-3">
                                            <img
                                                src={blog.authorImage}
                                                alt={blog.author}
                                                style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', marginBottom: '12px' }}
                                            />
                                            <h6>{blog.author}</h6>
                                            <p className="text-muted" style={{ fontSize: '13px' }}>{blog.category} Expert</p>
                                        </div>
                                        <div className="divider" />
                                        <ul>
                                            <li>Category <span>{blog.category}</span></li>
                                            <li>Published <span>{blog.date}</span></li>
                                            <li>Read Time <span>{blog.readTime}</span></li>
                                        </ul>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="instructor-card mt-4"
                                    initial={{ opacity: 0, x: 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, amount: 0.3 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    <div className="p-3">
                                        <h5 className="title m-b0 !z-0">Tags</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex flex-wrap gap-2">
                                            {blog.tags.map((tag) => (
                                                <Link key={tag} href="/blogs" className="btn btn-outline-primary btn-sm" style={{ fontSize: '12px' }}>
                                                    #{tag}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-area section-sp1 bg-light">
                    <div className="container">
                        <motion.div
                            className="heading-bx style1 d-flex align-items-center justify-content-between mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="title-head-xs m-b0">Related Articles</h2>
                            <Link href="/blogs" className="btn btn-outline-primary btn-sm">View All</Link>
                        </motion.div>
                        <div className="row">
                            {relatedBlogs.map((related, index) => (
                                <motion.div
                                    key={related.id}
                                    className="col-lg-4 col-md-6 m-b30"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.3 }}
                                    transition={{ duration: 0.5, delay: index * 0.12 }}
                                    whileHover={{ y: -4 }}
                                >
                                    <div className="blog-post style2">
                                        <div className="ld-post-media">
                                            <img
                                                src={related.image}
                                                alt={related.title}
                                                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                            />
                                            <Link className="post-btn" href={`/blogs/${related.id}`}>
                                                <LuMoveUpRight color='black' size={70} className='p-2 !bg-[#EECC65] rounded-full' />
                                            </Link>
                                        </div>
                                        <div className="ld-post-info">
                                            <div className="ld-post-header">
                                                <span className="badge bg-primary mb-1" style={{ fontSize: '11px' }}>{related.category}</span>
                                                <h3 className="ld-post-title">
                                                    <Link href={`/blogs/${related.id}`}>{related.title}</Link>
                                                </h3>
                                                <p>{related.excerpt}</p>
                                            </div>
                                            <div className="ld-post-footer">
                                                <ul className="ld-post-meta">
                                                    <li className="post-date">
                                                        <i className="icon-calendar" /> <span>{related.date}</span>
                                                    </li>
                                                    <li className="post-author">
                                                        <i className="icon-circle-user" /> BY <span>{related.author}</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </section>
            <Footer />
        </>
    )
}

export default Page
