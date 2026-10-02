'use client'

import Footer from '@/components/footer/footer'
import Header from '@/components/header/header'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import { getInstructorById, instructors } from '../data'
import { motion } from 'framer-motion'

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.6, ease: 'easeOut', delay },
})

const fadeLeft = (delay = 0) => ({
    initial: { x: -40 },
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

const Page = () => {
    const { id } = useParams()
    const instructor = getInstructorById(id)

    if (!instructor) {
        notFound()
    }

    const relatedInstructors = instructors.filter((i) => i.id !== instructor.id).slice(0, 3)

    return (
        <>
            <Header />
            <section className="page-content">
                <div className="page-banner py-10 bg-ovrl1 !bg-[#0B1A37]">
                    <div className="container">
                        <div className="row align-items-center h-[25rem]">
                            <div className="col-xl-5 col-lg-6 col-md-10">
                                <div className="page-banner-entry">
                                    <img className="animted-star star1" src="/assets/images/star/star1.html" alt="" />
                                    <img className="animted-star star2" src="/assets/images/star/star2.html" alt="" />
                                    <motion.h2
                                        className='text-white md:!hidden'
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        {instructor.name}
                                    </motion.h2>
                                    <motion.h1
                                        className='text-white !hidden md:!block'
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        {instructor.name}
                                    </motion.h1>
                                    <motion.h4
                                        className="text-secondary"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.15 }}
                                    >
                                        {instructor.role}
                                    </motion.h4>
                                    <motion.div
                                        className="d-flex gap-3 mt-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.25 }}
                                    >
                                        <h4 className="badge bg-primary px-3 py-2">{instructor.experience} Experience</h4>
                                        <h4 className="badge bg-success px-3 py-2">{instructor.students} Students</h4>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="section-area bg-light">
                    <div className="container">
                        <div className="row">
                            <motion.div
                                className="col-lg-5 order-lg-1 m-b30"
                            >
                                <div className="team-detail-media">
                                    <img
                                        src={instructor.fullImage}
                                        alt={instructor.name}
                                        style={{ width: '100%', borderRadius: '12px', objectFit: 'cover' }}
                                    />
                                </div>
                            </motion.div>
                            <motion.div
                                className="col-lg-7 m-b30"

                            >
                                <div className="team-detail">
                                    <div className="heading-bx style1 mb-2">
                                        <h2 className="title-head-xs m-b0">Biography</h2>
                                    </div>
                                    <span className="text-lg">{instructor.bio}</span>

                                    <div className="heading-bx style1 !mb-3 !mt-10">
                                        <h2 className="title-head-xs m-b0">Qualifications</h2>
                                    </div>
                                    <ul className="list-unstyled mb-4">
                                        {instructor.qualifications?.map((q, i) => (
                                            <motion.li
                                                key={i}
                                                className="d-flex align-items-start gap-2 mb-2"
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: false, amount: 0.3 }}
                                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                            >
                                                <i className="fas fa-check-circle text-primary mt-1" style={{ flexShrink: 0 }} />
                                                <span className="text-lg">{q}</span>
                                            </motion.li>
                                        ))}
                                    </ul>

                                    <div className="heading-bx style1 mb-3 mt-10">
                                        <h2 className="title-head-xs m-b0">Experience</h2>
                                    </div>
                                    <ul className="list-unstyled mb-2">
                                        {instructor.career?.map((c, i) => (
                                            <motion.li
                                                key={i}
                                                className="d-flex gap-3 mb-3"
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: false, amount: 0.3 }}
                                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                            >
                                                <div className="d-flex flex-column align-items-center" style={{ flexShrink: 0 }}>
                                                    <div className="bg-primary rounded-circle" style={{ width: 10, height: 10, marginTop: 6 }} />
                                                    {i < instructor.career.length - 1 && (
                                                        <div className="bg-primary opacity-25" style={{ width: 2, flex: 1, minHeight: 32 }} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="fw-semibold">{c.title}</h3>
                                                    <h5 className="text-muted small">{c.org}</h5>
                                                    <h5 className="badge bg-primary bg-opacity-10 text-primary mt-1" style={{ fontSize: '0.72rem' }}>{c.period}</h5>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <section className="section-area section-sp1 bg-light">
                    <div className="container">
                        <motion.div
                            className="heading-bx style1 d-flex align-items-center justify-content-between mb-4"
                            {...fadeUp(0)}
                        >
                            <h2 className="title-head-xs m-b0">Meet Other Instructors</h2>
                            <Link href="/instructors" className="btn btn-primary btn-standard btn-sm">View All</Link>
                        </motion.div>
                        <div className="row">
                            {relatedInstructors.map((related, index) => (
                                <motion.div
                                    key={related.id}
                                    className="col-xl-4 col-md-6 m-b30"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.3 }}
                                    transition={{ duration: 0.5, delay: index * 0.12 }}
                                    whileHover={{ y: -4 }}
                                >
                                    <div className="team-member style1 data-item-hover">
                                        <Link href={`/instructors/${related.id}`}>
                                            <div
                                                className="team-media data-img-hover"
                                                data-displacement="/assets/libs/tree/effect1.jpg"
                                                data-intensity="0.4"
                                                data-speedin={1}
                                                data-speedout={1}
                                            >
                                                <img
                                                    src={related.image}
                                                    alt={related.name}
                                                    style={{ width: '100%', height: '550px', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="team-info">
                                                <div className="member-name">
                                                    <Link className="stretched-link" href={`/instructors/${related.id}`}>
                                                        <h6 className='text-white'> {related.name}</h6>
                                                    </Link>
                                                </div>
                                                <span>{related.role}</span>
                                            </div>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </section>
            <Footer />
        </>
    )
}

export default Page
