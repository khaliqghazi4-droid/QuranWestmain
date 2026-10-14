"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import {
    motion,
    AnimatePresence,
    MotionConfig,
    useMotionValueEvent,
    useScroll,
} from "framer-motion";
import EnrollModal from "@/components/enroll-modal";
import { IslamicPattern } from "@/components/islamic-pattern";

const navLinks = [
    { label: "Home", href: "/", children: [], noChild: true },
    { label: "Instructors", href: "/instructors", children: [], noChild: true },
    { label: "Courses", href: "/coursesGrid", children: [], noChild: true },
    { label: "Pricing", href: "/pricing", children: [], noChild: true },
    { label: "Blog", href: "/blogs", children: [], noChild: true },
    {
        label: "More",
        href: "/",
        children: [
            { label: "About Us", href: "/about" },
            { label: "FAQs", href: "/faqs" },
            // Hidden from the menu for now; the page still works at /reviews
            // { label: "Reviews", href: "/reviews" },
            { label: "Contact Us", href: "/contact" },
        ],
        noChild: false,
    },
];

// Animation variants
const mobileMenuVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 280, damping: 28 },
    },
    exit: {
        x: "100%",
        opacity: 0,
        transition: { duration: 0.25, ease: "easeInOut" },
    },
};

const mobileNavItemVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" },
    }),
};

const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.18, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        y: -8,
        scale: 0.97,
        transition: { duration: 0.14, ease: "easeIn" },
    },
};

const mobileChildVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
        opacity: 1,
        height: "auto",
        transition: { duration: 0.25, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        height: 0,
        transition: { duration: 0.2, ease: "easeIn" },
    },
};

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.25 } },
};

// A menu item is current when its page (or, for "More", one of its pages) is open
function isActive(pathname, item) {
    if (item.children.length > 0) {
        return item.children.some((child) => pathname.startsWith(child.href));
    }
    return item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
}

