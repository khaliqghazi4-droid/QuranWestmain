"use client";

import Footer from '@/components/footer/footer'
import Header from '@/components/header/header'
import React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Goldenlines from '@/components/goldenlines';
import { useRef } from 'react';
import { FaStar } from 'react-icons/fa';

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.6, ease: 'easeOut', delay },
})

const fadeRight = (delay = 0) => ({
    initial: { opacity: 0, x: 50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.7, ease: 'easeOut', delay },
})

const Page = () => {
    const [activeCard, setActiveCard] = useState(0);
    const testimonialRef = useRef(null);
    const [testimonialVisible, setTestimonialVisible] = useState(false);

    useEffect(() => {
        const el = testimonialRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setTestimonialVisible(entry.isIntersecting),
            { threshold: 0.25 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveCard((prev) => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(timer);
    }, []);


    useEffect(() => {
        const timer = setInterval(() => {
            setActiveCard((prev) => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <Header />
            <section className="page-content">
                <div className="page-banner bg-ovrl1 !bg-[#0B1A37]">
                    <Goldenlines />
                    <div className="container">
                        <div className="flex flex-col md:flex-row py-10 !justify-between !items-center">
                            <div className="!z-10 !overflow-hidden">
                                <img className="animted-star star1 !z-0" src="/assets/images/star/star5.svg" alt="Photo" />
                                <img className="animted-star star2 !z-0" src="/assets/images/star/star6.svg" alt="Photo" />
                                <motion.h1
                                    className="text-white !hidden md:!block"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    Testimonials
                                </motion.h1>
                                <motion.h2
                                    className="text-white md:!hidden"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    Testimonials
                                </motion.h2>
                                <motion.p
                                    className="text-white"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    Best online education platforms offer flexible learning,<br /> quality courses, and expert instructors.
                                </motion.p>
                            </div>
                            <div className='!z-10'>
                                <motion.div
                                    initial={{ opacity: 0, x: 60 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                >
                                    <Image width={500} height={500} src="/img.png" alt="Photo" className='!rounded-lg' />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="section-area section-sp1 bg-light">
                    <div className="container">
                        <motion.div className="heading-bx style1 text-center !mb-12" {...fadeUp(0)}>
                            <h2 className="title-head-sm">Students Experience</h2>
                            <p className="text-muted">Real words from real students across the world</p>
                        </motion.div>

                        {(() => {
                            const reviews = [
                                {
                                    name: "Aisha Rahman",
                                    country: "Manchester, UK",
                                    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
                                    review: "Alhamdulillah, the one-to-one sessions completely changed how I recite. My teacher noticed my exact mistakes and corrected them with such patience. In just three months I went from stumbling to reading fluently.",
                                    stars: 5,
                                },
                                {
                                    name: "Yusuf Al-Farsi",
                                    country: "Birmingham, UK",
                                    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
                                    review: "My son was anxious about learning online but his teacher made every class feel like a conversation, not a lesson. He now reminds us when it's time for class — that says everything.",
                                    stars: 5,
                                },
                                {
                                    name: "Fatimah Noor",
                                    country: "Toronto, Canada",
                                    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
                                    review: "The flexible timing was a lifesaver. I work full time and still managed to complete Juz Amma with proper Tajweed. The progress reports kept me motivated throughout.",
                                    stars: 5,
                                },
                            ];

                            const leftAvatars = [
                                { src: "https://cdn.leonardo.ai/users/e1498e34-a2e9-4f7c-8334-3e9b6df12c05/generations/7da2f46f-4afb-407d-945f-e6b52562e20d/segments/3:4:1/Lucid_Realism_Make_a_real_avatar_2.jpg?w=512", name: "Omar S.", size: "w-16 h-16", offset: "mt-0" },
                                { src: "https://static.vecteezy.com/system/resources/thumbnails/054/880/144/small/thoughtful-young-boy-gazing-into-the-vast-serene-sky-with-clouds-free-photo.jpeg", name: "Maryam K.", size: "w-12 h-12", offset: "mt-8 !ml-8" },
                                { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP81wNtaGgpdksH7WScZEf22o_1TPx4Lz2jbxU4wEbQw&s", name: "Bilal R.", size: "w-20 h-20", offset: "mt-4" },
                            ];
                            const rightAvatars = [
                                { src: "https://c.stocksy.com/a/DXx300/z9/943839.jpg", name: "Sara T.", size: "w-20 h-20", offset: "mt-0" },
                                { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7orJEgsjeQ7i03BvU9FcSWEfIYJ86LqR7CQ&s", name: "Hamza M.", size: "w-12 h-12", offset: "mt-10 !mr-8" },
                                { src: "https://www.shutterstock.com/image-vector/friendly-cartoon-illustration-young-muslim-600nw-2693400781.jpg", name: "Nadia H.", size: "w-16 h-16", offset: "mt-2" },
                            ];

                            const current = reviews[activeCard];

                            return (
                                <div className="flex items-center justify-center gap-6 md:gap-12">
                                    {/* left avatars */}
                                    <motion.div
                                        className="hidden md:flex flex-col items-end gap-4"
                                        initial={{ opacity: 0, x: -40 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: false, amount: 0.3 }}
                                        transition={{ duration: 0.7, ease: 'easeOut' }}
                                    >
                                        {leftAvatars.map((a, i) => (
                                            <div key={i} className={`${a.offset} flex flex-col items-center gap-1`}>
                                                <img
                                                    src={a.src}
                                                    alt={a.name}
                                                    className={`${a.size} rounded-full object-cover ring-2 ring-[#EECC65] shadow-md`}
                                                />
                                                <span className="text-xs text-gray-500 font-medium">{a.name}</span>
                                            </div>
                                        ))}
                                    </motion.div>

                                    {/* center review */}
                                    <motion.div
                                        className="flex-1 max-w-lg text-center"
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: false, amount: 0.3 }}
                                        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeCard}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.45, ease: 'easeOut' }}
                                                className="bg-white rounded-2xl shadow-lg px-8 py-10 flex flex-col items-center"
                                            >
                                                <img
                                                    src={current.avatar}
                                                    alt={current.name}
                                                    className="w-20 h-20 rounded-full object-cover ring-4 ring-[#EECC65] mb-4 shadow"
                                                />
                                                <div className="flex gap-1 mb-4">
                                                    {[...Array(current.stars)].map((_, i) => (
                                                        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#EECC65"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                                    ))}
                                                </div>
                                                <p className="text-gray-700 text-base leading-relaxed italic mb-5">
                                                    &ldquo;{current.review}&rdquo;
                                                </p>
                                                <p className="font-semibold text-[#0B1A37] text-sm mb-0">{current.name}</p>
                                                <p className="text-xs text-gray-400">{current.country}</p>
                                            </motion.div>
                                        </AnimatePresence>

                                        {/* dots indicator */}
                                        <div className="flex justify-center gap-2 mt-5">
                                            {reviews.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setActiveCard(i)}
                                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeCard ? 'bg-[#EECC65] !w-6' : 'bg-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* right avatars */}
                                    <motion.div
                                        className="hidden md:flex flex-col items-start gap-4"
                                        initial={{ opacity: 0, x: 40 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: false, amount: 0.3 }}
                                        transition={{ duration: 0.7, ease: 'easeOut' }}
                                    >
                                        {rightAvatars.map((a, i) => (
                                            <div key={i} className={`${a.offset} flex flex-col items-center gap-1`}>
                                                <img
                                                    src={a.src}
                                                    alt={a.name}
                                                    className={`${a.size} rounded-full object-cover ring-2 ring-[#EECC65] shadow-md`}
                                                />
                                                <span className="text-xs text-gray-500 font-medium">{a.name}</span>
                                            </div>
                                        ))}
                                    </motion.div>
                                </div>
                            );
                        })()}
                    </div>
                </section>

                {/* begin::What Our Students Have to Say */}
                <section className="section-area section-sp1 testimonial-section-one bg-white">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 position-relative">
                                <motion.div className="heading-bx style1 mb-lg-5" {...fadeUp(0)}>
                                    <h2 className="title-head m-b0">
                                        What Our <span className="!font-semibold text-amber-300">Students</span> Have to Say
                                    </h2>
                                    <p>
                                        Our students consistently praise the transformative learning
                                        experience we provide. Here&apos;s what they say about our courses
                                    </p>
                                </motion.div>
                            </div>
                            <div className="col-lg-6">
                                <motion.div
                                    ref={testimonialRef}
                                    className="testimonial-wrapper-one"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={testimonialVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
                                >
                                    {(() => {
                                        const testimonials = [
                                            {
                                                name: "Aisha Rahman",
                                                role: "Quran Student",
                                                review: "Alhamdulillah, Quran West has helped me improve my Quran recitation and Tajweed with patient and knowledgeable teachers. The classes are well-structured and enjoyable.",
                                            },
                                            {
                                                name: "Muhammad Ibrahim",
                                                role: "Parent",
                                                review: "My children love their Quran classes. The instructors are kind, punctual, and make learning the Quran easy to understand. We have seen remarkable progress in a short time.",
                                            },
                                            {
                                                name: "Fatimah Noor",
                                                role: "Hifz Student",
                                                review: "The personalized guidance and flexible class schedule have made my Hifz journey much easier. I highly recommend Quran West to anyone seeking quality online Quran education.",
                                            },
                                        ];
                                        const t = testimonials[activeCard];
                                        return (
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={activeCard}
                                                    initial={{ opacity: 0, x: -80 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 80 }}
                                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                                >
                                                    <div className="testimonial-card">
                                                        <div className="rating-wrap">
                                                            <div className="d-flex gap-1">
                                                                {[...Array(5)].map((_, j) => (
                                                                    <FaStar key={j} className="text-warning" />
                                                                ))}
                                                            </div>
                                                            <span className="text-dark">Trusted Online Quran Academy</span>
                                                        </div>
                                                        <div className="testimonial-content">
                                                            <p>{t.review}</p>
                                                        </div>
                                                        <div className="testimonial-info">
                                                            <div className="clearfix">
                                                                <h6 className="testimonial-name">{t.name}</h6>
                                                                <p>{t.role}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </AnimatePresence>
                                        );
                                    })()}

                                    <div className="pagination-wrapper">
                                        <div className="testimonial-btn-prev1 swiper-button-prev">
                                            <i className="fi fi-rr-arrow-small-left" />
                                        </div>

                                        <div className="testimonial-pagination swiper-pagination" />

                                        <div className="testimonial-btn-next1 swiper-button-next">
                                            <i className="fi fi-rr-arrow-small-right" />
                                        </div>

                                        <div className="swiper-pagination-fraction" />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* end::What Our Students Have to Say */}
            </section>
            <Footer />
        </>
    )
}

export default Page

