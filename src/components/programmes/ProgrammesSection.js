"use client";

import { useState } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"
import EnrollNow from "../footer/enrollNow/enrollNow";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.3 },
  transition: { duration: 0.6, ease: 'easeOut', delay },
})

const filters = [
  { label: "All", value: "" },
  { label: "Quran Reading", value: "filter_programming" },
  { label: "Hifz", value: "filter_graphic_design" },
  { label: "Tajweed", value: "filter_data_science" },
  { label: "Islamic Studies", value: "filter_marketing" },
  { label: "Arabic Language", value: "filter_management" },
];

const courses = [
  {
    id: 1,
    filter: "filter_programming",
    image: "/courses/Quran-Memorization.jpeg",
    imageAlt: "Quran Reading",
    title: "Quran Reading",
    level: "All ages · Beginner",
    priceSummary: "Start from beginning",
    meta: [
      { icon: "icon-user", text: "Learn letters to Surahs" },
      { icon: "icon-file-text", text: "Fluency & confidence" },
    ],
    hoverTitle: "Quran Reading",
    hoverDescription: "Students learn to recognise Arabic letters, form words and read complete Surahs fluently and with confidence.",
    hoverPrice: "Free Trial Available",
    hoverBtn: "Book Free Trial",
  },
  {
    id: 2,
    filter: "filter_graphic_design",
    image: "/courses/Quran-Recitation.jpeg",
    imageAlt: "Quran Memorisation",
    title: "Quran Memorisation",
    level: "Ages 7+ · All levels",
    priceSummary: "Structured memorisation",
    meta: [
      { icon: "icon-user", text: "Total Personal Hifz plan" },
      { icon: "icon-file-text", text: "Regular revision" },
    ],
    hoverTitle: "Quran Memorisation",
    hoverDescription: "A structured programme for children serious about memorising the Quran. Regular revision sessions keep students on track.",
    hoverPrice: "Free Trial Available",
    hoverBtn: "Book Free Trial",
  },
  {
    id: 3,
    filter: "filter_data_science",
    image: "/courses/tajweed.jpg",
    imageAlt: "Tajweed Rules",
    title: "Tajweed Rules",
    level: "Intermediate · Advanced",
    priceSummary: "Science of recitation",
    meta: [
      { icon: "icon-user", text: "Makhaarij & Sifaat" },
      { icon: "icon-file-text", text: "Perfect pronunciation" },
    ],
    hoverTitle: "Tajweed Rules",
    hoverDescription: "Learn the science of recitation — Makhaarij, Sifaat and the rules that make every letter sound exactly as it should.",
    hoverPrice: "Free Trial Available",
    hoverBtn: "Book Free Trial",
  },
  {
    id: 4,
    filter: "filter_programming",
    image: "/courses/islamic-studies.jpeg",
    imageAlt: "Islamic Studies",
    title: "Islamic Studies",
    level: "All ages · All levels",
    priceSummary: "Broad Islamic knowledge",
    meta: [
      { icon: "icon-user", text: "Five pillars & Seerah" },
      { icon: "icon-file-text", text: "Daily duas & halal/haram" },
    ],
    hoverTitle: "Islamic Studies",
    hoverDescription: "A broad grounding in Islamic knowledge: the five pillars, Seerah of the Prophet ﷺ, daily duas, halal and haram, and how to live as a Muslim in the modern world.",
    hoverPrice: "Free Trial Available",
    hoverBtn: "Book Free Trial",
  },
  {
    id: 5,
    filter: "filter_marketing",
    image: "/courses/arabiclanguage.jpg",
    imageAlt: "Arabic Language",
    title: "Arabic Language",
    level: "Ages 10+ · Beginner",
    priceSummary: "Understand Quran directly",
    meta: [
      { icon: "icon-user", text: "Vocabulary & grammar" },
      { icon: "icon-file-text", text: "Conversational Arabic" },
    ],
    hoverTitle: "Arabic Language",
    hoverDescription: "Understand the Quran directly, without translation. Our Arabic programme covers vocabulary, grammar and conversational Arabic at a steady, achievable pace.",
    hoverPrice: "Free Trial Available",
    hoverBtn: "Book Free Trial",
  },
  {
    id: 6,
    filter: "quran-tafseer",
    image: "https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Quran Tafseer",
    title: "Quran Tafseer",
    level: "Free trial available",
    priceSummary: "We'll assess child's level",
    meta: [
      { icon: "icon-user", text: "Recommend the right course" },
      { icon: "icon-file-text", text: "No commitment" },
    ],
    hoverTitle: "Book a Free Trial",
    hoverDescription: "This Tafseer course guides students through selected Surahs with detailed explanation of meanings, historical context (Asbab al-Nuzul), linguistic nuances, and scholarly commentary.",
    hoverPrice: "Free trial",
    hoverBtn: "Book Now",
  },
];

