"use client";

import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import EnrollModal from '@/components/enroll-modal';
import PricingPlans from '@/components/pricing/pricing-plans';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Clock, Gift, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import Goldenlines from '@/components/goldenlines';
import { Accent, PageTitle, Words, leadClass } from '@/components/lux/effects';

// What every plan includes, shown under the banner's intro
const BANNER_POINTS = [
    { Icon: Clock, text: "30-minute lessons" },
    { Icon: UserRound, text: "One-to-one with a teacher" },
    { Icon: Gift, text: "Free trial class" },
];

const Page = () => {
    const [enrollCourse, setEnrollCourse] = useState(null);

    return (
        <section>
            <Header />

            <section className="page-content">
                {/* Banner: the site's gold lines, soft glows and a dot grid behind
                    a centred heading, intro and what every plan includes */}
                <section className="relative overflow-hidden !bg-[#0B1A37] py-[52px] lg:py-[68px]">
                    <div className="pointer-events-none opacity-60">
                        <Goldenlines />
                    </div>
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(238,204,101,0.07)_1px,transparent_1px)] [background-size:22px_22px]"
                    />
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                        <div className="absolute left-1/2 top-[-40%] h-[80%] w-[50%] -translate-x-1/2 rounded-full bg-[#EECC65] opacity-[0.10] blur-[120px]" />
                        <div className="absolute bottom-[-40%] right-[-10%] h-[80%] w-[40%] rounded-full bg-[#2B4A8C] opacity-50 blur-[120px]" />
                        <div className="absolute bottom-[-40%] left-[-10%] h-[70%] w-[35%] rounded-full bg-[#2B4A8C] opacity-40 blur-[120px]" />
                    </div>

                    <div className="container relative z-10">
                        <motion.div
                            className="mx-auto max-w-[760px] text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                            <nav
                                aria-label="Breadcrumb"
                                className="mb-[18px] flex items-center justify-center gap-[6px] text-[13px] text-white/55"
                            >
                                <Link href="/" className="!text-white/55 !no-underline transition-colors hover:!text-[#EECC65]">
                                    Home
                                </Link>
                                <ChevronRight size={13} aria-hidden="true" />
                                <span aria-current="page" className="font-medium text-[#EECC65]">Pricing</span>
                            </nav>

                            <PageTitle tone="dark">
                                <Words text="Our Courses &" />
                                <Accent text="Plans" tone="dark" delay={0.15} />
                            </PageTitle>
                            <p className={`mx-auto mt-[14px] max-w-[600px] ${leadClass('dark')} !mb-[24px]`}>
                                Choose a course, pick how many days a week you&apos;d like to learn,
                                and see the fee in your currency. Every plan starts with a free
                                trial class.
                            </p>

                            <ul className="!m-0 flex list-none flex-wrap items-center justify-center gap-[10px] !p-0">
                                {BANNER_POINTS.map(({ Icon, text }) => (
                                    <li
                                        key={text}
                                        className="flex items-center gap-[8px] rounded-full bg-white/[0.06] px-[14px] py-[7px] text-[13px] font-medium text-white/85 ring-1 ring-white/10"
                                    >
                                        <Icon size={15} aria-hidden="true" className="text-[#EECC65]" />
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="section-area !py-10 bg-light pricing-section">
                    <div className="container">
                        <PricingPlans onChoose={setEnrollCourse} />
                    </div>
                </section>
            </section>
            <Footer />

            <EnrollModal
                open={enrollCourse !== null}
                onClose={() => setEnrollCourse(null)}
                defaultCourse={enrollCourse ?? undefined}
            />
        </section>
    );
};

export default Page;
