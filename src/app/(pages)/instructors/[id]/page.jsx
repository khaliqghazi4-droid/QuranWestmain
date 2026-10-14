'use client'

import { useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import Footer from '@/components/footer/footer'
import Header from '@/components/header/header'
import EnrollModal from '@/components/enroll-modal'
import { InstructorAbout, InstructorJourney, OtherInstructors } from '@/components/instructors/instructor-journey'
import { getInstructorById, instructors } from '../data'

// The course in the free-trial form that fits an instructor's subject
function courseFor(role) {
    const subjects = [
        ['Tajweed', 'Tajweed Rules'],
        ["Qira'at", 'Tajweed Rules'],
        ['Hifz', 'Quran Memorization'],
        ['Islamic Studies', 'Islamic Studies'],
        ['Arabic', 'Arabic Language'],
        ['Tafsir', 'Quran Tafseer'],
    ]
    return subjects.find(([word]) => role.includes(word))?.[1] ?? 'Quran Reading'
}

// An instructor's profile: their journey (booking card, qualifications and
// career on a gold track), their biography and a few other instructors.
// Book Session opens the free-trial form, with their subject picked.
const Page = () => {
    const { id } = useParams()
    const [open, setOpen] = useState(false)
    const instructor = getInstructorById(id)

    if (!instructor) {
        notFound()
    }

    const otherInstructors = instructors.filter((i) => i.id !== instructor.id).slice(0, 3)

    return (
        <>
            <Header />
            <main className="page-content">
                <InstructorJourney instructor={instructor} onBook={() => setOpen(true)} />
                <InstructorAbout instructor={instructor} />
                <OtherInstructors instructors={otherInstructors} />
            </main>
            <Footer />
            <EnrollModal open={open} onClose={() => setOpen(false)} defaultCourse={courseFor(instructor.role)} />
        </>
    )
}

export default Page
