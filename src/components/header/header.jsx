"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import EnrollNow from "../footer/enrollNow/enrollNow";

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
            { label: "Testimonials", href: "/testimonials" },
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

export default function Header() {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState(null);
    const [open, setOpen] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    return (
        <header className="header">
            <motion.div
                initial={{ y: -18, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.3 }}
                className="main-navbar sticky-header">
                <div className="navbar navbar-expand-lg no-shadow">
                    <div className="container-fluid" style={{ position: "relative" }}>

                        {/* Logo */}
                        <Link href="/" className="navbar-brand" aria-label="EduThink logo">
                            <img
                                className="brand-logo"
                                src="/quran-academy-logo.png"
                                alt="EduThink logo"
                            />
                        </Link>

                        {/* Desktop Nav */}
                        <nav
                            ref={navRef}
                            className="navigation-list justify-content-end"
                            aria-label="Main"
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <ul
                                className="nav navbar-nav"
                                style={{
                                    display: "flex",
                                    listStyle: "none",
                                    margin: 0,
                                    padding: 0,
                                    gap: "4px",
                                }}
                            >
                                {navLinks.map((item, i) => (
                                    <li
                                        key={i}
                                        className="dropdown-nav"
                                        style={{ position: "relative" }}
                                        onMouseEnter={() => setOpenDropdown(i)}
                                        onMouseLeave={() => setOpenDropdown(null)}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={(e) => {
                                                if (item.children && item.children.length > 0) {
                                                    e.preventDefault();
                                                    setOpenDropdown(openDropdown === i ? null : i);
                                                }
                                            }}
                                            aria-expanded={openDropdown === i}
                                            aria-haspopup="true"
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "4px",
                                            }}
                                        >
                                            {item.label}
                                            {item.noChild !== true ? (
                                                <motion.span
                                                    animate={{ rotate: openDropdown === i ? 180 : 0 }}
                                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                                    style={{ display: "inline-flex" }}
                                                >
                                                    <FiChevronDown size={15} />
                                                </motion.span>
                                            ) : (
                                                <div />
                                            )}
                                        </Link>

                                        <AnimatePresence>
                                            {openDropdown === i &&
                                                item.children &&
                                                item.children.length > 0 && (
                                                    <motion.ul
                                                        className="submenu-nav"
                                                        variants={dropdownVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        style={{
                                                            display: "block",
                                                            position: "absolute",
                                                            top: "100%",
                                                            left: 0,
                                                            zIndex: 9999,
                                                            listStyle: "none",
                                                            margin: 0,
                                                            padding: 0,
                                                            minWidth: "200px",
                                                        }}
                                                    >
                                                        {item.children.map((child, j) => (
                                                            <motion.li
                                                                key={j}
                                                                initial={{ opacity: 0, x: -6 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{
                                                                    delay: j * 0.05,
                                                                    duration: 0.15,
                                                                }}
                                                            >
                                                                <Link href={child.href}>
                                                                    <span>{child.label}</span>
                                                                </Link>
                                                            </motion.li>
                                                        ))}
                                                    </motion.ul>
                                                )}
                                        </AnimatePresence>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Desktop Action Buttons */}
                        <div className="action-nav d-none d-sm-flex">
                            <ul>
                                <li className="flex items-center gap-3">
                                    <a
                                        href="/login"
                                        className="btn btn-secondary btn-standard"
                                    >
                                        Login
                                        <span className="btn-icon">
                                            <img
                                                src="/assets/images/icon/arrow.svg"
                                                alt=""
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </a>
                                    <button
                                        onClick={() => setOpen(!open)}
                                        className="btn btn-primary btn-standard btn-lg submit-btn"
                                    >
                                        Enroll Now
                                        <span className="btn-icon bg-[#EECC65]">
                                            <img src="/assets/images/icon/arrow.svg" alt="" />
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Mobile Hamburger */}
                        <div className="mobile-toggler">
                            <button
                                className={`navbar-toggler ${mobileOpen ? "" : "collapsed"}`}
                                type="button"
                                aria-expanded={mobileOpen}
                                aria-label="Toggle navigation"
                                onClick={() => setMobileOpen(!mobileOpen)}
                            >
                                <span className="toggler-line" />
                                <span className="toggler-line" />
                                <span className="toggler-line" />
                            </button>
                        </div>
                    </div>

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
                                    style={{
                                        position: "fixed",
                                        inset: 0,
                                        background: "rgba(0,0,0,0.35)",
                                        zIndex: 9998,
                                    }}
                                />

                                {/* Slide-in Panel */}
                                <motion.div
                                    variants={mobileMenuVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    style={{
                                        position: "fixed",
                                        top: 0,
                                        right: 0,
                                        bottom: 0,
                                        width: "min(340px, 90vw)",
                                        background: "#fff",
                                        zIndex: 9999,
                                        overflowY: "auto",
                                        padding: "18px",
                                        boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
                                    }}
                                >
                                    {/* Header row */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "24px",
                                        }}
                                    >
                                        <Link href="/" onClick={() => setMobileOpen(false)}>
                                            <img
                                                src="/quran-academy-logo.png"
                                                alt="EduThink logo"
                                                style={{ height: "53px" }}
                                            />
                                        </Link>
                                        <button
                                            onClick={() => setMobileOpen(false)}
                                            aria-label="Close menu"
                                            style={{
                                                background: "none",
                                                border: "none",
                                                fontSize: "28px",
                                                cursor: "pointer",
                                                lineHeight: 1,
                                                color: "#111",
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Nav Links */}
                                    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                                        {navLinks.map((item, i) => (
                                            <motion.li
                                                key={i}
                                                custom={i}
                                                variants={mobileNavItemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                style={{ borderBottom: "1px solid #f0f0f0" }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        setMobileExpanded(mobileExpanded === i ? null : i)
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        background: "none",
                                                        border: "none",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        padding: "14px 0",
                                                        fontSize: "16px",
                                                        fontWeight: "600",
                                                        cursor: "pointer",
                                                        color: "#111",
                                                    }}
                                                >
                                                    <Link
                                                        href={item.href}
                                                        onClick={() => setMobileOpen(false)}
                                                        style={{ color: "#111", textDecoration: "none" }}
                                                    >
                                                        {item.label}
                                                    </Link>

                                                    {item.noChild !== true ? (
                                                        <motion.span
                                                            animate={{
                                                                rotate: mobileExpanded === i ? 180 : 0,
                                                            }}
                                                            transition={{ duration: 0.2 }}
                                                            style={{ display: "inline-flex" }}
                                                        >
                                                            <FiChevronDown size={15} color="#555" />
                                                        </motion.span>
                                                    ) : (
                                                        <div />
                                                    )}
                                                </button>

                                                {/* Mobile sub-menu */}
                                                <AnimatePresence initial={false}>
                                                    {mobileExpanded === i && item.noChild !== true && (
                                                        <motion.ul
                                                            variants={mobileChildVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            exit="exit"
                                                            style={{
                                                                listStyle: "none",
                                                                margin: 0,
                                                                padding: "0 0 12px 16px",
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            {item.children.map((child, j) => (
                                                                <motion.li
                                                                    key={j}
                                                                    initial={{ opacity: 0, x: 10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: j * 0.06 }}
                                                                    style={{ borderBottom: "1px solid #f5f5f5" }}
                                                                >
                                                                    <Link
                                                                        href={child.href}
                                                                        onClick={() => setMobileOpen(false)}
                                                                        style={{
                                                                            display: "block",
                                                                            padding: "10px 0",
                                                                            fontSize: "15px",
                                                                            color: "#444",
                                                                            textDecoration: "none",
                                                                        }}
                                                                    >
                                                                        {child.label}
                                                                    </Link>
                                                                </motion.li>
                                                            ))}
                                                        </motion.ul>
                                                    )}
                                                </AnimatePresence>
                                            </motion.li>
                                        ))}
                                    </ul>

                                    {/* Mobile CTA Buttons — neutral colors, no green */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: navLinks.length * 0.07 + 0.1 }}
                                        style={{
                                            marginTop: "28px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "12px",
                                        }}
                                    >
                                        {/* Enroll Now — primary style, no green override */}
                                        {/* <button
                                            name="submit"
                                            type="button"
                                            onClick={() => setOpen(!open)}
                                            className="btn btn-primary btn-standard btn-lg submit-btn"
                                            style={{ width: "100%" }}
                                        >
                                            Enroll Now
                                            <span className="btn-icon" style={{ background: "#EECC65" }}>
                                                <img src="/assets/images/icon/arrow.svg" alt="" />
                                            </span>
                                        </button> */}

                                        {/* Contact Us — secondary/outline style */}
                                        <Link
                                            href="/contact"
                                            className="btn btn-secondary btn-standard"
                                            onClick={() => setMobileOpen(false)}
                                            style={{
                                                display: "block",
                                                textAlign: "center",
                                                padding: "14px",
                                                textDecoration: "none",
                                            }}
                                        >
                                            Contact Us
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Enroll Now Modal */}
            <AnimatePresence>
                {open && (
                    <motion.section
                        className="fixed inset-0 bg-black/50 !z-[1000] flex justify-center items-center p-5 w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div
                            className="absolute inset-0 z-10"
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            className="w-[900px] max-w-[95vw] z-40 max-h-[90vh] rounded-lg overflow-y-auto scroller"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="flex justify-end">
                                {/* <motion.button
                                    onClick={() => setOpen(false)}
                                    className="text-xl text-white border-2 cursor-pointer hover:bg-gray-200 rounded-full mb-2 bg-white p-1 transition-colors"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <IoClose color="gray" />
                                </motion.button> */}
                            </div>
                            <EnrollNow />
                        </motion.div>
                    </motion.section>
                )}
            </AnimatePresence>
        </header>
    );
}
