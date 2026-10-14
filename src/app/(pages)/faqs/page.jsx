"use client";

import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import {
    FaEnvelope,
    FaWhatsapp,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Goldenlines from "@/components/goldenlines";
import { Accent, PageTitle, SectionHeading, Words, leadClass } from "@/components/lux/effects";
import FaqAccordion from "@/components/faq-accordion";
import { EMAIL, faqGroups } from "./data";
import Typewriter from "@/components/typewriter";
import EnrollModal from "@/components/enroll-modal";
import { WHATSAPP_NUMBER } from "@/components/WhatsappButton";

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

// Typed in the banner above the WhatsApp button, one after another. Kept to
// 30 characters or less so each fits on one line on a phone.
const BANNER_QUESTIONS = [
    "Have you any questions?",
    "How much do classes cost?",
    "Are female teachers available?",
    "Is it safe for my child?",
    "Can adults learn too?",
];

// All the questions above as FAQPage structured data for search engines
const faqJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap(({ items }) =>
        items.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
        })),
    ),
}).replace(/</g, "\\u003c");

// ─── Older FAQ Data (the tabbed block further down the page) ─────────────────
// That block is hidden for now; set to true to show it again
const SHOW_OLD_FAQS = false;

const faqSections = [
    {
        id: "general",
        label: "General Questions",
        title: "General Questions",
        faqs: [
            {
                q: "What are your courses about?",
                a: "Our courses are designed to help students of all ages learn the Quran, Tajweed, Islamic Studies, Arabic language, and other Islamic subjects through structured online classes led by qualified instructors.",
            },
            {
                q: "Who are these courses for?",
                a: "Our courses are suitable for everyone, including children, adults, beginners, and advanced learners. Whether you're starting your Quranic journey or looking to strengthen your existing knowledge, we have a programme for you.",
            },
            {
                q: "How do I enrol in a course?",
                a: "Simply click the 'Enroll Now' button on our website, fill out the registration form, and our team will contact you within 24 hours to help you choose the right course and schedule your free trial class.",
            },
            {
                q: "Can I join at any time?",
                a: "Yes. Enrolment is open throughout the year, allowing you to start your preferred course whenever you're ready.",
            },
        ],
    },
    {
        id: "structure",
        label: "Course Structure",
        title: "Course Structure & Learning",
        faqs: [
            {
                q: "How are your courses structured?",
                a: "Each course follows a well-organised curriculum with personalised one-on-one or small group classes, practical exercises, regular assessments, and continuous guidance from experienced teachers.",
            },
            {
                q: "How long does it take to complete a course?",
                a: "Course duration depends on the programme you choose and your learning pace. Some courses can be completed within a few months, while others are designed for continuous learning and long-term progress.",
            },
            {
                q: "Do you offer flexible class schedules?",
                a: "Yes. We offer flexible scheduling so students can choose class timings that best fit their daily routine, regardless of their time zone.",
            },
            {
                q: "Do I need any previous knowledge?",
                a: "No prior knowledge is required for beginner courses. We also offer intermediate and advanced programmes for students who already have experience.",
            },
        ],
    },
    {
        id: "benefits",
        label: "Benefits",
        title: "Benefits & Certification",
        faqs: [
            {
                q: "Will I receive a certificate?",
                a: "Yes. Students receive a digital certificate after successfully completing eligible courses or course levels.",
            },
            {
                q: "What are the benefits of learning with your academy?",
                a: "Our academy offers qualified teachers, personalised learning plans, flexible schedules, affordable fees, regular progress reports, and a supportive learning environment for students worldwide.",
            },
        ],
    },
    {
        id: "payments",
        label: "Payments & Refunds",
        title: "Payments & Refunds",
        faqs: [
            {
                q: "Do you offer free trial classes?",
                a: "Yes. We provide a free trial class so you can experience our teaching style, meet your instructor, and choose the course that best suits your goals before enrolling.",
            },
            {
                q: "What payment options are available?",
                a: "We offer affordable monthly plans with multiple secure payment methods for students from different countries.",
            },
            {
                q: "Do you offer refunds?",
                a: "Yes. If you're not satisfied during the eligible refund period, you can contact our support team to request a refund according to our refund policy.",
            },
        ],
    },
    {
        id: "support",
        label: "Support",
        title: "Support & Assistance",
        faqs: [
            {
                q: "How can I get help during my course?",
                a: "Our support team is available via WhatsApp and email. Teachers also provide regular guidance and answer questions during classes.",
            },
            {
                q: "Can I switch to another course later?",
                a: "Yes. If your learning goals change, our team can help you transfer to another suitable course based on your progress and interests.",
            },
        ],
    },
];

