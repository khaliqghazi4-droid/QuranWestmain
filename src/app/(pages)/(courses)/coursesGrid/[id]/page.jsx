'use client'

import Footer from '@/components/footer/footer'
import Header from '@/components/header/header'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import { getCourseById, courses } from '@/app/(pages)/(courses)/data'
import { motion, AnimatePresence } from "framer-motion"
import { IoClose } from "react-icons/io5"
import { useState } from "react"
import EnrollNow from '@/components/footer/enrollNow/enrollNow'

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

const CheckIcon = () => (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.4549 2.19521C14.9608 3.34214 10.5065 6.40951 6.39885 11.664L3.97163 8.97009C3.59821 8.54333 2.90472 8.54333 2.5313 8.97009L0.744222 10.9706C0.397476 11.3706 0.424148 11.9574 0.797568 12.3042L6.29216 17.5854C6.7456 18.0122 7.49243 17.9055 7.81251 17.3453C10.7465 12.0375 13.8939 8.08989 19.2285 3.55552C19.8686 2.99539 19.2818 1.92848 18.4549 2.19521Z" fill="#2BBA82" />
    </svg>
)

const Page = () => {
    const { id } = useParams()
    const course = getCourseById(id)
    const [open, setOpen] = useState(false);

    if (!course) {
        notFound()
    }

    const relatedCourses = courses.filter((c) => c.id !== course.id).slice(0, 4)

    return (
        <>
            <Header />
            <section className="page-content">
                <div className="page-banner bg-ovrl1 !bg-[#0B1A37]">
                    <div className="container">
                        <div className="row align-items-center h-[25rem]">
                            <div className="col-xl-7 col-lg-8 col-md-10 py-12">
                                <div className="page-banner-entry">
                                    <img className="animted-star star1" src="/assets/images/star/star1.html" alt="" />
                                    <img className="animted-star star2" src="/assets/images/star/star2.html" alt="" />
                                    <motion.h1
                                        className="!hidden md:!block text-white"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                    >
                                        {course.title}
                                    </motion.h1>
                                    <motion.h2
                                        className="md:!hidden text-white"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                    >
                                        {course.title}
                                    </motion.h2>
                                    <motion.h3
                                        className="!text-white mt-5"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                                    >
                                        {course.subtitle}
                                    </motion.h3>
                                    <motion.div
                                        className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
                                    >
                                        <h5 className="badge bg-light text-dark px-3 py-2">
                                            <i className="icon-user me-1" /> {course.students.toLocaleString()} Students
                                        </h5>
                                        <h5 className="badge bg-white text-dark px-3 py-2">
                                            <span className="text-warning">★</span> {course.rating} ({course.ratingCount} ratings)
                                        </h5>
                                        <h5 className="badge bg-light text-dark px-3 py-2">
                                            {course.level}
                                        </h5>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="section-area bg-light">
                    <div className="container">
                        <div className="row">
                            <motion.div className="col-lg-4 order-lg-1 m-b30">
                                <div className="course-features-detail">
                                    <div className="course-video-bx">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            style={{ width: '100%', objectFit: 'cover' }}
                                        />
                                        <div className="course-features-title">Preview</div>
                                    </div>
                                    <div className="course-features-list">
                                        <h5 className="featured-title">Course Features</h5>
                                        <div className="divider" />
                                        <ul>
                                            <li>Lectures <span>{course.lectures}</span></li>
                                            <li>Quizzes <span>{course.quizzes}</span></li>
                                            <li>Duration <span>{course.duration}</span></li>
                                            <li>Skill level <span>{course.level}</span></li>
                                            <li>Language <span>{course.language}</span></li>
                                            <li>Students <span>{course.students.toLocaleString()}</span></li>
                                            <li>Assessments <span>{course.assessments ? 'Yes' : 'No'}</span></li>
                                        </ul>
                                    </div>
                                    <div className="divider" />
                                    <div className="course-features-footer">
                                        <div className="left">
                                            <h5 className="price">{course.price}</h5>
                                            <p>30-Day Money-Back Guarantee Full Lifetime Access</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        onClick={() => setOpen(!open)}
                                        className="btn btn-primary btn-lg btn-standard w-[25rem]"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        Enroll Now
                                    </motion.button>
                                </div>
                            </motion.div>

                            <div className="col-lg-8">
                                <motion.div className="instructor-card-bar" {...fadeLeft(0)}>
                                    <div className="profile">
                                        <img
                                            src={course.instructor.image}
                                            alt={course.instructor.name}
                                            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                        <div className="info">
                                            <h6 className="name">{course.instructor.name}</h6>
                                            <p>{course.instructor.role}</p>
                                        </div>
                                    </div>
                                    <div className="feed">
                                        <div className="user-student">
                                            <i className="fi fi-sr-users text-primary" />
                                            <h6 className="number">{course.instructor.learners}</h6>
                                            <p>Learners</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div className="instructor-card" {...fadeLeft(0.1)}>
                                    <div className="card-head">
                                        <h5 className="title">About This Course</h5>
                                    </div>
                                    <div className="card-body">
                                        <ul className="check-list list-grid-2">
                                            {course.features.map((feature, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: false, amount: 0.3 }}
                                                    transition={{ duration: 0.4, delay: i * 0.06 }}
                                                >
                                                    <CheckIcon />
                                                    {feature}
                                                </motion.li>
                                            ))}
                                        </ul>
                                        <p>{course.description}</p>
                                    </div>
                                </motion.div>

                                <motion.div className="instructor-card" {...fadeLeft(0.15)}>
                                    <div className="card-head">
                                        <h5 className="title">Instructor</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <motion.div
                                                className="col-xl-5 col-sm-6 m-b30"
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: false, amount: 0.3 }}
                                                transition={{ duration: 0.5, delay: 0.1 }}
                                                whileHover={{ y: -4 }}
                                            >
                                                <div className="team-member style1 data-item-hover">
                                                    <div className="team-media data-img-hover">
                                                        <img
                                                            src={course.instructor.image}
                                                            alt={course.instructor.name}
                                                            style={{ width: '100%', height: '370px', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div className="team-info">
                                                        <h3 className="member-name">
                                                            <Link
                                                                className="stretched-link"
                                                                href={`/instructors/${course.instructor.name
                                                                    .toLowerCase()
                                                                    .replace(/\s+/g, '-')
                                                                    .replace(/[^a-z0-9-]/g, '')}`}
                                                            >
                                                                {course.instructor.name}
                                                            </Link>
                                                        </h3>
                                                        <span>{course.instructor.role}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-area section-sp1 bg-light">
                    <div className="container">
                        <motion.div
                            className="heading-bx style1 d-flex align-items-center justify-content-between mb-4"
                            {...fadeUp(0)}
                        >
                            <h2 className="title-head-xs m-b0">You May Also Like</h2>
                            <Link href="/coursesGrid" className="btn btn-outline-primary btn-sm">View All</Link>
                        </motion.div>
                        <div className="row">
                            {relatedCourses.map((related, index) => (
                                <motion.div
                                    key={related.id}
                                    className="col-xl-3 col-lg-4 col-md-6 m-b30"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.3 }}
                                    transition={{ duration: 0.5, ease: 'easeOut', delay: (index % 4) * 0.1 }}
                                    whileHover={{ y: -4 }}
                                >
                                    <div className="course-card">
                                        <div className="course-media">
                                            <img
                                                src={related.image}
                                                alt={related.title}
                                                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="course-content">
                                            <h3 className="course-title">
                                                {related.title}
                                            </h3>
                                            <div className="course-price !text-green-700">
                                                {related.price}
                                            </div>
                                            <h5>{related.title}</h5>
                                            <p>{related.subtitle}</p>
                                        </div>
                                        <div className="course-footer">
                                            <div className="meta-item">
                                                <i className="icon-user" />
                                                <span>{related.students.toLocaleString()} Students</span>
                                            </div>
                                            <div className="meta-item">
                                                <i className="icon-file-text" />
                                                <span>{related.lessons} Lessons</span>
                                            </div>
                                        </div>
                                        <div className="course-hover">
                                            <div className="course-content">
                                                <h3 className="course-title">
                                                    <Link href={`/coursesGrid/${related.id}`}>{related.title}</Link>
                                                </h3>
                                                <p>{related.subtitle}</p>
                                            </div>
                                            <div className="course-footer">
                                                <div className="course-price">
                                                    {related.price}{' '}
                                                    {related.originalPrice && <del>{related.originalPrice}</del>}
                                                </div>
                                                <Link
                                                    href={`/coursesGrid/${related.id}`}
                                                    className="btn btn-secondary btn-standard ms-2"
                                                >
                                                    Book Free Trial
                                                    <span className="btn-icon">
                                                        <img src="/assets/images/icon/arrow.svg" alt="Photo" aria-hidden="true" />
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </section>
            <Footer />
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
                            <EnrollNow defaultCourse={course?.enrollCourse ?? course?.title} />
                        </motion.div>
                    </motion.section>
                )}
            </AnimatePresence>
        </>
    )
}

export default Page
