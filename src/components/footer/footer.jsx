"use client";

import Image from 'next/image'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.6, ease: 'easeOut', delay },
})

const Footer = () => {
    return (
        <footer className="footer-style1">
            {/* decorative background */}
            <svg
                className="pointer-events-none absolute inset-0 w-full h-full z-0"
                style={{ position: 'absolute', top: 0, left: 0 }}
                viewBox="0 0 1440 600"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <defs>
                    <radialGradient id="ft-glow-l" cx="0%" cy="100%" r="55%">
                        <stop offset="0%" stopColor="#EECC65" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#EECC65" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="ft-glow-r" cx="100%" cy="0%" r="55%">
                        <stop offset="0%" stopColor="#EECC65" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#EECC65" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <ellipse cx="0" cy="600" rx="500" ry="380" fill="url(#ft-glow-l)" />
                <ellipse cx="1440" cy="0" rx="500" ry="380" fill="url(#ft-glow-r)" />

                {/* subtle grid */}
                {[120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320].map((x, i) => (
                    <line key={`vg-${i}`} x1={x} y1="0" x2={x} y2="600" stroke="#EECC65" strokeWidth="0.4" opacity="0.05" />
                ))}
                {[100, 200, 300, 400, 500].map((y, i) => (
                    <line key={`hg-${i}`} x1="0" y1={y} x2="1440" y2={y} stroke="#EECC65" strokeWidth="0.4" opacity="0.05" />
                ))}

                {/* constellation dots */}
                {[
                    [60, 80], [200, 180], [420, 60], [650, 200], [900, 50], [1150, 170], [1380, 90],
                    [100, 420], [350, 500], [600, 380], [850, 480], [1100, 400], [1360, 520],
                    [720, 290], [1440, 300],
                ].map(([cx, cy], i) => (
                    <circle key={`fd-${i}`} cx={cx} cy={cy} r="1.8" fill="#EECC65" opacity="0.28" />
                ))}
                <line x1="60" y1="80" x2="200" y2="180" stroke="#EECC65" strokeWidth="0.5" opacity="0.1" />
                <line x1="200" y1="180" x2="420" y2="60" stroke="#EECC65" strokeWidth="0.5" opacity="0.1" />
                <line x1="420" y1="60" x2="650" y2="200" stroke="#EECC65" strokeWidth="0.5" opacity="0.1" />
                <line x1="650" y1="200" x2="900" y2="50" stroke="#EECC65" strokeWidth="0.5" opacity="0.1" />
                <line x1="900" y1="50" x2="1150" y2="170" stroke="#EECC65" strokeWidth="0.5" opacity="0.1" />
                <line x1="1150" y1="170" x2="1380" y2="90" stroke="#EECC65" strokeWidth="0.5" opacity="0.1" />
                <line x1="100" y1="420" x2="350" y2="500" stroke="#EECC65" strokeWidth="0.5" opacity="0.08" />
                <line x1="350" y1="500" x2="600" y2="380" stroke="#EECC65" strokeWidth="0.5" opacity="0.08" />
                <line x1="600" y1="380" x2="850" y2="480" stroke="#EECC65" strokeWidth="0.5" opacity="0.08" />
                <line x1="850" y1="480" x2="1100" y2="400" stroke="#EECC65" strokeWidth="0.5" opacity="0.08" />
                <line x1="1100" y1="400" x2="1360" y2="520" stroke="#EECC65" strokeWidth="0.5" opacity="0.08" />

                {/* arc accents */}
                <path d="M 0 600 Q 360 200 720 300 T 1440 200" stroke="#EECC65" strokeWidth="0.7" fill="none" opacity="0.07" />
                <path d="M 0 400 Q 400 150 800 350 T 1440 150" stroke="#EECC65" strokeWidth="0.7" fill="none" opacity="0.05" />

                {/* diamond accents */}
                {[[720, 20], [100, 560], [1340, 560]].map(([cx, cy], i) => (
                    <polygon key={`fdi-${i}`}
                        points={`${cx},${cy - 6} ${cx + 5},${cy} ${cx},${cy + 6} ${cx - 5},${cy}`}
                        fill="none" stroke="#EECC65" strokeWidth="0.8" opacity="0.25" />
                ))}
            </svg>
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="footer-action">
                    <div className="row align-items-center justify-content-between">
                        <motion.div className="col-xl-5 col-lg-6 m-b30" {...fadeUp(0)}>
                            <h2 className="text-white !font-light m-b0 !tracking-tight !leading-tight">
                                Sign Up to Receive <br /> Our Latest Updates
                            </h2>
                        </motion.div>
                        <motion.div className="col-xl-5 col-lg-6 m-b30" {...fadeUp(0.15)}>
                            <form
                                className="subscribe-form1"
                                action="https://eduthink.layoutdrop.com/demo/assets/script/mailchamp.php"
                                method="post"
                            >
                                <div className="ajax-message" />
                                <div className="position-relative">
                                    <input
                                        name="email"
                                        className="form-control"
                                        placeholder="Your email here"
                                        type="email"
                                        required=""
                                    />
                                    <button
                                        name="submit"
                                        value="Submit"
                                        type="submit"
                                        className="btn btn-primary btn-standard btn-lg submit-btn"
                                    >
                                        Submit
                                        <span className="btn-icon bg-[#EECC65]">
                                            <img src="/assets/images/icon/arrow.svg" alt="" aria-hidden="true" />
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="row">
                    <div>
                        <div className="footer-top !rounded-2xl !overflow-hidden !relative">
                            <Image
                                src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1400&q=80"
                                alt=""
                                fill
                                style={{ objectFit: 'cover', opacity: 0.18, zIndex: 0 }}
                                aria-hidden="true"
                            />
                            {/* <div className="!absolute !inset-0" style={{ background: 'rgba(10,20,50,0.82)', zIndex: 1 }} /> */}
                            <div className="!flex flex-col md:flex-row !justify-between gap-12 !w-full !px-8 !relative" style={{ zIndex: 2 }}>
                                <motion.section {...fadeUp(0)}>
                                    <Link href="/" className="!relative !inline-block">
                                        <motion.span
                                            aria-hidden="true"
                                            className="!absolute !rounded-full !pointer-events-none"
                                            style={{
                                                top: '50%',
                                                left: '50%',
                                                width: 240,
                                                height: 240,
                                                marginTop: -120,
                                                marginLeft: -120,
                                                background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0) 75%)',
                                                filter: 'blur(20px)',
                                                zIndex: 0,
                                            }}
                                            animate={{ opacity: [0.35, 0.9, 0.35], scale: [0.85, 1.15, 0.85] }}
                                            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                        <Image
                                            src="/quran-academy-logo.png"
                                            alt="Quran West Academy"
                                            width={180}
                                            height={180}
                                            style={{ position: 'relative', zIndex: 1 }}
                                        />
                                    </Link>
                                    <ul className='!mt-10 !px-0'>
                                        <h3 className="footer-title !text-[#C59E5B] !tracking-wider !uppercase !text-xs !font-semibold !mb-3">Address</h3>
                                        <li>
                                            <p className="!text-white !font-semibold !text-sm !mb-0">Address 1</p>
                                            <span className="!text-white/75 !text-sm !leading-relaxed"> Watford Education Centre, Leavesden <br /> Road, Watford, WD24 5ER</span>
                                        </li>
                                        <li className='!mt-3'>
                                            <p className="!text-white !font-semibold !text-sm !mb-0">Address 2</p>
                                            <span className="!text-white/75 !text-sm !leading-relaxed"> 372-B, Block B People's Colony No 1,<br /> Faisalabad, 38000, Pakistan</span>
                                        </li>
                                    </ul>
                                </motion.section>
                                <section className="!flex !gap-20 !flex-wrap">
                                    {[
                                        {
                                            delay: 0.1,
                                            title: 'Links',
                                            links: [
                                                { href: '/', label: 'Home' },
                                                { href: '/about', label: 'About' },
                                                { href: '/coursesGrid', label: 'Courses' },
                                                { href: '/blogs', label: 'Blogs' },
                                                { href: '/faqs', label: 'FAQs' },
                                            ],
                                        },
                                        {
                                            delay: 0.2,
                                            title: 'Popular Courses',
                                            links: [
                                                { href: '/coursesGrid', label: 'Quran Reading' },
                                                { href: '/coursesGrid', label: 'Quran Memorization' },
                                                { href: '/coursesGrid', label: 'Tajweed rules' },
                                                { href: '/coursesGrid', label: 'Islamic studies' },
                                                { href: '/coursesGrid', label: 'Arabic language' },
                                            ],
                                        },
                                    ].map(({ delay, title, links }) => (
                                        <motion.div key={title} {...fadeUp(delay)}>
                                            <div className="widget footer_widget">
                                                <h4 className="!text-[#C59E5B] !tracking-wider !uppercase !text-xs !font-semibold !mb-3">{title}</h4>
                                                <ul>
                                                    {links.map(({ href, label }) => (
                                                        <li key={label}>
                                                            <Link className="!text-white/70 hover:!text-white !text-sm !font-medium !transition-colors !duration-150" href={href}>
                                                                {label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <motion.div {...fadeUp(0.3)}>
                                        <div className="widget footer_widget contact-info">
                                            <h4 className="footer-title !text-[#C59E5B] !tracking-wider !uppercase !text-xs !font-semibold !mb-3">Get in touch</h4>
                                            <ul>
                                                <li>
                                                    <p className="!text-white !font-semibold !text-sm !mb-1">Call us directly</p>
                                                    <Link className="!text-white/70 !text-sm !block hover:!text-white hover:!underline" href="tel:921234567890">+44 7508 803086</Link>
                                                    <Link className="!text-white/70 !text-sm !block hover:!text-white hover:!underline" href="tel:92 3188 068074">+92 3188 068074</Link>
                                                </li>
                                                <li className="!mt-3">
                                                    <p className="!text-white !font-semibold !text-sm !mb-1">Support</p>
                                                    <Link className="!text-white/70 !text-sm hover:!text-white hover:!underline" href="mailto:info@quranwest.com">info@quranwest.com</Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </motion.div>
                                </section>
                            </div>
                        </div>
                        <motion.div
                            className="footer-bottom text-center text-xl-start"
                            {...fadeUp(0.2)}
                        >
                            <p className="m-b0 !text-white/70 !tracking-wide !text-sm">
                                Copyright © {new Date().getFullYear()} Quran West. All Rights Reserved.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer

