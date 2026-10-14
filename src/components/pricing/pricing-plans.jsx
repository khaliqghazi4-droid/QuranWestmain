"use client";

import { useState, useRef, useEffect } from 'react';
import {
    BookOpen,
    CalendarCheck,
    ChevronDown,
    Check,
    ChevronsRight,
    Film,
    StickyNote,
    Video,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COURSES = [
    "Quran Reading",
    "Tajweed Course",
    "Quran Memorization",
    "Islamic Studies",
    "Arabic Language",
    "Quran Tafseer (Interpretation)",
];

// The course name the enrolment form uses, where it differs from the tab
const ENROLL_COURSE = {
    "Tajweed Course": "Tajweed Rules",
    "Quran Tafseer (Interpretation)": "Quran Tafseer",
};

const CURRENCY_META = {
    USD: { name: "US Dollar", symbol: "$" },
    CAD: { name: "Canadian Dollar", symbol: "C$" },
    GBP: { name: "British Pound", symbol: "£" },
    EUR: { name: "Euro", symbol: "€" },
};

const CURRENCIES = Object.keys(CURRENCY_META);

// "CAD" is written out so the fee isn't mistaken for US dollars
const currencyPrefix = (currency) => (currency === "CAD" ? "CAD " : CURRENCY_META[currency].symbol);

// What every student gets in their dashboard, shown beside the course name.
// Each is a real dashboard feature: lessons run in the in-app class room,
// recordings appear under My Schedule once the admin shares them, notes are
// the ones teachers share, schedule and attendance come from the bookings,
// and the Quran reader is in the student menu. (Progress isn't listed: that
// page still shows sample figures.)
const STUDENT_BENEFITS = [
    { Icon: Video, text: "Live in-app classes" },
    { Icon: Film, text: "Class recordings" },
    { Icon: StickyNote, text: "Teacher's notes" },
    { Icon: CalendarCheck, text: "Schedule & attendance" },
    { Icon: BookOpen, text: "Quran reader" },
];

const courseSlug = (course) => course.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Every course has the same plans and fees. `head` is the plan's column
// colour in the pricing table: navy, a shade deeper for each extra day a
// week, and dark gold for the weekend plan, which is a different kind.
// `popular` plans get a "Popular" badge and an outlined, tinted column.
const PLANS = [
    { id: "A", name: "Plan A", schedule: "2 Days / Week", days: "2 days", sessionsPerMonth: 8, fees: { USD: 37, CAD: 52, GBP: 29, EUR: 34 }, head: "#2B4A8C" },
    { id: "B", name: "Plan B", schedule: "3 Days / Week", days: "3 days", sessionsPerMonth: 12, fees: { USD: 53, CAD: 74, GBP: 40, EUR: 49 }, head: "#23407C", popular: true },
    { id: "C", name: "Plan C", schedule: "4 Days / Week", days: "4 days", sessionsPerMonth: 16, fees: { USD: 66, CAD: 93, GBP: 51, EUR: 60 }, head: "#1B356A" },
    { id: "D", name: "Plan D", schedule: "5 Days / Week", days: "5 days", sessionsPerMonth: 20, fees: { USD: 84, CAD: 118, GBP: 64, EUR: 76 }, head: "#142A57" },
    { id: "E", name: "Plan E", schedule: "6 Days / Week", days: "6 days", sessionsPerMonth: 24, fees: { USD: 101, CAD: 142, GBP: 77, EUR: 92 }, head: "#0E1F44" },
    { id: "F", name: "Plan F", schedule: "Weekend", days: "Weekends", sessionsPerMonth: 8, fees: { USD: 48, CAD: 68, GBP: 37, EUR: 44 }, head: "#9B7930", popular: true },
];

// Table rows. `value` gives a plan's cell; `true` shows a tick.
const ROWS = [
    { label: "Days per week", value: (plan) => plan.days },
    { label: "Classes per month", value: (plan) => plan.sessionsPerMonth },
    { label: "Class length", value: () => "30 min" },
    { label: "One-to-one with a teacher", value: () => true },
    {
        label: "Cost per class",
        hint: "Monthly fee ÷ classes",
        value: (plan, currency) => `${currencyPrefix(currency)}${(plan.fees[currency] / plan.sessionsPerMonth).toFixed(2)}`,
    },
];

const Tick = () => (
    <span className="mx-auto flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#EECC65] text-[#0B1A37] shadow-[0_3px_8px_-3px_rgba(155,121,48,0.8)]">
        <Check size={13} strokeWidth={3} aria-hidden="true" />
        <span className="sr-only">Included</span>
    </span>
);

// "Popular" tab on top of the card, over a popular plan's column; -2px each
// side so it lines up with the column's purple outline
const PopularTab = () => (
    <span className="absolute -inset-x-[2px] bottom-full z-20 flex h-[26px] items-center justify-center rounded-t-[10px] bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#C026D3] text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_-8px_18px_-10px_rgba(168,85,247,0.95)]">
        Popular
    </span>
);

// One course's plans side by side, laid out like a comparison table: plan
// headers along the top, a row per detail, then each plan's fee and button.
// Hovering a plan tints its whole column. Below lg it scrolls sideways, with
// the row labels pinned on the left.
const PricingTable = ({ course, currency, onChoose }) => {
    const [hovered, setHovered] = useState(null);
    const colProps = (i) => ({ onMouseEnter: () => setHovered(i), onMouseLeave: () => setHovered(null) });
    // Hovered column: gold tint. Popular column: lavender tint, outlined in
    // purple from its header down to the button.
    const tint = (i) =>
        hovered === i ? "bg-[#EECC65]/[0.12]" : PLANS[i].popular ? "bg-[#A855F7]/[0.06]" : "";
    const outline = (plan, edge = "") =>
        plan.popular ? `border-x-[2px] border-x-[#A855F7]/70 ${edge}` : "";

    // Narrower on phones, so about two plans show beside the labels. -left-px:
    // pins it flush with the scroll box edge (the box has 1px side padding)
    const labelCell = "sticky -left-px z-10 w-[132px] border-r-[1px] border-solid border-[#0B1A37]/10 px-[14px] text-left sm:w-[24%] sm:min-w-[180px] sm:px-[20px]";
    // The pinned column's two rounded corner cells are square, in the page
    // colour, with the cell colour on a rounded layer inside: so plans
    // scrolling under the column on phones don't show through the corner

    return (
        <div>
            {/* relative: keeps the ticks' hidden "Included" labels (absolute)
                inside this scroll box, or they'd widen the page on phones.
                The padding is room for the "Popular" tabs above the table and
                its shadow below (the negative margin takes the bottom back).
                The card look (white, rounded, ring, shadow) is on the table
                itself, so nothing clips the tabs; its corners are rounded per
                cell, as rounded tables need separate borders. */}
            <div className="relative -mb-[32px] overflow-x-auto px-[1px] pb-[32px] pt-[26px]">
                <table className="w-full min-w-[840px] table-fixed border-separate border-spacing-0 rounded-[18px] bg-white shadow-[0_18px_44px_-30px_rgba(11,26,55,0.35)] ring-1 ring-[#0B1A37]/10">
                    <caption className="sr-only">{course}: plans and monthly fees</caption>
                    <thead>
                        <tr>
                            <th scope="col" className={`${labelCell} bg-[#FFF6F0] py-[12px] align-middle`}>
                                <span aria-hidden="true" className="absolute inset-0 rounded-tl-[18px] bg-[#F4EEE3]" />
                                <span className="relative block text-[10px] font-bold uppercase tracking-[0.16em] text-[#9B7930]">
                                    Compare plans
                                </span>
                                <span className="relative mt-[2px] block text-[14px] font-extrabold leading-snug text-[#0B1A37] sm:text-[15px]">
                                    {course}
                                </span>
                            </th>
                            {PLANS.map((plan, i) => (
                                <th
                                    key={plan.id}
                                    scope="col"
                                    {...colProps(i)}
                                    style={{ backgroundColor: plan.head }}
                                    className={`relative border-solid px-[8px] py-[12px] text-center align-middle ${i === PLANS.length - 1 && !plan.popular ? "rounded-tr-[18px]" : ""} ${outline(plan, "border-t-[2px] border-t-[#A855F7]/70")}`}
                                >
                                    {plan.popular && <PopularTab />}
                                    <span className={`block text-[10px] font-bold uppercase tracking-[0.18em] ${plan.id === "F" ? "text-[#FFF1C9]" : "text-[#EECC65]"}`}>
                                        {plan.name}
                                    </span>
                                    <span className="mt-[2px] block whitespace-nowrap text-[13px] font-bold text-white sm:text-[14px]">
                                        {plan.schedule}
                                    </span>
                                    {/* gold edge under the hovered plan's header */}
                                    <span
                                        aria-hidden="true"
                                        className={`absolute inset-x-0 bottom-0 h-[3px] origin-center bg-[#EECC65] transition-transform duration-300 ${hovered === i ? "scale-x-100" : "scale-x-0"}`}
                                    />
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {ROWS.map((row, r) => (
                            <tr key={row.label} className={r % 2 ? "bg-[#FFFBF6]" : "bg-white"}>
                                <th
                                    scope="row"
                                    className={`${labelCell} py-[8px] align-middle text-[13px] font-medium text-[#0B1A37]/75 ${r % 2 ? "bg-[#FFFBF6]" : "bg-white"}`}
                                >
                                    {row.label}
                                    {row.hint && (
                                        <span className="block text-[10px] font-normal leading-tight text-[#0B1A37]/45">{row.hint}</span>
                                    )}
                                </th>
                                {PLANS.map((plan, i) => {
                                    const value = row.value(plan, currency);
                                    return (
                                        <td
                                            key={plan.id}
                                            {...colProps(i)}
                                            className={`border-t-[1px] border-solid border-[#0B1A37]/[0.06] px-[8px] py-[8px] text-center align-middle text-[14px] font-semibold text-[#0B1A37] transition-colors duration-200 ${tint(i)} ${outline(plan)}`}
                                        >
                                            {value === true ? <Tick /> : value}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}

                        {/* Fee and button */}
                        <tr>
                            <th scope="row" className={`${labelCell} bg-[#FFF6F0] py-[12px] align-middle`}>
                                <span aria-hidden="true" className="absolute inset-0 rounded-bl-[18px] bg-white" />
                                <span className="relative block text-[13px] font-bold text-[#0B1A37]">Monthly fee</span>
                                <span className="relative block text-[11px] text-[#0B1A37]/50">Billed each month</span>
                            </th>
                            {PLANS.map((plan, i) => (
                                <td
                                    key={plan.id}
                                    {...colProps(i)}
                                    className={`border-t-[1px] border-solid border-[#0B1A37]/10 px-[8px] pb-[14px] pt-[12px] text-center align-top transition-colors duration-200 ${i === PLANS.length - 1 ? "rounded-br-[18px]" : ""} ${tint(i)} ${outline(plan, "border-b-[2px] border-b-[#A855F7]/70")}`}
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currency}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-start justify-center gap-[2px] text-[#0B1A37]"
                                        >
                                            <span className="mt-[3px] text-[12px] font-bold">{currencyPrefix(currency)}</span>
                                            <span className="text-[26px] font-extrabold leading-none tracking-tight">{plan.fees[currency]}</span>
                                        </motion.div>
                                    </AnimatePresence>
                                    <span className="mt-[2px] block text-[11px] font-medium text-[#0B1A37]/50">per month</span>
                                    <button
                                        type="button"
                                        onClick={() => onChoose(course, plan)}
                                        className={`mt-[10px] inline-flex w-full max-w-[132px] items-center justify-center whitespace-nowrap rounded-[8px] px-[6px] py-[7px] text-[11px] font-bold transition-all duration-200 hover:-translate-y-0.5 sm:px-[10px] sm:text-[12px] ${
                                            plan.popular
                                                ? "bg-gradient-to-r from-[#7C3AED] to-[#C026D3] text-white shadow-[0_8px_18px_-8px_rgba(147,51,234,0.9)] hover:from-[#6D28D9] hover:to-[#A21CAF]"
                                                : "bg-[#0B1A37] text-white hover:bg-[#EECC65] hover:text-[#0B1A37]"
                                        }`}
                                    >
                                        Start Free Trial
                                    </button>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// The currency button and its list. Each copy keeps its own open state and
// closes on a click outside it (there are two: one beside the course tabs on
// laptops, one next to the "Swipe" pill below lg).
function CurrencyPicker({ currency, onChange, className = "" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative shrink-0 ${className}`} ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-[8px] rounded-[12px] bg-white py-[6px] pl-[6px] pr-[12px] text-[13px] font-semibold text-[#0C1A37] ring-1 ring-[#0B1A37]/10 transition-shadow hover:ring-[#997C36]"
            >
                <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#0C1A37]/[0.08] text-[12px] font-bold text-[#0C1A37]">
                    {CURRENCY_META[currency].symbol}
                </span>
                {currency}
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 z-20 mt-2 divide-y !divide-slate-100 overflow-hidden rounded-xl border !border-slate-200 bg-white !shadow-lg !pl-0 lg:left-auto lg:right-0"
                    >
                        {CURRENCIES.map((code) => (
                            <li key={code}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(code);
                                        setOpen(false);
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
    );
}

// The plans of every course, as on the Pricing page (and on the home page):
// course tabs and a currency picker, then the chosen course's comparison
// table. A plan's "Start Free Trial" calls `onChoose` with the course name
// the enrolment form uses.
export default function PricingPlans({ onChoose }) {
    const [currency, setCurrency] = useState("GBP");
    const [activeCourse, setActiveCourse] = useState(COURSES[0]);

    // "Start Free Trial" opens the enrolment form (it books the trial class) with that course picked
    const handleChoose = (course) => onChoose(ENROLL_COURSE[course] ?? course);

    return (
        <>
            <motion.div
                // relative z-30: the currency list opens over the table below
                // (this row's animation makes its own layer, so the list's
                // z-index alone can't lift it above the "Popular" tabs)
                className="relative z-30 mb-[28px] flex flex-col gap-[12px] lg:flex-row lg:items-center lg:justify-between"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5 }}
            >
                {/* Course tabs. On phones and tablets, separate tags that wrap
                    onto as many lines as they need, so every course shows at
                    once. On laptops, one row in a single bar that scrolls
                    sideways (without a scrollbar) if it runs out of room.
                    Only the chosen course's table is shown. Sizes are in px
                    because the theme's px-4 / text-sm classes override
                    Tailwind's and make the tabs much bigger. */}
                <div
                    role="tablist"
                    aria-label="Courses"
                    className="flex min-w-0 flex-wrap gap-[8px] lg:flex-nowrap lg:gap-[4px] lg:overflow-x-auto lg:rounded-[12px] lg:bg-white lg:p-[4px] lg:ring-1 lg:ring-[#0B1A37]/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {COURSES.map((course) => (
                        <button
                            key={course}
                            type="button"
                            role="tab"
                            id={`tab-${courseSlug(course)}`}
                            aria-selected={activeCourse === course}
                            aria-controls="course-plans"
                            onClick={() => setActiveCourse(course)}
                            className={`shrink-0 whitespace-nowrap rounded-[999px] px-[14px] py-[7px] text-[13px] font-semibold ring-1 transition-colors duration-200 lg:rounded-[9px] lg:ring-0 ${activeCourse === course
                                ? 'bg-[#0B1A37] text-white ring-[#0B1A37] shadow-[0_4px_12px_-6px_rgba(11,26,55,0.6)]'
                                : 'bg-white text-[#0B1A37]/65 ring-[#0B1A37]/10 hover:bg-[#F4EEE3] hover:text-[#0B1A37] lg:bg-transparent lg:hover:bg-[#F4EEE3]'
                                }`}
                        >
                            {course}
                        </button>
                    ))}
                </div>

                {/* Laptops: beside the tabs. Below lg it sits by the
                    table instead, next to the "Swipe" pill. */}
                <CurrencyPicker currency={currency} onChange={setCurrency} className="max-lg:hidden" />
            </motion.div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCourse}
                    id="course-plans"
                    role="tabpanel"
                    aria-labelledby={`tab-${courseSlug(activeCourse)}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                    {/* Course name, with what every plan includes beside it
                        (under it below lg): one line of text, not cards */}
                    <div className="mb-[14px] flex flex-col gap-[10px] lg:flex-row lg:items-center lg:justify-between lg:gap-[24px]">
                        <div className="flex shrink-0 items-center gap-3">
                            <span className="h-[26px] w-1.5 rounded-full bg-gradient-to-b from-[#0C1A37] to-[#997C36]" />
                            <h3 className="!text-[#0C1A37] !text-[22px] !font-extrabold !tracking-[-0.02em] md:!text-[28px] !m-0">{activeCourse}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[6px] lg:justify-end">
                            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9B7930]">
                                Every plan includes:
                            </span>
                            <ul className="!m-0 flex list-none flex-wrap items-center gap-x-[14px] gap-y-[6px] !p-0">
                                {STUDENT_BENEFITS.map(({ Icon, text }) => (
                                    <li key={text} className="flex items-center gap-[6px] whitespace-nowrap text-[13px] font-medium text-[#0B1A37]/75">
                                        <Icon size={15} aria-hidden="true" className="shrink-0 text-[#9B7930]" />
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Below lg: the currency picker on the left and, as the
                        table is wider than the screen, a gold pill with moving
                        arrows on the right, so the swipe isn't missed.
                        relative z-30: the currency list opens over the table. */}
                    <div className="relative z-30 mb-[10px] flex items-center justify-between gap-[8px] lg:hidden">
                        <CurrencyPicker currency={currency} onChange={setCurrency} />
                        <span className="flex shrink-0 items-center gap-[5px] whitespace-nowrap rounded-[999px] bg-[#EECC65] py-[6px] pl-[12px] pr-[9px] text-[12.5px] font-bold max-[359px]:pl-[10px] max-[359px]:text-[11.5px] text-[#0B1A37] shadow-[0_8px_18px_-8px_rgba(155,121,48,0.8)]">
                            Swipe to see all {PLANS.length} plans
                            <ChevronsRight
                                size={16}
                                strokeWidth={2.5}
                                aria-hidden="true"
                                className="animate-[swipe-nudge_1.1s_ease-in-out_infinite] motion-reduce:animate-none"
                            />
                        </span>
                    </div>

                    <PricingTable course={activeCourse} currency={currency} onChoose={handleChoose} />
                </motion.div>
            </AnimatePresence>
        </>
    );
}