export default function ProgrammesSection() {
  const [activeFilter, setActiveFilter] = useState("");
  const [open, setOpen] = useState(false);

  const filteredCourses =
    activeFilter === "" ? courses : courses.filter((c) => c.filter === activeFilter);

  return (
    <section className="section-area section-sp2 bg-light">
      <div className="container">
        <div className="row">
          <motion.div className="col-sm-8" {...fadeUp(0.1)}>
            <div className="heading-bx style1 mb-4">
              <h2 className="title-head-sm m-b0">Our Programmes</h2>
            </div>
          </motion.div>
          <motion.div className="col-sm-4 text-sm-end" {...fadeUp(0.2)}>
            <a href="/coursesGrid" className="btn btn-primary btn-standard btn-lg mb-4">
              View All
              <span className="btn-icon bg-[#EECC65]">
                <img src="/assets/images/icon/arrow.svg" alt="" aria-hidden="true" />
              </span>
            </a>
          </motion.div>
        </div>

        <motion.div className="feature-filters1" {...fadeUp(0.3)}>
          <ul className="nav-filters !mb-2" data-bs-toggle="buttons">
            {filters.map((filter) => (
              <li
                key={filter.value}
                data-filter={filter.value ? `.${filter.value}` : ""}
                className={activeFilter === filter.value ? "bg-[#E7E2E4] rounded-2xl duration-300" : ""}
              >
                <button
                  className="filter-btn"
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="row isotopeFilters">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                className={`action-card col-xxl-3 col-lg-4 col-md-6 m-b30 ${course.filter}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: (index % 3) * 0.12 }}
                whileHover={{ y: -4 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                layout
              >
                <div className="course-card">
                  <div className="course-media">
                    <Image
                      src={course.image}
                      alt={course.imageAlt}
                      width={400}
                      height={750}
                      style={{ objectFit: "cover", borderRadius: "12px 12px 0 0" }}
                    />
                  </div>
                  <div className="course-content">
                    <h3 className="course-title">{course.title}</h3>
                    <div className="rating-wrap">
                      <div className="d-flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} color="#EECC65" />
                        ))}
                      </div>
                      <span className="text-dark">{course.level}</span>
                    </div>
                    <div className="course-price">{course.priceSummary}</div>
                  </div>
                  <div className="course-footer">
                    {course.meta.map((item, i) => (
                      <div key={i} className="meta-item">
                        <i className={item.icon} />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="course-hover">
                    <div className="course-content">
                      <h3 className="course-title">
                        <a href="#">{course.hoverTitle}</a>
                      </h3>
                      <div className="rating-wrap">
                        <div className="d-flex">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} color="#EECC65" />
                          ))}
                        </div>
                        <span className="text-white">{course.level}</span>
                      </div>
                      <p>{course.hoverDescription}</p>
                    </div>
                    <div className="course-footer">
                      <div className="course-price">{course.hoverPrice}</div>
                      <button
                        onClick={() => setOpen(true)}
                        className="btn btn-secondary btn-standard ms-2"
                      >
                        Book Free Trial
                        <span className="btn-icon">
                          <img src="/assets/images/icon/arrow.svg" alt="" aria-hidden="true" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div className="bottom-divider" {...fadeUp(0.2)}>
          <div className="text">
            Up and Running in&nbsp;<strong className="text-primary">24 Hours</strong>
            &nbsp;— No lengthy forms, no waiting weeks
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.section
            className="fixed inset-0 bg-black/50 z-[1000] flex justify-center items-center p-5 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 z-10" onClick={() => setOpen(false)}></div>
            <motion.div
              className="w-[900px] max-w-[95vw] z-40 max-h-[90vh] my-10 !rounded-lg overflow-y-auto scroller"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-end py-4"></div>
              <EnrollNow />
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </section>
  );
}
