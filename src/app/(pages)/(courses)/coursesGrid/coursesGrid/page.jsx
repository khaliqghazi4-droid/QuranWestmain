"use client"

import { useState } from 'react'
import Footer from '@/components/footer/footer'
import Header from '@/components/header/header'
import Link from 'next/link'
import { courses } from '@/app/(pages)/(courses)/data'
import { FaStar } from 'react-icons/fa'
import { motion } from 'framer-motion'
import Goldenlines from '@/components/goldenlines'

const Page = () => {
    const [searchText, setSearchText] = useState("");
    const [displayedCourses, setDisplayedCourses] = useState(courses);

    const filterCourses = (e) => {
        e.preventDefault();
        if (!searchText.trim()) {
            setDisplayedCourses(courses);
        } else {
            setDisplayedCourses(courses.filter(course => course.title.toLowerCase().includes(searchText.toLowerCase())));
        }
    }

    return (
        <>
            <Header />
            <section className="page-content">
                <div className="page-banner bg-ovrl1 !bg-[#0B1A37]">
                    <Goldenlines />
                    <div className="container">
                        <div className="flex flex-col md:flex-row md:justify-between items-start md:!items-center">
                            <div className='!mt-[5.75rem]'>
                                <div className="page-banner-entry">
                                    <img className="animted-star star1" src="/assets/images/star/star5.svg" alt="" />
                                    <img className="animted-star star2" src="/assets/images/star/star5.svg" alt="" />
                                    <motion.h1
                                        className="text-white !hidden md:!block"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        All Courses
                                    </motion.h1>
                                    <motion.h2
                                        className="text-white md:!hidden"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        All Courses
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                    >
                                        Explore our Quran, Tajweed, Arabic, and Islamic studies courses
                                        taught by certified scholars.
                                    </motion.p>
                                    <motion.div
                                        className="search-filter-bx !mt-5 border"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                    >
                                        <form onSubmit={filterCourses}>
                                            <div className="!flex !justify-between">
                                                <div className="!w-full">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Course Name"
                                                        value={searchText}
                                                        onChange={(e) => setSearchText(e.target.value)}
                                                    />
                                                </div>
                                                <button type="submit" className="btn btn-primary btn-standard btn-lg">
                                                    Search
                                                    <span className="btn-icon bg-[#EECC65]">
                                                        <img src="/assets/images/icon/arrow.svg" alt="Photo" />
                                                    </span>
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            </div>
                            <div className='!z-10'>
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                >
                                    <img width={400} src="/courses-hero.png" alt="Courses" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="section-area py-4 bg-light">
                    <div className="container">
                        <div className="flex justify-center items-center">
                            <div className="!pt-0">
                                <div className="d-flex flex-wrap gap-2 justify-content-between m-b20">
                                    <div className="text-dark fw-medium">Showing {displayedCourses.length} courses</div>
                                </div>

                                <div className="row">
                                    {displayedCourses.map((course, index) => (
                                        <motion.div
                                            key={course.id}
                                            className="col-xl-4 col-md-6 m-b30"
                                            initial={{ opacity: 1, y: -50 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: false, amount: 0.3 }}
                                            transition={{ duration: 0.5, ease: 'easeOut', delay: (index % 3) * 0.1 }}
                                            whileHover={{ y: -4 }}
                                        >
                                            <div className="course-card">
                                                <div className="course-media">
                                                    <img
                                                        src={course.image}
                                                        alt={course.title}
                                                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div className="course-content">
                                                    <h5 className="course-title">
                                                        <Link href={`/coursesGrid/${course.id}`}>{course.title}</Link>
                                                    </h5>
                                                    <div className="rating-wrap">
                                                        <div className="d-flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FaStar key={i} className="text-yellow-400" />
                                                            ))}
                                                        </div>
                                                        <span className="text-dark">({course.rating}/ {course.ratingCount} Ratings)</span>
                                                    </div>
                                                    <div className="course-price !text-green-700">{course.price}</div>
                                                </div>
                                                <div className="course-footer">
                                                    <div className="meta-item">
                                                        <i className="icon-user" />
                                                        <span>{course.students.toLocaleString()} Students</span>
                                                    </div>
                                                    <div className="meta-item">
                                                        <i className="icon-file-text" />
                                                        <span>{course.lessons} Lessons</span>
                                                    </div>
                                                </div>
                                                <div className="course-hover">
                                                    <div className="course-content">
                                                        <h4 className="course-title">
                                                            <Link href={`/coursesGrid/${course.id}`}>{course.title}</Link>
                                                        </h4>
                                                        <div className="rating-wrap">
                                                            <div className="d-flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <FaStar key={i} className="text-yellow-400" />
                                                                ))}
                                                            </div>
                                                            <span className="text-white">({course.rating}/ {course.ratingCount} Ratings)</span>
                                                        </div>
                                                        <p>{course.subtitle}</p>
                                                    </div>
                                                    <div className="course-footer">
                                                        <Link href={`/coursesGrid/${course.id}`} className="btn btn-secondary btn-standard ms-2">
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
                        </div>
                        {/* <section className='flex justify-center underline !text-green-700'>
                            <button onClick={() => setDisplayedCourses(courses)}>
                                <h5>View all courses</h5>
                            </button>
                        </section> */}

                    </div>
                </section>


            </section>
            <Footer />
        </>
    )
}

export default Page

