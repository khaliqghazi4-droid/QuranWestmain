"use client";

import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Goldenlines from "@/components/goldenlines";

// ─── FAQ Data ────────────────────────────────────────────────────────────────
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
                a: "Our courses are suitable for everyone, including children, adults, beginners, and advanced learners. Whether you're starting your Quranic journey or looking to strengthen your existing knowledge, we have a program for you.",
            },
            {
                q: "How do I enroll in a course?",
                a: "Simply click the 'Enroll Now' button on our website, fill out the registration form, and our team will contact you within 24 hours to help you choose the right course and schedule your free trial class.",
            },
            {
                q: "Can I join at any time?",
                a: "Yes. Enrollment is open throughout the year, allowing you to start your preferred course whenever you're ready.",
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
                a: "Each course follows a well-organized curriculum with personalized one-on-one or small group classes, practical exercises, regular assessments, and continuous guidance from experienced teachers.",
            },
            {
                q: "How long does it take to complete a course?",
                a: "Course duration depends on the program you choose and your learning pace. Some courses can be completed within a few months, while others are designed for continuous learning and long-term progress.",
            },
            {
                q: "Do you offer flexible class schedules?",
                a: "Yes. We offer flexible scheduling so students can choose class timings that best fit their daily routine, regardless of their time zone.",
            },
            {
                q: "Do I need any previous knowledge?",
                a: "No prior knowledge is required for beginner courses. We also offer intermediate and advanced programs for students who already have experience.",
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
                a: "Our academy offers qualified teachers, personalized learning plans, flexible schedules, affordable fees, regular progress reports, and a supportive learning environment for students worldwide.",
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
                a: "Our support team is available via WhatsApp, email, and live chat. Teachers also provide regular guidance and answer questions during classes.",
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
                .faq-banner h1 {
                    color: #fff;
                    font-size: clamp(1.8rem, 5vw, 3rem);
                    font-weight: 700;
                    margin-bottom: 12px;
                }
                .faq-banner p {
                    color: rgba(255,255,255,0.75);
                    font-size: clamp(0.875rem, 2vw, 1rem);
                    max-width: 500px;
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

                /* ── CTA ────────────────────────────────── */
                .faq-cta {
                    background: #fff;
                    text-align: center;
                    padding: 60px 16px;
                    border-top: 1px solid #ebebeb;
                }
                .faq-cta h2 {
                    font-size: clamp(1.4rem, 4vw, 2rem);
                    font-weight: 700;
                    color: #0B1A37;
                    margin-bottom: 10px;
                }
                .faq-cta p {
                    color: #666;
                    font-size: clamp(0.875rem, 2vw, 1rem);
                    max-width: 480px;
                    margin: 0 auto 28px;
                    line-height: 1.6;
                }
            `}</style>

            <section className="page-content">
                <section className="faq-banner !py-[8.75rem]">
                    <Goldenlines />
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}>

                        <h1 className="hidden md:block">Frequently Asked Questions</h1>
                        <h2 className="text-white md:hidden">Frequently Asked Questions</h2>
                        <p className="text-balance">
                            Find answers to common questions about our courses, enrollment,
                            payments, and support.
                        </p>
                    </motion.div>
                </section>

                {/* FAQ Body */}
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

                {/* CTA */}
                <section className="faq-cta">
                    <div>
                        <h2>Get Started for Free</h2>
                        <p>
                            Best online education platforms offer flexible learning, quality
                            courses, and expert instructors.
                        </p>
                        <a
                            href="/coursesGrid"
                            className="btn btn-primary btn-lg btn-standard"
                        >
                            See Courses
                            <span className="btn-icon">
                                <img src="/assets/images/icon/arrow.svg" alt="" />
                            </span>
                        </a>
                    </div>
                </section>

            </section>

            <Footer />
        </>
    );
};

export default Page;