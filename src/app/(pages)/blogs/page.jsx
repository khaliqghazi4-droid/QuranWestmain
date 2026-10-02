"use client";

import Footer from '@/components/footer/footer'
import Header from '@/components/header/header'
import Link from 'next/link'
import { blogs } from './data'
import { LuMoveUpRight } from 'react-icons/lu'
import { motion } from 'framer-motion'
import Goldenlines from '@/components/goldenlines';

const Page = () => {
    return (
        <>
            <Header />
            <section className="page-content">
                <div className="page-banner bg-ovrl1 !bg-[#0B1A37]">
                    <Goldenlines />
                    <div className="container">
                        <div className="flex md:flex-row flex-col items-center !pt-10">
                            <div className="">
                                <div className="page-banner-entry">
                                    <img className="animted-star star1" src="/assets/images/star/star5.svg" alt="Photo" />
                                    <img className="animted-star star2" src="/assets/images/star/star6.svg" alt="Photo" />
                                    <motion.h1
                                        className="text-white !hidden md:!block"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        Blogs
                                    </motion.h1>
                                    <motion.h2
                                        className="text-white md:!hidden"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        Blogs
                                    </motion.h2>
                                    <motion.p
                                        className="text-white"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                    >
                                        Explore Islamic knowledge, Quran learning tips, and spiritual insights
                                        from our qualified scholars and educators.
                                    </motion.p>
                                </div>

                            </div>
                            <div>
                                {/* <motion.div
                                    className="banner-img"
                                    initial={{ opacity: 0, x: 60 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                >
                                    <img src="/tutor-hero.png" alt="Photo" />
                                </motion.div> */}
                            </div>
                        </div>
                    </div>
                </div>

                <section className="section-area py-5 bg-light !z-50">
                    <div className="container">
                        <div className="row">
                            {blogs.map((blog, index) => (
                                <motion.div
                                    key={blog.id}
                                    className="col-xl-4 col-lg-6 col-md-6 m-b30"
                                    initial={{ opacity: 1, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.3 }}
                                    transition={{ duration: 0.5, ease: 'easeOut', delay: (index % 3) * 0.12 }}
                                >
                                    <div className="blog-post style2">
                                        <div className="ld-post-media">
                                            <img
                                                src={blog.image}
                                                alt={blog.title}
                                                style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                                            />
                                            <Link className="post-btn" href={`/blogs/${blog.id}`}>
                                                <LuMoveUpRight color='black' size={70} className='p-2 !bg-[#EECC65] rounded-full' />
                                            </Link>
                                        </div>
                                        <div className="ld-post-info">
                                            <div className="ld-post-header">
                                                <span className="badge bg-primary mb-2" style={{ fontSize: '11px' }}>
                                                    {blog.category}
                                                </span>
                                                <h3 className="ld-post-title">
                                                    <Link className='font-semibold' href={`/blogs/${blog.id}`}>{blog.title}</Link>
                                                </h3>
                                                <p>{blog.excerpt}</p>
                                            </div>
                                            <div className="ld-post-footer">
                                                <ul className="ld-post-meta">
                                                    <li className="post-date">
                                                        <i className="icon-calendar" />{' '}
                                                        <span>{blog.date}</span>
                                                    </li>
                                                    <li className="post-author">
                                                        <i className="icon-circle-user" /> BY{' '}
                                                        <span>{blog.author}</span>
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

