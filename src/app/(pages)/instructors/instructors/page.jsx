"use client";

import Footer from '@/components/footer/footer'
import Header from '@/components/header/header'
import Link from 'next/link'
import { instructors } from './data'
import { motion } from 'framer-motion'
import Image from 'next/image'

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.6, ease: 'easeOut', delay },
})

const fadeLeft = (delay = 0) => ({
    initial: { opacity: 0, x: -50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.7, ease: 'easeOut', delay },
})

const Page = () => {
    return (
        <>
            <Header />
            <section className="page-content">
                <section
                    className="hero-banner-one"
                    style={{ backgroundImage: "url(/assets/images/hero-banner/bg-lines.png)" }}
                >
                    <div className="container">
                        <div className="flex flex-col items-center justify-center gap-10 md:flex-row">
                            <div className="">
                                <div className="hero-content">
                                    <img className="animted-star star1" src="/assets/images/star/star5.svg" alt="" aria-hidden="true" />
                                    <img className="animted-star star2" src="/assets/images/star/star6.svg" alt="" aria-hidden="true" />
                                    <motion.h1
                                        className="m-b20 !text-balance hidden md:block !text-[#0B1A37]"
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: false, amount: 0.3 }}
                                        transition={{ duration: 0.7, ease: 'easeOut' }}
                                    >
                                        Experienced Teachers. Personalized Learning. Lasting Results.
                                    </motion.h1>
                                    <motion.h1
                                        className="!text-4xl heading md:hidden !mb-10 !text-[#0B1A37]"
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: false, amount: 0.3 }}
                                        transition={{ duration: 0.7, ease: 'easeOut' }}
                                    >
                                        Experienced Teachers. Personalized Learning. Lasting Results.
                                    </motion.h1>
                                    <motion.p
                                        className="!mb-10"
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: false, amount: 0.3 }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                    >
                                        Our dedicated Quran teachers combine authentic Islamic knowledge with patient, engaging teaching methods to help students achieve their learning goals from the comfort of home.
                                    </motion.p>

                                </div>
                            </div>
                            <div className="col-xl-5 !rounded-2xl">
                                <motion.div
                                    className="!mb-6 md:!mb-1 !rounded-2xl"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.3 }}
                                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                                >
                                    <Image
                                        src="/teacher-hero.png"
                                        alt="Child learning Quran online with a qualified teacher"
                                        width={1200}
                                        height={1200}
                                        className="!rounded-2xl"
                                        priority
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-area py-5 bg-light">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-4 col-lg-5 m-b30">
                                <motion.div className="heading-bx style1 mb-lg-5" {...fadeLeft(0)}>
                                    <img className="animted-star star1" src="/assets/images/star/star5.svg" alt="" />
                                    <img className="animted-star star2" src="/assets/images/star/star6.svg" alt="" />
                                    <h2 className="title-head m-b0">
                                        Meet our Highly Skilled{' '}
                                        <span className="text-primary">Mentors</span>
                                    </h2>
                                </motion.div>
                                <ul className="achievement-list mb-md-5">
                                    {[
                                        { head: '500', color: 'yellow', label: 'Students Enrolled' },
                                        { head: '5+', color: 'green', label: 'Courses Available' },
                                        { head: '99.9%', color: 'pink', label: 'Satisfaction Rate' },
                                    ].map((stat, i) => (
                                        <motion.li key={stat.head} {...fadeUp(0.2 + i * 0.1)}>
                                            <div className={`achievement-head ${stat.color}`}>{stat.head}</div>
                                            <span>{stat.label}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                                {instructors.slice(0, 1).map((instructor, index) => (
                                    <motion.div
                                        key={instructor.id}
                                        className="mt-28 md:!w-[15.5rem]"
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: false, amount: 0.3 }}
                                        transition={{ duration: 0.5, ease: 'easeOut', delay: (index % 3) * 0.12 }}
                                        whileHover={{ y: -4 }}
                                    >
                                        <div className="team-member style1 data-item-hover">
                                            <div
                                                className="team-media data-img-hover"
                                                data-displacement="/assets/libs/tree/effect1.jpg"
                                                data-intensity="0.4"
                                                data-speedin={1}
                                                data-speedout={1}
                                            >
                                                <img
                                                    src={instructor.image}
                                                    alt={instructor.name}
                                                    style={{ width: '100%', height: '370px', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="team-info !bg-[#0B1A37]">
                                                <h5 className="member-name">
                                                    <Link className="stretched-link" href={`/instructors/${instructor.id}`}>
                                                        {instructor.name}
                                                    </Link>
                                                </h5>
                                                <span>{instructor.role}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="col-xl-8 col-lg-7">
                                <div className="row">
                                    {instructors.slice(1, 7).map((instructor, index) => (
                                        <motion.div
                                            key={instructor.id}
                                            className="col-xl-4 col-sm-6 m-b30"
                                            initial={{ opacity: 0, y: 50 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: false, amount: 0.3 }}
                                            transition={{ duration: 0.5, ease: 'easeOut', delay: (index % 3) * 0.12 }}
                                            whileHover={{ y: -4 }}
                                        >
                                            <div className="team-member style1 data-item-hover">
                                                <div
                                                    className="team-media data-img-hover"
                                                    data-displacement="/assets/libs/tree/effect1.jpg"
                                                    data-intensity="0.4"
                                                    data-speedin={1}
                                                    data-speedout={1}
                                                >
                                                    <img
                                                        src={instructor.image}
                                                        alt={instructor.name}
                                                        style={{ width: '100%', height: '370px', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div className="team-info !bg-[#0B1A37]">
                                                    <h5 className="member-name">
                                                        <Link className="stretched-link" href={`/instructors/${instructor.id}`}>
                                                            {instructor.name}
                                                        </Link>
                                                    </h5>
                                                    <span>{instructor.role}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* <div className="brand-swiper-section bg-light">
                    <div className="container">
                        <hr className="m-0" />
                        <div className="swiper brand-logo-swiper linear-swiper">
                            <div className="swiper-wrapper">
                                {[1, 2, 3, 4, 5, 1, 2].map((n, i) => (
                                    <div key={i} className="swiper-slide">
                                        <div className="brand-logo">
                                            <a href="javascript:void(0);">
                                                <img src={`/assets/images/brand/brand${n}.html`} alt="Partner" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div> */}
            </section>
            <Footer />
        </>
    )
}

export default Page

