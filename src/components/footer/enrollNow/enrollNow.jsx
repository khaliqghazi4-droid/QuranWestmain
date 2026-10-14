import React, { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
    User,
    ChevronDown,
    Plus,
    X,
    Baby,
    Phone,
    Mail,
    MapPin,
    Globe,
    Clock,
    Check,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'


// ── constants ────────────────────────────────────────────────────────────────

const COURSES = ['Arabic Language', 'Islamic Studies', 'Tajweed Rules', 'Quran Memorization', 'Quran Reading', 'Quran Tafseer']

// Which fields live in which section, so a section with a problem can open itself
const SECTION_FIELDS = {
    course: ['course', 'courseFor', 'gender', 'tutorGender'],
    info: ['fullName', 'email', 'whatsapp', 'city', 'country'],
    children: ['children'],
    trial: ['trialTime'],
}

// ── tiny primitives ──────────────────────────────────────────────────────────
// The look: navy text on white, gold for what's required, chosen or in focus

const Label = ({ children }) => (
    <label className="mb-[0.4rem] block text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#0B1E36]/70">
        {children}
    </label>
)

const Required = () => <span className="ml-[0.15rem] text-[#C9A13B]">*</span>

const FIELD = `w-full rounded-[0.6rem] border-[1px] border-[#E3DED2] bg-white py-[0.65rem] text-[0.9rem] text-[#0B1E36]
    transition-[border-color,box-shadow] placeholder:text-[#0B1E36]/40 focus:border-[#D4AF37] focus:outline-none
    focus:ring-[3px] focus:ring-[#D4AF37]/20`

const Input = ({ icon: Icon, ...props }) => (
    <div className="relative">
        {Icon && (
            <Icon className="pointer-events-none absolute left-[0.8rem] top-1/2 h-[1rem] w-[1rem] -translate-y-1/2 text-[#0B1E36]/40" />
        )}
        <input
            {...props}
            className={`${FIELD} ${Icon ? 'pl-[2.3rem]' : 'pl-[0.8rem]'} pr-[0.8rem]`}
        />
    </div>
)

const Select = ({ children, ...props }) => (
    <div className="relative">
        <select
            {...props}
            className={`${FIELD} cursor-pointer appearance-none pl-[0.8rem] pr-[2.3rem]`}
        >
            {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-[0.8rem] top-1/2 h-[1rem] w-[1rem] -translate-y-1/2 text-[#0B1E36]/50" />
    </div>
)

const RadioBtn = ({ name, value, checked, onChange, Icon, label }) => (
    <label className={`flex flex-1 cursor-pointer select-none items-center justify-center gap-[0.5rem] rounded-[0.6rem] border-[1px]
        px-[0.6rem] py-[0.65rem] text-center text-[0.88rem] font-semibold leading-tight transition-colors sm:px-[1rem]
        ${checked
            ? 'border-[#D4AF37] bg-[#FBF3DF] text-[#0B1E36] shadow-[inset_0_0_0_1px_rgba(212,175,55,0.35)]'
            : 'border-[#E3DED2] bg-white text-[#0B1E36]/70 hover:border-[#D4AF37]/60 hover:bg-[#FFFCF5]'
        }`}>
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
        <Icon className="h-[1rem] w-[1rem] shrink-0" />
        {label}
    </label>
)

const NAVY_BUTTON = `inline-flex flex-1 items-center justify-center gap-[0.5rem] rounded-[0.6rem] bg-[#0B1E36] px-[2rem] py-[0.72rem]
    text-[0.92rem] font-bold !text-white shadow-[0_10px_22px_-12px_rgba(11,30,54,0.8)] transition-[background-color,transform]
    hover:-translate-y-[1px] hover:bg-[#13305A] disabled:cursor-wait disabled:opacity-80 sm:flex-none sm:min-w-[14rem]`

const ErrorText = ({ children, className = 'mt-[0.3rem]' }) => (
    <p className={`!mb-0 ${className} !text-[0.75rem] font-medium !text-[#C2410C]`}>{children}</p>
)

// One step of the form: its title over its fields. Only the current step
// shows; the others are hidden but stay in the form, and `data-section` tells
// the form which step a field is on, so it can go back to it when needed.
const Section = ({ id, title, subtitle, active, children }) => (
    <div
        data-section={id}
        hidden={!active}
        className="animate-fade-in rounded-[0.9rem] border-[1px] border-[#E8DDC2] bg-white shadow-[0_10px_24px_-18px_rgba(11,30,54,0.4)]"
    >
        <div className="border-b-[1px] border-[#EFE8D6] px-[0.9rem] py-[0.65rem] leading-tight sm:px-[1.1rem]">
            <h3 className="!mb-0 !text-[1.05rem] !font-bold !leading-[1.3] !text-[#0B1E36]">{title}</h3>
            <p className="!mb-0 mt-[0.15rem] !text-[0.78rem] font-medium !leading-[1.35] !text-[#0B1E36]/55">{subtitle}</p>
        </div>
        <div className="px-[0.9rem] pb-[0.9rem] pt-[0.85rem] sm:px-[1.1rem]">
            {children}
        </div>
    </div>
)

// The steps along the top, each a dot on a gold line: gold with a tick once
// its part is filled in, ringed for the step on screen. Clicking one goes there.
const Stepper = ({ steps, active, onStep }) => (
    <ol className="!mb-0 flex list-none items-start !pl-0" aria-label="Enrolment steps">
        {steps.map((step, i) => {
            const isActive = step.id === active
            return (
                <li key={step.id} className="relative flex flex-1 flex-col items-center">
                    {/* the line to the step before */}
                    {i > 0 && (
                        <span
                            aria-hidden="true"
                            className={`absolute right-1/2 top-[0.55rem] h-[2px] w-full -translate-y-1/2 ${steps[i - 1].done ? "bg-[#D4AF37]" : "bg-[#E3DED2]"}`}
                        />
                    )}
                    <button
                        type="button"
                        onClick={() => onStep(step.id)}
                        className="relative z-[1] flex flex-col items-center gap-[0.3rem] px-[0.25rem]"
                        aria-current={isActive ? "step" : undefined}
                    >
                        <span
                            className={`flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full transition-colors ${step.done ? "bg-[#D4AF37]" : isActive ? "bg-white" : "bg-[#E3DED2]"} ${isActive ? "ring-[3px] ring-[#D4AF37] ring-offset-[2px]" : ""}`}
                        >
                            {step.done && <Check className="h-[0.7rem] w-[0.7rem] text-white" strokeWidth={3.5} />}
                        </span>
                        <span className={`text-[0.75rem] ${isActive ? "font-bold text-[#0B1E36]" : step.done ? "font-semibold text-[#0B1E36]" : "font-semibold text-[#0B1E36]/50"}`}>
                            {i + 1}. {step.label}
                        </span>
                    </button>
                </li>
            )
        })}
    </ol>
)

// ── child card ───────────────────────────────────────────────────────────────

const ChildCard = ({ child, index, onChange, onRemove }) => (
    <div className="mb-[0.75rem] rounded-[0.75rem] border-[1px] border-[#ECE5D3] bg-[#FBF8F1] p-[0.85rem]">
        <div className="mb-[0.6rem] flex items-center justify-between">
            <span className="flex items-center gap-[0.35rem] rounded-full bg-[#FBF3DF] px-[0.75rem] py-[0.25rem] text-[0.75rem] font-bold text-[#0B1E36] ring-1 ring-[#D4AF37]/60">
                <Baby className="h-[0.8rem] w-[0.8rem]" /> Child {index + 1}
            </span>
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove child ${index + 1}`}
                className="flex h-[1.75rem] w-[1.75rem] items-center justify-center rounded-[0.5rem] border-[1px] border-[#E3DED2] bg-white
                    text-[#0B1E36]/50 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
            >
                <X className="h-[0.9rem] w-[0.9rem]" />
            </button>
        </div>
        <div className="grid grid-cols-1 gap-[0.75rem] sm:grid-cols-[minmax(0,1fr)_6rem] md:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1.1fr)]">
            <div>
                <Label>Child name <Required /></Label>
                <Input
                    icon={User}
                    type="text"
                    value={child.name}
                    onChange={(e) => onChange(child.id, 'name', e.target.value)}
                    placeholder="Full name"
                    required
                />
            </div>
            <div>
                <Label>Age <Required /></Label>
                <Input
                    type="number"
                    min="1"
                    max="17"
                    value={child.age}
                    onChange={(e) => onChange(child.id, 'age', e.target.value)}
                    placeholder="e.g. 8"
                    required
                />
            </div>
            <div className="sm:col-span-2 md:col-span-1">
                <Label>Gender <Required /></Label>
                <div className="flex gap-[0.5rem]">
                    <RadioBtn name={`childGender-${child.id}`} value="male" checked={child.gender === 'male'}
                        onChange={() => onChange(child.id, 'gender', 'male')} Icon={User} label="Male" />
                    <RadioBtn name={`childGender-${child.id}`} value="female" checked={child.gender === 'female'}
                        onChange={() => onChange(child.id, 'gender', 'female')} Icon={User} label="Female" />
                </div>
            </div>
        </div>
    </div>
)

// ── main component ───────────────────────────────────────────────────────────

const initialForm = {
    course: COURSES[0],
    courseFor: 'adult',
    gender: 'male',
    tutorGender: 'male',
    fullName: '',
    email: '',
    whatsapp: '',
    city: '',
    country: '',
    trialTime: '',
}

const matchCourse = (name) =>
    COURSES.find((c) => c.toLowerCase() === String(name ?? '').trim().toLowerCase()) ?? COURSES[0]

// `defaultTrialTime` ("YYYY-MM-DDTHH:mm", local) pre-fills the trial class time
const EnrollNow = ({ defaultCourse, defaultTrialTime }) => {
    const startForm = { ...initialForm, course: matchCourse(defaultCourse), trialTime: defaultTrialTime ?? '' }
    const [form, setForm] = useState(startForm)
    const [children, setChildren] = useState([])
    const [childCounter, setChildCounter] = useState(0)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [validationErrors, setValidationErrors] = useState({})

    // ── steps ─────────────────────────────────────────────────────────────────
    // One step on screen at a time. Next checks the fields on the step (the
    // browser points at the first one missing) before moving on. On submit, the
    // browser fires "invalid" on each field it won't accept before it shows its
    // message on the first; if that one is on another step, the form goes there
    // first (with flushSync, so the field is on screen in time: a hidden field
    // can't show the message). Checks that fail after that go to their step too.

    const formRef = useRef(null)
    const [stepId, setStepId] = useState('course')
    const stepRef = useRef(stepId)
    stepRef.current = stepId
    const jumpedRef = useRef(false)

    const steps = [
        { id: 'course', label: 'Course', done: !!(form.course && form.courseFor && form.tutorGender && (form.courseFor !== 'adult' || form.gender)) },
        { id: 'info', label: 'Info', done: ['fullName', 'email', 'whatsapp', 'city', 'country'].every((key) => form[key].trim()) },
        ...(form.courseFor === 'kid'
            ? [{ id: 'children', label: 'Children', done: children.length > 0 && children.every((c) => c.name.trim() && c.age) }]
            : []),
        { id: 'trial', label: 'Trial', done: !!form.trialTime },
    ]
    const stepIndex = Math.max(0, steps.findIndex((s) => s.id === stepId))
    const current = steps[stepIndex].id
    const isLast = stepIndex === steps.length - 1

    useEffect(() => {
        const formEl = formRef.current
        if (!formEl) return
        const onInvalid = (event) => {
            const id = event.target.closest('[data-section]')?.dataset.section
            if (!id || jumpedRef.current) return
            jumpedRef.current = true
            setTimeout(() => { jumpedRef.current = false }, 0)
            if (id !== stepRef.current) flushSync(() => setStepId(id))
        }
        formEl.addEventListener('invalid', onInvalid, true)
        return () => formEl.removeEventListener('invalid', onInvalid, true)
    }, [])

    useEffect(() => {
        const first = Object.keys(SECTION_FIELDS).find((id) => SECTION_FIELDS[id].some((key) => validationErrors[key]))
        if (first) setStepId(first)
    }, [validationErrors])

    // after a successful enrolment the emptied form starts again at step 1
    useEffect(() => {
        if (success) setStepId('course')
    }, [success])

    const goNext = () => {
        const fields = formRef.current?.querySelectorAll(`[data-section="${current}"] input, [data-section="${current}"] select`) ?? []
        const missing = [...fields].find((field) => !field.checkValidity())
        if (missing) return missing.reportValidity()
        setStepId(steps[stepIndex + 1].id)
    }
    const goBack = () => setStepId(steps[stepIndex - 1].id)

    // Enter in a field moves on a step, as Next does (on the last step it submits)
    const onKeyDown = (event) => {
        if (event.key === 'Enter' && !isLast && event.target.tagName === 'INPUT') {
            event.preventDefault()
            goNext()
        }
    }

    // ── form helpers ─────────────────────────────────────────────────────────

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

    const handleCourseFor = (val) => {
        setField('courseFor', val)
        if (val === 'kid' && children.length === 0) {
            const id = childCounter + 1
            setChildren([{ id, name: '', age: '', gender: 'male' }])
            setChildCounter(id)
        }
    }

    // ── child helpers ─────────────────────────────────────────────────────────

    const addChild = () => {
        const id = childCounter + 1
        setChildren((prev) => [...prev, { id, name: '', age: '', gender: 'male' }])
        setChildCounter(id)
    }

    const removeChild = (id) => setChildren((prev) => prev.filter((c) => c.id !== id))

    const updateChild = (id, field, value) =>
        setChildren((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))

    // ── validation ────────────────────────────────────────────────────────────────

    const validateForm = () => {
        const errors = {}

        // Course details validation
        if (!form.course) errors.course = 'Course is required'
        if (!form.courseFor) errors.courseFor = 'Course for is required'

        // Gender validation for adults
        if (form.courseFor === 'adult' && !form.gender) {
            errors.gender = 'Gender is required'
        }

        // Tutor gender validation
        if (!form.tutorGender) errors.tutorGender = 'Tutor gender preference is required'

        // Personal information validation
        if (!form.fullName.trim()) errors.fullName = 'Full name is required'
        if (!form.email.trim()) {
            errors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            errors.email = 'Email is invalid'
        }
        if (!form.whatsapp.trim()) errors.whatsapp = 'WhatsApp number is required'
        if (!form.city.trim()) errors.city = 'City is required'
        if (!form.country.trim()) errors.country = 'Country is required'

        // Trial time validation
        if (!form.trialTime) errors.trialTime = 'Trial class time is required'

        // Children validation
        if (form.courseFor === 'kid') {
            if (children.length === 0) {
                errors.children = 'At least one child must be added'
            } else {
                const childErrors = []
                children.forEach((child, index) => {
                    if (!child.name.trim()) childErrors.push(`Child ${index + 1} name is required`)
                    if (!child.age) childErrors.push(`Child ${index + 1} age is required`)
                    if (child.age && (child.age < 1 || child.age > 17)) {
                        childErrors.push(`Child ${index + 1} age must be between 1 and 17`)
                    }
                    if (!child.gender) childErrors.push(`Child ${index + 1} gender is required`)
                })
                if (childErrors.length > 0) {
                    errors.children = childErrors.join(', ')
                }
            }
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    // ── submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setSuccess(false)

        if (!validateForm()) {
            setError('Please fill in all required fields')
            return
        }

        const payload = {
            course: form.course,
            courseFor: form.courseFor,
            tutorGender: form.tutorGender,
            fullName: form.fullName,
            email: form.email,
            whatsapp: form.whatsapp,
            city: form.city,
            country: form.country,
            // datetime-local has no timezone; send the exact instant in the visitor's timezone
            trialTime: new Date(form.trialTime).toISOString(),
            ...(form.courseFor === 'adult' && { gender: form.gender }),
            ...(form.courseFor === 'kid' && { children: children.map(({ id, ...child }) => child) }),
        }

        try {
            setLoading(true)
            const res = await fetch('/api/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Something went wrong')
            setSuccess(true)
            setForm(startForm)
            setChildren([])
            setChildCounter(0)
            setValidationErrors({})

            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' })

            // Auto hide success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000)
        } catch (err) {
            setError(err?.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            onKeyDown={onKeyDown}
            className="!z-50 rounded-[1.1rem] bg-white p-[0.75rem] shadow-[0_24px_50px_-24px_rgba(11,30,54,0.45)] sm:px-[1.25rem] sm:py-[1rem]"
        >
            <Stepper steps={steps} active={current} onStep={setStepId} />

            <div className="mt-[0.85rem]">
                {/* Course Details */}
                <Section id="course" title="Course Details" subtitle="Choose your course and preferences"
                    active={current === 'course'}>
                    <div className="grid grid-cols-1 gap-[0.85rem] sm:grid-cols-2">
                        <div>
                            <Label>Select course <Required /></Label>
                            <Select
                                value={form.course}
                                onChange={(e) => setField('course', e.target.value)}
                                required
                            >
                                {COURSES.map((c) => <option key={c}>{c}</option>)}
                            </Select>
                            {validationErrors.course && <ErrorText>{validationErrors.course}</ErrorText>}
                        </div>

                        <div>
                            <Label>Course for <Required /></Label>
                            <div className="flex gap-[0.5rem]">
                                <RadioBtn name="courseFor" value="adult" checked={form.courseFor === 'adult'}
                                    required onChange={() => handleCourseFor('adult')} Icon={User} label="Adult" />
                                <RadioBtn name="courseFor" value="kid" checked={form.courseFor === 'kid'}
                                    required onChange={() => handleCourseFor('kid')} Icon={Baby} label="Kid" />
                            </div>
                            {validationErrors.courseFor && <ErrorText>{validationErrors.courseFor}</ErrorText>}
                        </div>

                        {form.courseFor === 'adult' && (
                            <div>
                                <Label>Your gender <Required /></Label>
                                <div className="flex gap-[0.5rem]">
                                    <RadioBtn
                                        name="gender"
                                        value="male"
                                        checked={form.gender === 'male'}
                                        required
                                        onChange={() => setField('gender', 'male')} Icon={User} label="Male" />
                                    <RadioBtn name="gender" value="female" checked={form.gender === 'female'}
                                        required onChange={() => setField('gender', 'female')} Icon={User} label="Female" />
                                </div>
                                {validationErrors.gender && <ErrorText>{validationErrors.gender}</ErrorText>}
                            </div>
                        )}

                        <div>
                            <Label>Required tutor gender <Required /></Label>
                            <div className="flex gap-[0.5rem]">
                                <RadioBtn name="tutorGender" value="male" checked={form.tutorGender === 'male'}
                                    onChange={() => setField('tutorGender', 'male')} Icon={User} label="Male tutor" />
                                <RadioBtn name="tutorGender" value="female" checked={form.tutorGender === 'female'}
                                    required onChange={() => setField('tutorGender', 'female')} Icon={User} label="Female tutor" />
                            </div>
                            {validationErrors.tutorGender && <ErrorText>{validationErrors.tutorGender}</ErrorText>}
                        </div>
                    </div>
                </Section>

                {/* Parent / Personal Info */}
                <Section id="info" title={form.courseFor === 'kid' ? 'Parent Information' : 'Information'}
                    subtitle="Your personal & contact details"
                    active={current === 'info'}>
                    <div className="grid grid-cols-1 gap-[0.7rem] sm:grid-cols-2 sm:gap-[0.85rem] md:grid-cols-6">
                        <div className="sm:col-span-2">
                            <Label>
                                {form.courseFor === 'kid' ? 'Parent full name' : 'Full name'} <Required />
                            </Label>
                            <Input
                                icon={User}
                                type="text"
                                value={form.fullName}
                                onChange={(e) => setField('fullName', e.target.value)}
                                placeholder="Enter your full name"
                                required
                            />
                            {validationErrors.fullName && <ErrorText>{validationErrors.fullName}</ErrorText>}
                        </div>

                        <div className="md:col-span-2">
                            <Label>Email address <Required /></Label>
                            <Input
                                icon={Mail}
                                type="email"
                                value={form.email}
                                onChange={(e) => setField('email', e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                            {validationErrors.email && <ErrorText>{validationErrors.email}</ErrorText>}
                        </div>
                        <div className="md:col-span-2">
                            <Label>WhatsApp number <Required /></Label>
                            <Input
                                icon={Phone}
                                type="tel"
                                value={form.whatsapp}
                                onChange={(e) => setField('whatsapp', e.target.value)}
                                placeholder="+44 7000 000000"
                                required
                            />
                            {validationErrors.whatsapp && <ErrorText>{validationErrors.whatsapp}</ErrorText>}
                        </div>

                        <div className="md:col-span-3">
                            <Label>City <Required /></Label>
                            <Input
                                icon={MapPin}
                                type="text"
                                value={form.city}
                                onChange={(e) => setField('city', e.target.value)}
                                placeholder="London"
                                required
                            />
                            {validationErrors.city && <ErrorText>{validationErrors.city}</ErrorText>}
                        </div>
                        <div className="md:col-span-3">
                            <Label>Country <Required /></Label>
                            <Input
                                icon={Globe}
                                type="text"
                                value={form.country}
                                onChange={(e) => setField('country', e.target.value)}
                                placeholder="United Kingdom"
                                required
                            />
                            {validationErrors.country && <ErrorText>{validationErrors.country}</ErrorText>}
                        </div>
                    </div>
                </Section>

                {/* Child Information */}
                {form.courseFor === 'kid' && (
                    <Section id="children" title="Child Information" subtitle="Add one or more children enrolling"
                        active={current === 'children'}>
                        {children.map((child, index) => (
                            <ChildCard
                                key={child.id}
                                child={child}
                                index={index}
                                onChange={updateChild}
                                onRemove={() => removeChild(child.id)}
                            />
                        ))}
                        <button
                            type="button"
                            onClick={addChild}
                            className="mt-[0.25rem] flex w-full items-center justify-center gap-[0.5rem] rounded-[0.6rem] border-[1px] border-dashed
                                border-[#D4AF37] bg-[#FFFCF5] py-[0.65rem] text-[0.88rem] font-semibold text-[#0B1E36]
                                transition-colors hover:border-solid hover:bg-[#FBF3DF]"
                        >
                            <Plus className="h-[1rem] w-[1rem]" /> Add another child
                        </button>
                        {validationErrors.children && <ErrorText className="mt-[0.5rem]">{validationErrors.children}</ErrorText>}
                    </Section>
                )}

                {/* Trial Class */}
                <Section id="trial" title="Trial Class" subtitle="Pick your preferred date and time"
                    active={current === 'trial'}>
                    <Label>Trial class time <Required /></Label>
                    <div className="relative">
                        <Clock className="pointer-events-none absolute left-[0.8rem] top-1/2 h-[1rem] w-[1rem] -translate-y-1/2 text-[#0B1E36]/40" />
                        <input
                            type="datetime-local"
                            value={form.trialTime}
                            onChange={(e) => setField('trialTime', e.target.value)}
                            required
                            className={`${FIELD} pl-[2.3rem] pr-[0.8rem]`}
                        />
                    </div>
                    {validationErrors.trialTime && <ErrorText>{validationErrors.trialTime}</ErrorText>}
                </Section>
            </div>

            {/* Feedback */}
            {error && (
                <div className="mt-[0.75rem] flex items-center gap-[0.5rem] rounded-[0.6rem] border-[1px] border-red-200 bg-red-50 px-[1rem] py-[0.6rem] text-[0.88rem] font-medium text-red-700">
                    <X className="h-[1rem] w-[1rem] shrink-0" /> {error}
                </div>
            )}
            {success && (
                <div className="mt-[0.75rem] flex items-center gap-[0.5rem] rounded-[0.6rem] border-[1px] border-[#D4AF37]/60 bg-[#FBF3DF] px-[1rem] py-[0.6rem] text-[0.88rem] font-semibold text-[#0B1E36]">
                    ✓ Enrolment submitted successfully! We&apos;ll be in touch soon.
                </div>
            )}

            {/* Back, and Next or (on the last step) Submit */}
            <div className="mt-[0.85rem] flex items-center justify-center gap-[0.75rem]">
                {stepIndex > 0 && (
                    <button
                        type="button"
                        onClick={goBack}
                        className="inline-flex items-center justify-center gap-[0.35rem] rounded-[0.6rem] border-[1px] border-[#E3DED2] bg-white px-[1.25rem] py-[0.72rem]
                            text-[0.92rem] font-bold !text-[#0B1E36] transition-colors hover:border-[#D4AF37] hover:bg-[#FFFCF5]"
                    >
                        <ChevronLeft className="h-[1rem] w-[1rem]" /> Back
                    </button>
                )}
                {isLast ? (
                    <button
                        type="submit"
                        disabled={loading}
                        className={NAVY_BUTTON}
                    >
                        {loading
                            ? <><span className="h-[1rem] w-[1rem] animate-spin rounded-full border-2 border-white/30 border-t-white" /> Submitting...</>
                            : 'Submit enrolment'
                        }
                    </button>
                ) : (
                    <button type="button" onClick={goNext} className={NAVY_BUTTON}>
                        Next <ChevronRight className="h-[1rem] w-[1rem]" />
                    </button>
                )}
            </div>
        </form>
    )
}

export default EnrollNow;