// ─── Single Accordion Item ────────────────────────────────────────────────────
function FaqItem({ q, a, isOpen, onToggle }) {
    return (
        <div className="faq-item">
            <button
                className={`faq-question ${isOpen ? "faq-question--open" : ""}`}
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span>{q}</span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="faq-chevron"
                >
                    <FiChevronDown size={18} />
                </motion.span>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                    >
                        <div className="faq-answer">{a}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const Page = () => {
    const [activeSection, setActiveSection] = useState("general");
    const [openIndex, setOpenIndex] = useState(0);

    const currentSection = faqSections.find((s) => s.id === activeSection);

    const handleSectionChange = (id) => {
        setActiveSection(id);
        setOpenIndex(0);
    };

    // Free-trial form, opened from answers and the closing section
    const [enrollOpen, setEnrollOpen] = useState(false);
    const openTrial = () => setEnrollOpen(true);

    // Jump bar: pinned just under the site header (which stays at the top of
    // the screen, 84px tall and 68px once scrolled) while the five groups are
    // in view. CSS sticky can't do it here: the theme sets overflow-x: hidden
    // on body, which stops position: sticky working, so it switches to fixed.
    // The header's height is measured, not assumed, and followed as it
    // shrinks, so the bar never slips behind it.
    const navRef = useRef(null);
    const barRef = useRef(null);
    const groupsRef = useRef(null);
    const [stuck, setStuck] = useState(false);
    const [barHeight, setBarHeight] = useState(0);
    const [headerBottom, setHeaderBottom] = useState(0);
    useEffect(() => {
        const header = document.querySelector("header");
        const update = () => {
            const nav = navRef.current;
            const bar = barRef.current;
            const groups = groupsRef.current;
            if (!nav || !bar || !groups) return;
            const below = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
            setHeaderBottom(below);
            setBarHeight(bar.offsetHeight);
            setStuck(
                nav.getBoundingClientRect().top < below &&
                    groups.getBoundingClientRect().bottom > below + bar.offsetHeight,
            );
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        const resized = header ? new ResizeObserver(update) : null;
        if (header) resized.observe(header);
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
            resized?.disconnect();
        };
    }, []);

    // It also highlights the group being read and keeps its pill in view on
    // phones, where the bar scrolls sideways
    const jumpRef = useRef(null);
    const [activeGroup, setActiveGroup] = useState(faqGroups[0].id);
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveGroup(entry.target.id);
                });
            },
            { rootMargin: "-30% 0px -60% 0px" },
        );
        faqGroups.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        const bar = jumpRef.current;
        const pill = bar?.querySelector(`[data-id="${activeGroup}"]`);
        if (bar && pill) bar.scrollTo({ left: pill.offsetLeft - 16, behavior: "smooth" });
    }, [activeGroup]);

    const jumpTo = (e, id) => {
        e.preventDefault();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        window.history.replaceState(null, "", `#${id}`);
    };

    return (
        <>
            <Header />

            <style>{`
                /* ── Banner ─────────────────────────────── */
                .faq-banner {
                    background-color: #0B1A37;
                    padding: 80px 16px 60px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                /* the type of the title comes from PageTitle (the home page style) */
                .faq-banner h1 {
                    max-width: 860px;
                    margin: 0 auto;
                }
                .faq-banner p {
                    color: rgba(255,255,255,0.75);
                    font-size: clamp(15px, 1.25vw, 17px);
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.6;
                }

                /* ── Layout ─────────────────────────────── */
                .faq-page {
                    background: #f8f8f8;
                    padding: 48px 16px 80px;
                }
                .faq-inner {
                    max-width: 860px;
                    margin: 0 auto;
                }

                /* ── Tab Nav ────────────────────────────── */
                .faq-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    background: #EECC65;
    border-radius: 12px;
    padding: 12px 14px;
    margin-bottom: 40px;
}

@media (min-width: 768px) {
    .faq-tabs {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}
                .faq-tab {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #0B1A37;
                    transition: background 0.2s ease, color 0.2s ease;
                    white-space: nowrap;
                }
                .faq-tab:hover {
                    background: rgba(11,26,55,0.1);
                }
                .faq-tab--active {
                    background: #0B1A37;
                    color: #fff;
                }
                @media (min-width: 768px) {
                    .faq-tab {
                        font-size: 1rem;
                        padding: 10px 20px;
                    }
                }

                /* ── Section Title ──────────────────────── */
                .faq-section-title {
                    font-size: clamp(1.1rem, 3vw, 1.4rem);
                    font-weight: 700;
                    color: #0B1A37;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #EECC65;
                }

                /* ── Accordion ──────────────────────────── */
                .faq-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .faq-item {
                    background: #fff;
                    border: 1px solid #e5e5e5;
                    border-radius: 10px;
                    overflow: hidden;
                    transition: box-shadow 0.2s ease;
                }
                .faq-item:hover {
                    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
                }
                .faq-question {
                    width: 100%;
                    background: none;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 18px;
                    font-size: clamp(0.875rem, 2vw, 1rem);
                    font-weight: 500;
                    color: #111;
                    text-align: left;
                    transition: background 0.2s ease, color 0.2s ease;
                }
                .faq-question--open {
                    background: #0B1A37;
                    color: #fff;
                }
                .faq-question--open .faq-chevron {
                    color: #EECC65;
                }
                .faq-chevron {
                    flex-shrink: 0;
                    display: inline-flex;
                    color: #0B1A37;
                }
                .faq-answer {
                    padding: 16px 18px 20px;
                    font-size: clamp(0.875rem, 2vw, 0.95rem);
                    color: #444;
                    line-height: 1.7;
                    background: #fff;
                    border-top: 1px solid #f0f0f0;
                }
            `}</style>

            <section className="page-content">
                <section className="faq-banner !py-[64px] md:!py-[88px]">
                    <Goldenlines />
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}>

                        <PageTitle tone="dark">
                            <Words text="Online Quran Classes:" />
                            <Accent text="Your Questions Answered" tone="dark" delay={0.2} />
                        </PageTitle>
                        <p className={`mt-[14px] text-balance ${leadClass("dark")}`}>
                            Everything parents and adult learners ask before booking: ages,
                            prices, teachers, safety and time zones.
                        </p>
                        {/* Types and deletes parent questions in turn, one line high so
                            the button below never moves */}
                        <Typewriter
                            phrases={BANNER_QUESTIONS}
                            className="mt-[18px] min-h-[1.4em] whitespace-nowrap text-[clamp(18px,4.6vw,24px)] font-semibold leading-[1.4] text-[#EECC65]"
                        />
                        {/* Same button style as Book a Free Trial, glowing gold on hover */}
                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-standard btn-lg mt-[18px] w-full hover:!shadow-[0_0_0_4px_rgba(238,204,101,0.22),0_0_32px_6px_rgba(238,204,101,0.5)] focus-visible:!shadow-[0_0_0_4px_rgba(238,204,101,0.22),0_0_32px_6px_rgba(238,204,101,0.5)] sm:w-auto"
                        >
                            Message us on WhatsApp
                            <span className="btn-icon">
                                <FaWhatsapp className="h-[22px] w-[22px]" aria-hidden="true" />
                            </span>
                        </a>
                    </motion.div>
                </section>

                {/* Jump links to the five groups; the nav keeps the bar's
                    height in the page while the bar itself is pinned */}
                <nav
                    ref={navRef}
                    aria-label="FAQ sections"
                    className="relative z-30 min-h-[61px]"
                    style={{ height: barHeight || undefined }}
                >
                    <div
                        ref={barRef}
                        // top-[0px], not top-0: the theme's .top-0 is
                        // !important and would beat the pinned top here
                        style={stuck ? { top: headerBottom } : undefined}
                        className={`${
                            stuck
                                ? "fixed shadow-[0_6px_20px_rgba(11,26,55,0.08)]"
                                : "absolute top-[0px]"
                        } inset-x-0 border-b-[1px] border-solid border-[#0B1A37]/10 bg-white/95 backdrop-blur-[6px]`}
                    >
                        <div
                            ref={jumpRef}
                            className="mx-auto flex max-w-[1100px] gap-[8px] overflow-x-auto px-[16px] py-[12px] [scrollbar-width:none] lg:justify-center [&::-webkit-scrollbar]:hidden"
                        >
                            {faqGroups.map(({ id, nav }) => {
                                const active = activeGroup === id;
                                return (
                                    <a
                                        key={id}
                                        href={`#${id}`}
                                        data-id={id}
                                        onClick={(e) => jumpTo(e, id)}
                                        aria-current={active ? "true" : undefined}
                                        className={`shrink-0 whitespace-nowrap rounded-full px-[16px] py-[8px] text-[14px] font-semibold !no-underline transition-colors md:text-[15px] ${
                                            active
                                                ? "bg-[#0B1A37] !text-[#EECC65]"
                                                : "bg-[#0B1A37]/[0.05] !text-[#0B1A37] hover:bg-[#EECC65]/30"
                                        }`}
                                    >
                                        {nav}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* The five groups. Every answer is in the HTML; the first
                    question of each group starts open */}
                <div ref={groupsRef} className="bg-[#F3F5F9] px-[16px] py-[56px] lg:py-[72px]">
                    <div className="mx-auto flex max-w-[860px] flex-col gap-[56px] lg:gap-[64px]">
                        {faqGroups.map(({ id, title, Icon, items }) => (
                            <section
                                key={id}
                                id={id}
                                aria-labelledby={`${id}-title`}
                                // clear of the header (68px) and the jump bar under it
                                className="scroll-mt-[150px]"
                            >
                                <div className="mb-[20px] flex items-center gap-[14px]">
                                    <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] bg-[#0B1A37] text-[#EECC65]">
                                        <Icon className="h-[19px] w-[19px]" aria-hidden="true" />
                                    </span>
                                    <div>
                                        <h2
                                            id={`${id}-title`}
                                            className="!m-0 !text-[24px] !font-extrabold !leading-tight !tracking-[-0.02em] !text-[#0B1A37] md:!text-[28px]"
                                        >
                                            {title}
                                        </h2>
                                        <p className="!mt-[2px] !mb-0 !text-[14px] !font-semibold !text-[#9B7930]">
                                            {items.length} questions
                                        </p>
                                    </div>
                                </div>
                                <FaqAccordion items={items} idPrefix={`faq-${id}`} onTrial={openTrial} />
                            </section>
                        ))}
                    </div>
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: faqJsonLd }}
                    />
                </div>

                {/* Older FAQs (tabbed). Hidden for now; set SHOW_OLD_FAQS to
                    true to bring them back */}
                {SHOW_OLD_FAQS && (
                <div className="faq-page">
                    <div className="faq-inner">

                        {/* Tab Navigation */}
                        <motion.nav
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className="faq-tabs" aria-label="FAQ categories">
                            {faqSections.map((section) => (
                                <button
                                    key={section.id}
                                    className={`faq-tab ${activeSection === section.id ? "faq-tab--active" : ""}`}
                                    onClick={() => handleSectionChange(section.id)}
                                >
                                    {section.label}
                                </button>
                            ))}
                        </motion.nav>

                        {/* Active Section */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.22, ease: "easeOut" }}
                            >
                                <h3 className="border-b pb-2 border-gray-400">{currentSection.title}</h3>
                                <div className="faq-list pt-2">
                                    {currentSection.faqs.map((item, i) => (
                                        <FaqItem
                                            key={i}
                                            q={item.q}
                                            a={item.a}
                                            isOpen={openIndex === i}
                                            onToggle={() =>
                                                setOpenIndex(openIndex === i ? null : i)
                                            }
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                    </div>
                </div>
                )}

                {/* Closing call to action */}
                <section className="bg-white px-[16px] py-[56px] lg:py-[72px]">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[24px] bg-[#0B1A37] px-[24px] py-[44px] text-center md:px-[48px] md:py-[56px]"
                    >
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(238,204,101,0.14),transparent_65%)]"
                        />
                        <div className="relative mx-auto max-w-[640px]">
                            <SectionHeading tone="dark">
                                <Words text="Still Have" />
                                <Accent text="Questions?" tone="dark" delay={0.12} />
                            </SectionHeading>
                            <p className={`!mt-[14px] ${leadClass("dark")}`}>
                                Talk to us or book a free trial class. Meet your teacher before you
                                commit.
                            </p>
                            <button
                                type="button"
                                onClick={openTrial}
                                className="btn btn-secondary btn-standard btn-lg mt-[28px] w-full sm:w-auto"
                            >
                                Book a Free Trial
                                <span className="btn-icon">
                                    <img src="/assets/images/icon/arrow.svg" alt="" aria-hidden="true" />
                                </span>
                            </button>
                            <p className="!mt-[20px] !mb-0 flex flex-wrap items-center justify-center gap-x-[12px] gap-y-[6px] !text-[15px] !text-white/60">
                                <a
                                    href={WHATSAPP_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-[6px] font-semibold !text-[#EECC65] !no-underline hover:!text-white"
                                >
                                    <FaWhatsapp aria-hidden="true" />
                                    WhatsApp us
                                </a>
                                {/* on phones the two links take a line each,
                                    so the dot would hang at the end of the first */}
                                <span aria-hidden="true" className="max-sm:hidden">·</span>
                                <a
                                    href={`mailto:${EMAIL}`}
                                    className="inline-flex items-center gap-[6px] font-semibold !text-[#EECC65] !no-underline hover:!text-white"
                                >
                                    <FaEnvelope aria-hidden="true" />
                                    Email {EMAIL}
                                </a>
                            </p>
                        </div>
                    </motion.div>
                </section>

            </section>

            <Footer />

            <EnrollModal open={enrollOpen} onClose={() => setEnrollOpen(false)} />
        </>
    );
};

export default Page;