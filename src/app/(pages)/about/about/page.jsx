"use client";

import Footer from '@/components/footer/footer'
import Header from '@/components/header/header'
import React from 'react'
import { FaStar } from "react-icons/fa";
import { FaTimes } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Goldenlines from '@/components/goldenlines';
import { FaPlay } from "react-icons/fa";

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

const fadeRight = (delay = 0) => ({
    initial: { opacity: 0, x: 50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.7, ease: 'easeOut', delay },
})

const scaleIn = (delay = 0) => ({
    initial: { opacity: 0, scale: 0.9 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.5, ease: 'easeOut', delay },
})

const Page = () => {
    const testimonialRef = useRef(null);
    const [testimonialVisible, setTestimonialVisible] = useState(false);
    const [activeCard, setActiveCard] = useState(0);

    const videoRef = useRef(null);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const openVideoModal = () => setIsVideoOpen(true);
    const closeVideoModal = () => {
        setIsVideoOpen(false);
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isVideoOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeVideoModal();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isVideoOpen]);

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

    return (
        <>
            <Header />
            <section className="page-content">
                {/* begin::About Us Page Banner */}
                <div className="page-banner bg-ovrl1 !bg-[#0B1A37]">
                    <Goldenlines />
                    <div className="container">
                        <div className="flex md:flex-row flex-col items-center !pt-10">
                            <div className="">
                                <div className="page-banner-entry">
                                    <img
                                        className="animted-star star1"
                                        src="/assets/images/star/star5.svg"
                                        alt="Photo"
                                    />
                                    <img
                                        className="animted-star star2"
                                        src="/assets/images/star/star6.svg"
                                        alt="Photo"
                                    />
                                    <motion.h1
                                        className="text-white !hidden md:!block"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                    >
                                        About Us
                                    </motion.h1>
                                    <motion.h2
                                        className="text-white md:!hidden"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                    >
                                        About Us
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                                    >
                                        Best online education platforms offer flexible learning, quality
                                        courses, and expert instructors.
                                    </motion.p>
                                </div>
                            </div>
                            <div className='!z-10'>
                                <motion.div
                                    className=""
                                    initial={{ opacity: 0, x: 60 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                                >
                                    <img src="/about-img.png" alt="Photo" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* end::About Us Page Banner */}

                {/* begin::About us section */}
                <section className="section-area section-sp1 bg-light">
                    <div className="container">
                        <div className="row align-items-center">
                            <motion.div
                                className="col-lg-6 m-b30 pe-lg-5"
                                {...fadeLeft(0)}
                            >
                                <div>
                                    <img src="/about-hero.png" alt="Photo" />
                                </div>
                            </motion.div>
                            <div className="col-lg-6 m-b30">
                                <motion.div className="heading-bx style1" {...fadeRight(0.1)}>
                                    <h3>
                                        Let&apos;s Learn About New Knowledge and Abilities.
                                    </h3>
                                    <p className="mw-100">
                                        At <span className="!font-semibold underline">Quran West</span>, we believe that Quranic education should be accessible, engaging, and spiritually enriching for everyone. Our mission is to provide high-quality online Quran classes with experienced teachers, helping students of all ages strengthen their Quran recitation, Tajweed, memorization, Arabic, and Islamic knowledge while growing closer to Allah.
                                    </p>
                                </motion.div>
                                <ul className="achievement-list style2 mb-sm-3 pt-sm-3 flex flex-col">
                                    {[
                                        { head: '2K', color: 'green', label: 'Hours completed' },
                                        { head: '99.9%', color: 'pink', label: 'Satisfaction rate' },
                                        { head: '500', color: 'yellow', label: 'Enrolled' },
                                        { head: '30', color: 'purple', label: 'Top Instructors' },
                                    ].map((stat, i) => (
                                        <motion.li key={stat.head} {...fadeUp(0.2 + i * 0.1)}>
                                            <div className={`achievement-head ${stat.color}`}>{stat.head}</div>
                                            <span>{stat.label}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
                {/* end::About us section */}

                {/* begin::Marquee One */}
                <div className="marquee-one bg-[#EECC65]">
                    <div className="marquee-track">
                        {[0, 1].map((set) => (
                            <div key={set} className="marquee-set" aria-hidden={set === 1 ? "true" : undefined}>
                                {[
                                    "Parent Review — Manchester, UK",
                                    "“We tried two other academies before QuranWest. Our son actually asks to attend his class now.”",
                                    "Sister Hafsa R. — Manchester, United Kingdom",
                                    "14 live classes happening right now across 3 time zones",
                                    "Hifz Programme — Mariam, age 11 · Juz 18 of 30",
                                    "Parent Review — Manchester, UK",
                                ].map((text) => (
                                    <span key={text}>
                                        <img src="/assets/images/star.svg" alt="" />
                                        {text}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                {/* end::Marquee One */}


                {/* Start::.service-card-1 */}
                <div className="section-area bg-primary video-section-bg">
                    <div className="container">
                        <div className="row section-sp1">
                            <div className="col-12">
                                <motion.div className="heading-bx style1 text-center" {...fadeUp(0)}>
                                    <h2 className="title-head-sm text-white">
                                        Why learn with our courses?
                                    </h2>
                                </motion.div>
                            </div>
                            {[

                                {
                                    delay: 0.1,
                                    num: "01",
                                    title: "Choose a Course",
                                    desc: "Select the Quran or Islamic course that matches your learning goals.",
                                    svg: (
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M2.0418 2.04192C0.333252 3.75046 0.333252 6.50032 0.333252 12C0.333252 17.4997 0.333252 20.2497 2.0418 21.9581C3.75034 23.6667 6.50019 23.6667 11.9999 23.6667C17.4996 23.6667 20.2495 23.6667 21.958 21.9581C23.6666 20.2497 23.6666 17.4997 23.6666 12C23.6666 6.50032 23.6666 3.75046 21.958 2.04192C20.2495 0.333374 17.4996 0.333374 11.9999 0.333374C6.50019 0.333374 3.75034 0.333374 2.0418 2.04192ZM10.3002 6.77015C10.6335 6.42022 10.62 5.86636 10.27 5.53309C9.9201 5.19981 9.36624 5.21332 9.03297 5.56326L6.33326 8.39796L5.63354 7.66326C5.30027 7.31332 4.74641 7.29981 4.39647 7.63309C4.04653 7.96636 4.03302 8.52021 4.3663 8.87015L5.69964 10.2701C5.86478 10.4436 6.09379 10.5417 6.33326 10.5417C6.57273 10.5417 6.80172 10.4436 6.96687 10.2701L10.3002 6.77015ZM13.1666 7.62504H18.9999V9.37504H13.1666ZM10.3002 14.9368L6.96687 18.4368L4.3663 17.0368L5.69964 18.4368H6.33326L10.3002 14.9368ZM13.1666 15.7917H18.9999V17.5417H13.1666Z"
                                            fill="#0B1A37"
                                        />
                                    ),
                                    vbW: 24,
                                    vbH: 24,
                                },
                                {
                                    delay: 0.2,
                                    num: "02",
                                    title: "Book Your Trial",
                                    desc: "Schedule a fully free our trial class and meet your qualified Quran teacher whenever you want.",
                                    svg: (
                                        <>
                                            <path d="M4.28317 0.304321C4.01599 0.304321 3.76691 0.407554 3.57883 0.595164C3.38868 0.784848 3.28394 1.03741 3.28394 1.30629V16.3307C3.28394 16.8816 3.73392 17.3309 4.28713 17.3323C6.61934 17.3379 10.5267 17.824 13.2223 20.6448V4.92141C13.2223 4.73465 13.1746 4.5592 13.0845 4.41402C10.8721 0.851124 6.62066 0.309789 4.28317 0.304321Z" fill="#0B1A37" />
                                            <path d="M24.7161 16.3306V1.30617C24.7161 1.03729 24.6113 0.784726 24.4212 0.595042C24.2331 0.407432 23.9838 0.304199 23.7193 0.304199C21.3794 0.309762 17.128 0.851097 14.9155 4.41399C14.8254 4.55918 14.7778 4.73463 14.7778 4.92139V20.6447C17.4734 17.8239 21.3808 17.3378 23.713 17.3322C24.2661 17.3308 24.7161 16.8815 24.7161 16.3306Z" fill="#0B1A37" />
                                            <path d="M26.9983 3.76917H26.2718V16.3306C26.2718 17.7373 25.1256 18.8844 23.7168 18.8879C21.7386 18.8926 18.4768 19.2794 16.1667 21.4658C20.162 20.4876 24.3737 21.1235 26.774 21.6705C27.0737 21.7387 27.3834 21.6682 27.6235 21.4768C27.8628 21.2859 28 21.0005 28 20.6942V4.77095C28 4.21858 27.5506 3.76917 26.9983 3.76917Z" fill="#0B1A37" />
                                            <path d="M1.72828 16.3306V3.76917H1.00178C0.44951 3.76917 0 4.21858 0 4.77095V20.694C0 21.0003 0.137266 21.2856 0.37654 21.4765C0.616473 21.6678 0.925889 21.7386 1.22606 21.6702C3.62634 21.1231 7.83814 20.4873 11.8332 21.4655C9.52324 19.2792 6.26146 18.8925 4.28326 18.8878C2.87449 18.8844 1.72828 17.7373 1.72828 16.3306Z" fill="#0B1A37" />
                                        </>
                                    ),
                                    vbW: 28,
                                    vbH: 22,
                                },
                                {
                                    delay: 0.3,
                                    num: "03",
                                    title: "Start Learning",
                                    desc: "Attend live online classes with personalized guidance and flexible timings.",
                                    svg: (
                                        <path d="M20.5312 0H3.46875C1.95938 0 0.734375 1.225 0.734375 2.73438V25.2656C0.734375 26.775 1.95938 28 3.46875 28H20.5312C22.0406 28 23.2656 26.775 23.2656 25.2656V2.73438C23.2656 1.225 22.0406 0 20.5312 0ZM12 7.30078C14.2477 7.30078 16.0742 9.12187 16.0742 11.375C16.0742 13.6281 14.2531 15.4492 12 15.4492C9.74687 15.4492 7.92578 13.6281 7.92578 11.375C7.92578 9.12187 9.75234 7.30078 12 7.30078Z" fill="#0B1A37" />
                                    ),
                                    vbW: 24,
                                    vbH: 28,
                                },
                                {
                                    delay: 0.4,
                                    num: "04",
                                    title: "Achieve Your Goals",
                                    desc: "Build confidence in Quran recitation, Tajweed, Hifz, and Islamic knowledge.",
                                    svg: (
                                        <>
                                            <path d="M18.479 19.6231L19.7593 17.5454L22.07 16.7573L22.326 14.3305L24.0645 12.619L23.2379 10.3218L24.0645 8.02457L22.3261 6.31312L22.0701 3.88631L19.7594 3.09827L18.479 1.02052L16.0572 1.31294L13.9999 0L11.9426 1.31305L9.52081 1.02063L8.24041 3.09832L5.92976 3.88637L5.67376 6.31318L3.9353 8.02462L4.76185 10.3219L3.9353 12.6191L5.67371 14.3305L5.9297 16.7574L8.24036 17.5454L9.52076 19.6231L11.9426 19.3308L13.9999 20.6438L16.0572 19.3308L18.479 19.6231Z" fill="#0B1A37" />
                                            <path d="M11.5553 21.0311L8.67436 21.3789L7.15225 18.9088L6.63479 18.7324L4.40283 25.7087L8.421 25.4877L11.5647 28L13.4147 22.2178L11.5553 21.0311Z" fill="#0B1A37" />
                                            <path d="M20.8476 18.9089L19.3255 21.3789L16.4446 21.0311L14.5852 22.2178L16.4352 28L19.5789 25.4877L23.597 25.7087L21.3651 18.7324L20.8476 18.9089Z" fill="#0B1A37" />
                                        </>
                                    ),
                                    vbW: 28,
                                    vbH: 28,
                                },

                            ].map(({ delay, num, title, desc, svg, vbW, vbH }) => (
                                <motion.div
                                    key={num}
                                    className="col-xl-3 col-md-6 m-b30"
                                    {...scaleIn(delay)}
                                >
                                    <div className="featured-bx6">
                                        <div className="featured-icon flex items-center justify-center">
                                            <svg width={vbW} height={vbH} viewBox={`0 0 ${vbW} ${vbH}`} fill="none" xmlns="http://www.w3.org/2000/svg">
                                                {svg}
                                            </svg>
                                        </div>
                                        <div className="featured-content">
                                            <h4 className="featured-title !font-semibold">{title}</h4>
                                            <p>{desc}</p>
                                            <div className="number">{num}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <motion.div className="video-card-one" {...fadeUp(0.5)}>
                            <video
                                className="!w-full !rounded-[25px]"
                                src="https://res.cloudinary.com/dlnnjkoes/video/upload/v1783607090/0709_e10lfp.mp4"
                                poster="/assets/images/thumb.PNG"
                                playsInline
                                muted
                            />
                            <button
                                type="button"
                                onClick={openVideoModal}
                                className="play-btn flex items-center justify-center"
                                style={{ border: 'none', cursor: 'pointer' }}
                                aria-label="Play video"
                            >
                                <FaPlay color="#0B1A37" />
                            </button>
                        </motion.div>
                    </div>
                </div>
                {/* End::.service-card-1 */}

                {/* begin::Learning Focused on Your Goals */}
                <section className="section-area section-sp1 bg-light">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-xl-4">
                                {/* <div className="row align-items-center">
                                    <motion.div
                                        className="col-xl-12 d-none d-xl-block"
                                        {...fadeLeft(0)}
                                    >
                                        <div className="m-b15">
                                            <img
                                                className='!rounded-xl'
                                                src="https://images.unsplash.com/photo-1624862762003-8b04581301aa?q=80&w=1242&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                                alt="Photo"https://www.youtube.com/watch?v=PkkV1vLHUvQ
                                            />
                                        </div>
                                    </motion.div>
                                   
                                    <motion.div className="" {...fadeRight(0.2)}>
                                        <ul className="list-style1 m-0">
                                            <li>Learn from top quran teachers in anywhere the world</li>
                                            <li>In-person classes &amp; doubt solving</li>
                                            <li>Bonus access to online learning</li>
                                        </ul>
                                    </motion.div>
                                </div> */}
                            </div>
                            <div className="">
                                <div className="">
                                    <motion.div className="col-lg-6 col-md-6 m-b30" {...fadeUp(0.1)}>
                                        <div className="heading-bx style1 mb-0">
                                            <h2 className="title-head-sm m-b0 !mt-10">
                                                Learning Focused on Your Goals
                                            </h2>
                                        </div>
                                    </motion.div>

                                </div>
                                <div className="row">
                                    {[
                                        {
                                            delay: 0.3,
                                            title: "Live Quran Classes",
                                            img: "/hero.png",
                                            desc: "Learn the Holy Quran with qualified teachers through interactive online classes tailored to your learning level.",
                                        },
                                        {
                                            delay: 0.4,
                                            title: "Practice with Tajweed",
                                            img: "https://images.unsplash.com/photo-1596125160970-6f02eeba00d3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                            desc: "Improve your Quran recitation through regular practice, Tajweed lessons, and personalized teacher feedback.",
                                        },
                                        {
                                            delay: 0.5,
                                            title: "Flexible Learning",
                                            img: "https://images.unsplash.com/photo-1728484702067-49bfc341d1e5?q=80&w=1159&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                            desc: "Study the Quran from anywhere with flexible schedules designed for children and adults worldwide.",
                                        },
                                    ].map(({ delay, title, img, desc }) => (
                                        <motion.div
                                            key={title}
                                            className="col-lg-4 col-md-6 m-b30"
                                            {...scaleIn(delay)}
                                        >
                                            <div className="featured-bx1 data-item-hover bg-white">
                                                <div className="featured-media data-img-hover">
                                                    <img src={img} alt={title} />
                                                </div>

                                                <div className="featured-content">
                                                    <div className="featured-title h3">
                                                        <h6 className="stretched-link">{title}</h6>
                                                    </div>

                                                    <p>{desc}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* end::Learning Focused on Your Goals */}

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

                {/* begin::Brand Swiper */}
                {/* <div className="brand-swiper-section">
                    <div className="container">
                        <hr className="m-0" />
                        <div className="swiper brand-logo-swiper linear-swiper">
                            <div className="swiper-wrapper">
                                {[1, 2, 3, 4, 5, 1, 2].map((n, i) => (
                                    <div key={i} className="swiper-slide">
                                        <div className="brand-logo">
                                            <a href="javascript:void(0);">
                                                <img src={`/assets/images/brand/brand${n}.html`} alt="Photo" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div> */}
                {/* end::Brand Swiper */}
            </section>
            <Footer />

            {isMounted && createPortal(
                <AnimatePresence>
                    {isVideoOpen && (
                        <motion.div
                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={closeVideoModal}
                        >
                            <motion.div
                                className="relative w-full max-w-3xl"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    onClick={closeVideoModal}
                                    aria-label="Close video"
                                    className="absolute !-top-10 !right-0 !text-white !text-2xl !leading-none !bg-transparent !border-none !cursor-pointer hover:!text-amber-300 !transition-colors"
                                >
                                    <FaTimes />
                                </button>
                                <video
                                    ref={videoRef}
                                    className="!w-full !rounded-xl !shadow-2xl !bg-black"
                                    src="https://res.cloudinary.com/dlnnjkoes/video/upload/v1783607090/0709_e10lfp.mp4"
                                    poster="/aboutVideoPic.webp"
                                    controls
                                    autoPlay
                                    playsInline
                                    preload="auto"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}

export default Page