export default function Header() {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState(null);
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navRef = useRef(null);
    const pathname = usePathname() ?? "/";

    // The bar gets slimmer, with a soft shadow, once the page is scrolled
    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
    useEffect(() => {
        setScrolled(window.scrollY > 24);
    }, []);

    const closeModal = useCallback(() => setOpen(false), []);

    useEffect(() => {
        function handleClickOutside(e) {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        }
        function handleKey(e) {
            if (e.key === "Escape") {
                setOpenDropdown(null);
                setMobileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKey);
        };
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    return (
        // Movement is turned off for visitors who ask their device for reduced motion
        <MotionConfig reducedMotion="user">
            <header className="sticky top-0 z-[999] w-full">
                {/* The blur sits on a layer of its own: on an ancestor of the
                    menu panel or the pop-up it would trap them inside the bar */}
                <div
                    aria-hidden="true"
                    className={`absolute inset-0 border-b backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-500 ${
                        scrolled
                            ? "border-[#0B1A37]/[0.08] bg-white/60 shadow-[0_12px_30px_-20px_rgba(11,26,55,0.45)]"
                            : "border-[#0B1A37]/[0.06] bg-white"
                    }`}
                />

                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    className={`relative mx-auto flex max-w-[1400px] items-center justify-between gap-[1rem] px-[1rem] transition-[height] duration-500 sm:px-6 lg:px-8 ${
                        scrolled ? "h-[68px]" : "h-[84px]"
                    }`}
                >
                    {/* Logo */}
                    <Link href="/" className="shrink-0" aria-label="EduThink logo">
                        <img
                            src="/quran-academy-logo.png"
                            alt="EduThink logo"
                            className={`w-auto transition-[height] duration-500 ${scrolled ? "h-10" : "h-11 lg:h-[52px]"}`}
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav ref={navRef} aria-label="Main" className="hidden lg:block">
                        <ul className="!mb-0 flex list-none items-center gap-[0.25rem] p-0">
                            {navLinks.map((item, i) => {
                                const hasChildren = item.children.length > 0;
                                const active = isActive(pathname, item);
                                return (
                                    <li
                                        key={item.label}
                                        className="relative"
                                        onMouseEnter={() => setOpenDropdown(i)}
                                        onMouseLeave={() => setOpenDropdown(null)}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={(e) => {
                                                if (hasChildren) {
                                                    e.preventDefault();
                                                    setOpenDropdown(openDropdown === i ? null : i);
                                                }
                                            }}
                                            aria-expanded={hasChildren ? openDropdown === i : undefined}
                                            aria-haspopup={hasChildren ? "true" : undefined}
                                            aria-current={active && !hasChildren ? "page" : undefined}
                                            className={`group relative inline-flex items-center gap-[0.25rem] px-3.5 py-[0.5rem] text-[0.95rem] font-medium transition-colors duration-300 ${
                                                active ? "text-[#0B1A37]" : "text-[#0B1A37]/75 hover:text-[#0B1A37]"
                                            }`}
                                        >
                                            {item.label}
                                            {hasChildren && (
                                                <motion.span
                                                    animate={{ rotate: openDropdown === i ? 180 : 0 }}
                                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                                    className="inline-flex"
                                                >
                                                    <FiChevronDown size={15} />
                                                </motion.span>
                                            )}
                                            {/* Gold underline: grows from the middle on hover, stays on the current page */}
                                            <span
                                                className={`absolute inset-x-3.5 bottom-0.5 h-[1.5px] origin-center rounded-full bg-[#C59E5B] transition-transform duration-300 ${
                                                    active || openDropdown === i ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                                }`}
                                            />
                                        </Link>

                                        <AnimatePresence>
                                            {openDropdown === i && hasChildren && (
                                                // Padding, not margin, keeps the pointer inside the item on its way down
                                                <motion.div
                                                    variants={dropdownVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    className="absolute left-0 top-full z-10 pt-[0.5rem]"
                                                >
                                                    <ul className="!mb-0 min-w-[210px] list-none overflow-hidden rounded-xl border-[1px] border-t-2 border-[#0B1A37]/10 border-t-[#EECC65] bg-white p-[0.5rem] shadow-[0_24px_48px_-24px_rgba(11,26,55,0.45)]">
                                                        {item.children.map((child, j) => (
                                                            <motion.li
                                                                key={child.href}
                                                                initial={{ opacity: 0, x: -6 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: j * 0.05, duration: 0.15 }}
                                                            >
                                                                <Link
                                                                    href={child.href}
                                                                    aria-current={pathname.startsWith(child.href) ? "page" : undefined}
                                                                    className={`block rounded-lg px-[1rem] py-2.5 text-[0.875rem] font-medium transition-colors duration-200 ${
                                                                        pathname.startsWith(child.href)
                                                                            ? "bg-[#EECC65]/20 text-[#0B1A37]"
                                                                            : "text-[#0B1A37]/80 hover:bg-[#EECC65]/15 hover:text-[#0B1A37]"
                                                                    }`}
                                                                >
                                                                    {child.label}
                                                                </Link>
                                                            </motion.li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="flex items-center gap-[0.75rem]">
                        {/* Desktop Action Buttons */}
                        <div className="hidden items-center gap-[0.75rem] sm:flex">
                            <a
                                href="/login"
                                className="inline-flex items-center gap-1.5 rounded-full border-[1px] border-[#0B1A37]/20 px-[1.25rem] py-2.5 text-[0.875rem] font-semibold text-[#0B1A37] transition-colors duration-300 hover:border-[#0B1A37] hover:bg-[#0B1A37] hover:text-white"
                            >
                                Login
                                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                            </a>
                            <button
                                type="button"
                                onClick={() => setOpen(!open)}
                                className="group inline-flex items-center gap-[0.75rem] !rounded-full bg-[#0B1A37] py-1.5 pl-5 pr-1.5 text-[0.875rem] font-semibold text-white transition-shadow duration-300 hover:shadow-[0_10px_24px_-10px_rgba(11,26,55,0.7)]"
                            >
                                Enroll Now
                                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EECC65] text-[#0B1A37] transition-transform duration-300 group-hover:-rotate-45">
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </span>
                            </button>
                        </div>

                        {/* Mobile Hamburger */}
                        <button
                            type="button"
                            aria-expanded={mobileOpen}
                            aria-label="Toggle navigation"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="grid h-11 w-11 place-items-center !rounded-full border-[1px] border-[#0B1A37]/15 text-[#0B1A37] transition-colors duration-300 hover:border-[#EECC65] lg:hidden"
                        >
                            <span className="flex w-5 flex-col gap-[5px]" aria-hidden="true">
                                <span className="h-[1.5px] w-full rounded-full bg-current" />
                                <span className="h-[1.5px] w-3/4 self-end rounded-full bg-current" />
                                <span className="h-[1.5px] w-full rounded-full bg-current" />
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* Mobile Menu — Animated slide-in from right */}
                <AnimatePresence>
                    {mobileOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                variants={overlayVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                onClick={() => setMobileOpen(false)}
                                className="fixed inset-0 z-[9998] bg-[#0B1A37]/40 backdrop-blur-[2px]"
                            />

                            {/* Slide-in Panel */}
                            <motion.div
                                variants={mobileMenuVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Menu"
                                className="fixed inset-y-0 right-0 z-[9999] isolate flex w-[min(340px,90vw)] flex-col overflow-y-auto bg-white p-[1.25rem] shadow-[-12px_0_40px_rgba(11,26,55,0.25)]"
                            >
                                <IslamicPattern className="text-[#EECC65] opacity-[0.08]" />

                                {/* Header row */}
                                <div className="mb-6 flex items-center justify-between">
                                    <Link href="/" onClick={() => setMobileOpen(false)}>
                                        <img src="/quran-academy-logo.png" alt="EduThink logo" className="h-12 w-auto" />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setMobileOpen(false)}
                                        aria-label="Close menu"
                                        className="grid h-10 w-10 place-items-center !rounded-full border-[1px] border-[#0B1A37]/15 text-[#0B1A37] transition-colors duration-300 hover:border-[#EECC65]"
                                    >
                                        <X className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Nav Links */}
                                <ul className="!mb-0 list-none p-0">
                                    {navLinks.map((item, i) => {
                                        const hasChildren = item.children.length > 0;
                                        const active = isActive(pathname, item);
                                        const rowClass = `flex w-full items-center justify-between py-3.5 text-left text-base font-semibold ${
                                            active ? "text-[#C59E5B]" : "text-[#0B1A37]"
                                        }`;
                                        return (
                                            <motion.li
                                                key={item.label}
                                                custom={i}
                                                variants={mobileNavItemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className="border-b border-[#0B1A37]/10"
                                            >
                                                {hasChildren ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setMobileExpanded(mobileExpanded === i ? null : i)}
                                                        aria-expanded={mobileExpanded === i}
                                                        className={rowClass}
                                                    >
                                                        {item.label}
                                                        <motion.span
                                                            animate={{ rotate: mobileExpanded === i ? 180 : 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="inline-flex text-[#C59E5B]"
                                                        >
                                                            <FiChevronDown size={16} />
                                                        </motion.span>
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href={item.href}
                                                        onClick={() => setMobileOpen(false)}
                                                        aria-current={active ? "page" : undefined}
                                                        className={rowClass}
                                                    >
                                                        {item.label}
                                                        {active && <span className="h-1.5 w-1.5 rounded-full bg-[#EECC65]" />}
                                                    </Link>
                                                )}

                                                {/* Mobile sub-menu */}
                                                <AnimatePresence initial={false}>
                                                    {mobileExpanded === i && hasChildren && (
                                                        <motion.ul
                                                            variants={mobileChildVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            exit="exit"
                                                            className="!mb-0 list-none overflow-hidden p-0 pb-[0.75rem] pl-4"
                                                        >
                                                            {item.children.map((child, j) => (
                                                                <motion.li
                                                                    key={child.href}
                                                                    initial={{ opacity: 0, x: 10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: j * 0.06 }}
                                                                >
                                                                    <Link
                                                                        href={child.href}
                                                                        onClick={() => setMobileOpen(false)}
                                                                        className="flex items-center gap-[0.75rem] py-2.5 text-[0.95rem] text-[#0B1A37]/75 transition-colors hover:text-[#0B1A37]"
                                                                    >
                                                                        <span className="h-px w-3 bg-[#EECC65]" aria-hidden="true" />
                                                                        {child.label}
                                                                    </Link>
                                                                </motion.li>
                                                            ))}
                                                        </motion.ul>
                                                    )}
                                                </AnimatePresence>
                                            </motion.li>
                                        );
                                    })}
                                </ul>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: navLinks.length * 0.07 + 0.1 }}
                                    className="mt-7 flex gap-[0.6rem]"
                                >
                                    {/* Phones only: the header's Login button is hidden below sm */}
                                    <a
                                        href="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#EECC65] py-3.5 text-[0.95rem] font-semibold text-[#0B1A37] shadow-[0_10px_24px_-12px_rgba(201,161,59,0.8)] transition-colors duration-300 hover:bg-[#F3D98A] sm:hidden"
                                    >
                                        Login
                                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                    </a>
                                    <Link
                                        href="/contact"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex flex-1 items-center justify-center rounded-full bg-[#0B1A37] py-3.5 text-[0.95rem] font-semibold text-white transition-colors duration-300 hover:bg-[#13254A]"
                                    >
                                        Contact Us
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Enroll Now Modal */}
                <EnrollModal open={open} onClose={closeModal} />
            </header>
        </MotionConfig>
    );
}
