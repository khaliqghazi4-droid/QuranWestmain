"use client";

import Footer from '@/components/footer/footer'
import Header from '@/components/header/header'
import React from 'react'
import { motion } from 'framer-motion'
import Goldenlines from '@/components/goldenlines';

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.6, ease: 'easeOut', delay },
})

const fadeLeft = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.7, ease: 'easeOut', delay },
})

const fadeRight = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.7, ease: 'easeOut', delay },
})

const scaleIn = (delay = 0) => ({
    initial: { opacity: 0, scale: 0.88 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.5, ease: 'easeOut', delay },
})

const Page = () => {
    return (
        <>
            <Header />
            <section className="page-content">
                <div className="page-banner bg-ovrl1 !bg-[#0B1A37]">
                    <Goldenlines />
                    <div className="container">
                        <div className="row align-items-center h-[25rem]">
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
                                        Contact Us
                                    </motion.h1>
                                    <motion.h2
                                        className="text-white md:!hidden"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        Contact Us
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                    >
                                        Best online education platforms offer flexible learning, quality
                                        courses, and expert instructors.
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* begin::Contact our Friendly Team */}
                <section className="section-area bg-light section-sp1 pt-5">
                    <div className="container">
                        <div className="row align-items-xl-end">
                            <div className="col-lg-6 m-b30">
                                <div className="row g-2 pe-xl-3">
                                    {[
                                        // {
                                        //     delay: 0.1, title: 'Call us', sub: 'Mon-Fri 9am to 7pm',
                                        //     icon: 'icon-phone-call', href: 'tel:+44 7508 803086', text: `+44 7508 803086 <br /> +44 7508 803086`, isLink: true,
                                        // },
                                        // {
                                        //     delay: 0.2, title: 'Chat Us', sub: 'Chat our team 24X7',
                                        //     icon: 'icon-message-square-more', href: 'tel:19850000000', text: '+1(985) 000-0000', isLink: true,
                                        // },
                                        {
                                            delay: 0.3, title: 'Supports', sub: "We're here to help",
                                            icon: 'icon-mail', href: 'mailto:info@quranwest.com', text: 'info@quranwest.com', isLink: true,
                                        },
                                        // {
                                        //     delay: 0.4, title: 'Visit us', sub: 'Visit our office HQ.',
                                        //     icon: 'icon-map-pin', text: '1234 Elm Street, ZZ 12345', isLink: false,
                                        // },
                                    ].map(({ delay, title, sub, icon, href, text, isLink }) => (
                                        <motion.div key={title} className="col-xl-6 col-lg-12 col-md-6" {...scaleIn(delay)}>
                                            <div className="featured-bx5 !bg-[#EECC65]">
                                                <div className="featured-content">
                                                    <h5 className="featured-title">{title}</h5>
                                                    <p>{sub}</p>
                                                </div>
                                                <div className="featured-text-icon">
                                                    <i className={icon} />
                                                    {isLink
                                                        ? <a href={href} className="text">{text}</a>
                                                        : <p className="text">{text}</p>
                                                    }
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-lg-6 m-b30">
                                <motion.div className="form-card contact-form-card" {...fadeRight(0.2)}>
                                    <form
                                        className="ajax-form m-auto"
                                        action="https://eduthink.layoutdrop.com/demo/assets/script/contact.php"
                                    >
                                        <div className="ajax-message" />
                                        <div className="heading-bx style1">
                                            <h2 className="title-head-sm m-b0">Contact our Friendly Team</h2>
                                            <p className="text-primary">Let us know how can help.</p>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="contactFirstName">First Name</label>
                                                    <input type="text" className="form-control" id="contactFirstName" placeholder="e.g. Michael" />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="contactLastName">Last Name</label>
                                                    <input type="text" className="form-control" id="contactLastName" placeholder="e.g. Thompson" />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="contactEmail">Email</label>
                                                    <input type="email" className="form-control" id="contactEmail" placeholder="info@example.com" />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="contactSubject">Subject (Optional)</label>
                                                    <input type="text" className="form-control" id="contactSubject" placeholder="Topic" />
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-group advance-input">
                                                    <label className="form-label" htmlFor="contactMessage">Message</label>
                                                    <textarea name="message" rows={4} className="form-control" id="contactMessage" placeholder="Leave us a message..." defaultValue={""} />
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <motion.button
                                                    name="submit"
                                                    type="submit"
                                                    value="Submit"
                                                    className="btn btn-primary btn-lg btn-standard"
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                >
                                                    Submit Now
                                                    <span className="btn-icon bg-[#EECC65]">
                                                        <img src="/assets/images/icon/arrow.svg" alt="Photo" />
                                                    </span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* end::Contact our Friendly Team */}


                {/* Start::Map */}
                <div className="section-area">
                    <div className="map-frame">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.1298878182047!2d-81.38369578541523!3d30.204840081824198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88e437ac927a996b%3A0x799695b1a2b970ab!2sNona+Blue+Modern+Tavern!5e0!3m2!1sen!2sin!4v1548177305546"
                            allowFullScreen=""
                        />
                    </div>
                </div>
                {/* End::Map */}
            </section>
            <Footer />
        </>
    )
}

export default Page

