"use client";

import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import { useState, useRef, useEffect } from 'react';
import { Clock, CalendarDays, CalendarCheck2, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Goldenlines from '@/components/goldenlines';

const COURSES = [
    "Quran Reading",
    "Tajweed Course",
    "Quran Memorization",
    "Islamic Studies",
    "Arabic Language",
    "Quran Tafseer (Interpretation)",
];

const CURRENCY_META = {
    USD: { name: "US Dollar", symbol: "$" },
    CAD: { name: "Canadian Dollar", symbol: "C$" },
    GBP: { name: "British Pound", symbol: "£" },
    EUR: { name: "Euro", symbol: "€" },
};

const CURRENCIES = Object.keys(CURRENCY_META);

const formatFee = (currency, amount) => {
    if (currency === "CAD") return `CAD ${amount}`;
    return `${CURRENCY_META[currency].symbol}${amount}`;
};

const courseSlug = (course) => course.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const Page = () => {
    const [currency, setCurrency] = useState("GBP");
    const [currencyOpen, setCurrencyOpen] = useState(false);
    const [activeCourse, setActiveCourse] = useState(COURSES[0]);
    const currencyDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
                setCurrencyOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCourseTabClick = (course) => {
        setActiveCourse(course);
        document.getElementById(courseSlug(course))?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const pricingData = [
        {
            id: "A",
            name: "Plan A",
            schedule: "2 Days / Week",
            sessionsPerWeek: "2 sessions",
            sessionsPerMonth: 8,
            fees: { USD: 37, CAD: 52, GBP: 29, EUR: 34 },
        },
        {
            id: "B",
            name: "Plan B",
            schedule: "3 Days / Week",
            sessionsPerWeek: "3 sessions",
            sessionsPerMonth: 12,
            fees: { USD: 53, CAD: 74, GBP: 40, EUR: 49 },
        },
        {
            id: "C",
            name: "Plan C",
            schedule: "4 Days / Week",
            sessionsPerWeek: "4 sessions",
            sessionsPerMonth: 16,
            fees: { USD: 66, CAD: 93, GBP: 51, EUR: 60 },
        },
        {
            id: "D",
            name: "Plan D",
            schedule: "5 Days / Week",
            sessionsPerWeek: "5 sessions",
            sessionsPerMonth: 20,
            fees: { USD: 84, CAD: 118, GBP: 64, EUR: 76 },
        },
        {
            id: "E",
            name: "Plan E",
            schedule: "6 Days / Week",
            sessionsPerWeek: "6 sessions",
            sessionsPerMonth: 24,
            fees: { USD: 101, CAD: 142, GBP: 77, EUR: 92 },
        },
        {
            id: "F",
            name: "Plan F",
            schedule: "Weekend",
            sessionsPerWeek: "Weekend",
            sessionsPerMonth: 8,
            fees: { USD: 48, CAD: 68, GBP: 37, EUR: 44 },
        },
    ];

    return (
        <section>
            <Header />

            <style>{`
                .pricing-page-banner {
                    --banner-height: 300px !important;
                }
                @media (max-width: 1479.98px) {
                    .pricing-page-banner {
                        --banner-height: 250px !important;
                    }
                }
                @media (max-width: 1199.98px) {
                    .pricing-page-banner {
                        --banner-height: 220px !important;
                    }
                }
                @media (max-width: 767.98px) {
                    .pricing-page-banner {
                        --banner-height: 200px !important;
                    }
                }
                @media (max-width: 575.98px) {
                    .pricing-page-banner {
                        --banner-height: 170px !important;
                    }
                }
            `}</style>

            <section className="page-content">
                {/* Banner Section */}
                <div className="page-banner pricing-page-banner bg-ovrl2 !bg-[#0B1A37]">
                    <Goldenlines />
                    <div className="container">
                        <div className="row align-items-center justify-content-center text-center">
                            <div className="col-xl-5 col-lg-6 col-md-10">
                                <div className="page-banner-entry">

                                    <img className="animted-star star1" src="/assets/images/star/star5.svg" alt="Photo" />
                                    <img className="animted-star star2" src="/assets/images/star/star6.svg" alt="Photo" />

                                    <motion.h1
                                        className="text-white !hidden md:!block"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        Our Courses & Plans
                                    </motion.h1>
                                    <motion.h2
                                        className="text-white md:!hidden"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        Our Courses & Plans
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                        className='mt-3'
                                    >
                                        Every plan includes a free trial one-to-one sessions.
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <section className="section-area !py-10 bg-light pricing-section">
                    <div className="container">
                        {/* <motion.div
                            className="text-center max-w-2xl mx-auto mb-10"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-block text-[13px] font-bold uppercase tracking-[2px] text-[#997C36] mb-2">
                                Our Courses & Plans
                            </span>
                            <h2 className="!text-[#0C1A37]">Pricing for Every Course</h2>
                            <p className="!text-slate-500">
                                Every plan includes 30-minute one-to-one sessions. Pick a course, choose how many days a week you'd like to learn, then view the fee in your preferred currency.
                            </p>
                        </motion.div> */}

                        <motion.div
                            className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 lg:flex-wrap lg:overflow-visible">
                                {COURSES.map((course) => (
                                    <button
                                        key={course}
                                        type="button"
                                        onClick={() => handleCourseTabClick(course)}
                                        className={`shrink-0 whitespace-nowrap !rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${activeCourse === course
                                            ? 'bg-[#0C1A37] text-white'
                                            : 'bg-white border !border-slate-200 text-slate-600 hover:!border-[#997C36] hover:text-[#0C1A37]'
                                            }`}
                                    >
                                        {course}
                                    </button>
                                ))}
                            </div>

                            <div className="relative shrink-0 self-start lg:self-auto" ref={currencyDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setCurrencyOpen((open) => !open)}
                                    className="flex items-center gap-2.5 !rounded-lg bg-white border !border-slate-200 pl-2.5 pr-3 py-2 text-sm font-semibold text-[#0C1A37] shadow hover:!border-[#997C36] transition-colors"
                                >
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0C1A37]/[0.08] text-xs font-bold text-[#0C1A37]">
                                        {CURRENCY_META[currency].symbol}
                                    </span>
                                    {currency}
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${currencyOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {currencyOpen && (
                                        <motion.ul
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 z-20 mt-2 divide-y !divide-slate-100 overflow-hidden rounded-xl border !border-slate-200 bg-white !shadow-lg !pl-0"
                                        >
                                            {CURRENCIES.map((code) => (
                                                <li key={code}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setCurrency(code);
                                                            setCurrencyOpen(false);
                                                        }}
                                                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${currency === code
                                                            ? 'bg-[#0C1A37]/[0.06]'
                                                            : 'hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0C1A37]/[0.08] text-sm font-bold text-[#0C1A37]">
                                                            {CURRENCY_META[code].symbol}
                                                        </span>
                                                        <span className="flex flex-1 flex-col leading-tight">
                                                            <span className="text-sm font-semibold text-[#0C1A37]">{code}</span>
                                                            <span className="text-xs text-slate-400 whitespace-nowrap">
                                                                {CURRENCY_META[code].name}
                                                            </span>
                                                        </span>
                                                        {currency === code && <Check size={16} className="shrink-0 text-[#997C36]" />}
                                                    </button>
                                                </li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        <div className="!space-y-[6.5rem] md:!space-y-36 ">
                            {COURSES.map((course) => (
                                <motion.div
                                    key={course}
                                    id={courseSlug(course)}
                                    className="scroll-mt-32"
                                    initial={{ opacity: 1, y: 0 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.15 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#0C1A37] to-[#997C36]" />
                                        <h3 className="!text-[#0C1A37] !text-2xl md:!text-4xl !m-0">{course}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {pricingData.map((plan, idx) => (
                                            <motion.div
                                                key={plan.id}
                                                viewport={{ once: false, amount: 0.3 }}
                                                transition={{ duration: 0.5, ease: 'easeOut', delay: idx * 0.06 }}
                                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                                className="group flex flex-col rounded-2xl bg-white border !border-slate-200 shadow-[0_4px_18px_rgba(11,26,55,0.06)] hover:shadow-[0_18px_36px_rgba(11,26,55,0.14)] hover:!border-[#997C36] transition-shadow duration-300 overflow-hidden"
                                            >
                                                <div className="h-1.5 w-full bg-gradient-to-r from-[#0C1A37] to-[#997C36]" />

                                                <div className="flex flex-col flex-1 p-6">
                                                    <span className="text-[14px] font-bold uppercase tracking-[1.5px] text-[#997C36] mb-1">
                                                        {plan.name}
                                                    </span>
                                                    <h5 className="!text-[#0C1A37] !text-xl !mb-4">{plan.schedule}</h5>

                                                    <div className="mb-5 min-h-12">
                                                        <AnimatePresence mode="wait">
                                                            <motion.div
                                                                key={currency}
                                                                initial={{ opacity: 0, y: 6 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -6 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="flex items-baseline gap-1"
                                                            >
                                                                <span className="text-4xl md:text-5xl  font-semibold text-[#0C1A37]">
                                                                    {formatFee(currency, plan.fees[currency])}
                                                                </span>
                                                                <span className="text-slate-400 text-sm font-medium">/mo</span>
                                                            </motion.div>
                                                        </AnimatePresence>
                                                    </div>

                                                    <ul className="!text-[15px] !font-semibold text-slate-600  !px-0">
                                                        <li className="flex items-center gap-2">
                                                            <Clock size={16} className="text-[#997C36] shrink-0" />
                                                            30 min / session
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <CalendarDays size={16} className="text-[#997C36] shrink-0" />
                                                            {plan.sessionsPerWeek} / week
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <CalendarCheck2 size={16} className="text-[#997C36] shrink-0" />
                                                            {plan.sessionsPerMonth} sessions / month
                                                        </li>
                                                    </ul>

                                                    <motion.a
                                                        href="contact-us.html"
                                                        className="mt-auto inline-flex items-center justify-center rounded-lg bg-[#0C1A37] !text-white font-semibold py-3 hover:bg-[#997C36] transition-colors duration-300"
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                    >
                                                        Choose Plan
                                                    </motion.a>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </section>
            <Footer />
        </section>
    );
};

export default Page;

