import React, { useState } from 'react'
import {
    BookOpen,
    User,
    Users,
    Calendar,
    ChevronDown,
    Plus,
    X,
    Send,
    Baby,
    
    
    Phone,
    Mail,
    MapPin,
    Globe,
    Clock,
} from 'lucide-react'


// ── constants ────────────────────────────────────────────────────────────────

const COURSES = ['Quran Arabic Language', 'Islamic Studies', 'Tajweed', 'Hifz Programme']

// ── tiny primitives ──────────────────────────────────────────────────────────

const Label = ({ children }) => (
    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
        {children}
    </label>
)

const Required = () => <span className="text-red-500 ml-0.5">*</span>

const Input = ({ icon: Icon, ...props }) => (
    <div className="relative">
        {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        )}
        <input
            {...props}
            className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 text-sm border border-gray-300 rounded-lg
                bg-white focus:outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/10
                placeholder:text-gray-400 text-gray-900 transition`}
        />
    </div>
)

const Select = ({ children, ...props }) => (
    <div className="relative">
        <select
            {...props}
            className="w-full pl-3 pr-9 py-2.5 text-sm border border-gray-300 rounded-lg bg-white
                appearance-none focus:outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/10
                text-gray-900 transition cursor-pointer"
        >
            {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
)

const RadioBtn = ({ name, value, checked, onChange, Icon, label }) => (
    <label className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-lg border
        text-sm font-semibold cursor-pointer transition select-none
        ${checked
            ? 'bg-green-50 border-green-700 text-green-900'
            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
        }`}>
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
        <Icon className="w-4 h-4" />
        {label}
    </label>
)

const SectionCard = ({ icon: Icon, iconBg = 'bg-green-50', iconColor = 'text-green-800', title, subtitle, children }) => (
    <div className="bg-gray-200 border border-gray-200 rounded-xl p-3 md:p-5 mb-4 shadow">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3 mb-4">
            <div className={`w-11 h-11 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="!leading-5">
                <h6 className="font-bold text-gray-900">{title}</h6>
                <p className="text-gray-500 mt-0.5">{subtitle}</p>
            </div>
        </div>
        {children}
    </div>
)

// ── child card ───────────────────────────────────────────────────────────────

const ChildCard = ({ child, index, onChange, onRemove }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-900 bg-green-100 px-3 py-1 rounded-full">
                <Baby className="w-3 h-3" /> Child {index + 1}
            </span>
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove child ${index + 1}`}
                className="w-7 h-7 rounded-lg border border-gray-300 bg-white flex items-center justify-center
                    text-gray-500 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
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
        </div>
        <div>
            <Label>Gender <Required /></Label>
            <div className="flex gap-2">
                <RadioBtn name={`childGender-${child.id}`} value="male" checked={child.gender === 'male'}
                    onChange={() => onChange(child.id, 'gender', 'male')} Icon={User} label="Male" />
                <RadioBtn name={`childGender-${child.id}`} value="female" checked={child.gender === 'female'}
                    onChange={() => onChange(child.id, 'gender', 'female')} Icon={User} label="Female" />
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

const EnrollNow = () => {
    const [form, setForm] = useState(initialForm)
    const [children, setChildren] = useState([])
    const [childCounter, setChildCounter] = useState(0)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [validationErrors, setValidationErrors] = useState({})

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
            trialTime: form.trialTime,
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
            setForm(initialForm)
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
        <form onSubmit={handleSubmit} className='!z-50'>

            {/* Course Details */}
            <SectionCard icon={BookOpen} title="Course details" subtitle="Choose your course and preferences">
                <div className="mb-4">
                    <Label>Select course <Required /></Label>
                    <Select
                        value={form.course}
                        onChange={(e) => setField('course', e.target.value)}
                        required
                    >
                        {COURSES.map((c) => <option key={c}>{c}</option>)}
                    </Select>
                    {validationErrors.course && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.course}</p>
                    )}
                </div>

                <div className="mb-4">
                    <Label>Course for <Required /></Label>
                    <div className="flex gap-2">
                        <RadioBtn name="courseFor" value="adult" checked={form.courseFor === 'adult'}
                            required onChange={() => handleCourseFor('adult')} Icon={User} label="Adult" />
                        <RadioBtn name="courseFor" value="kid" checked={form.courseFor === 'kid'}
                            required onChange={() => handleCourseFor('kid')} Icon={Baby} label="Kid" />
                    </div>
                    {validationErrors.courseFor && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.courseFor}</p>
                    )}
                </div>

                {form.courseFor === 'adult' && (
                    <div className="mb-4">
                        <Label>Your gender <Required /></Label>
                        <div className="flex gap-2">
                            <RadioBtn
                                name="gender"
                                value="male"
                                checked={form.gender === 'male'}
                                required
                                onChange={() => setField('gender', 'male')} Icon={User} label="Male" />
                            <RadioBtn name="gender" value="female" checked={form.gender === 'female'}
                                required onChange={() => setField('gender', 'female')} Icon={User} label="Female" />
                        </div>
                        {validationErrors.gender && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.gender}</p>
                        )}
                    </div>
                )}

                <div>
                    <Label>Required tutor gender <Required /></Label>
                    <div className="flex gap-2">
                        <RadioBtn name="tutorGender" value="male" checked={form.tutorGender === 'male'}
                            onChange={() => setField('tutorGender', 'male')} Icon={User} label="Male tutor" />
                        <RadioBtn name="tutorGender" value="female" checked={form.tutorGender === 'female'}
                            required onChange={() => setField('tutorGender', 'female')} Icon={User} label="Female tutor" />
                    </div>
                    {validationErrors.tutorGender && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.tutorGender}</p>
                    )}
                </div>
            </SectionCard>

            {/* Parent / Personal Info */}
            <SectionCard
                icon={User}
                title={form.courseFor === 'kid' ? 'Parent information' : 'Information'}
                subtitle="Your personal & contact details"
            >
                <div className="mb-4">
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
                    {validationErrors.fullName && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div>
                        <Label>Email address <Required /></Label>
                        <Input
                            icon={Mail}
                            type="email"
                            value={form.email}
                            onChange={(e) => setField('email', e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                        {validationErrors.email && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                        )}
                    </div>
                    <div>
                        <Label>WhatsApp number <Required /></Label>
                        <Input
                            icon={Phone}
                            type="tel"
                            value={form.whatsapp}
                            onChange={(e) => setField('whatsapp', e.target.value)}
                            placeholder="+44 7000 000000"
                            required
                        />
                        {validationErrors.whatsapp && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.whatsapp}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <Label>City <Required /></Label>
                        <Input
                            icon={MapPin}
                            type="text"
                            value={form.city}
                            onChange={(e) => setField('city', e.target.value)}
                            placeholder="London"
                            required
                        />
                        {validationErrors.city && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
                        )}
                    </div>
                    <div>
                        <Label>Country <Required /></Label>
                        <Input
                            icon={Globe}
                            type="text"
                            value={form.country}
                            onChange={(e) => setField('country', e.target.value)}
                            placeholder="United Kingdom"
                            required
                        />
                        {validationErrors.country && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.country}</p>
                        )}
                    </div>
                </div>
            </SectionCard>

            {/* Child Information */}
            {form.courseFor === 'kid' && (
                <SectionCard icon={Users} title="Child information" subtitle="Add one or more children enrolling">
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
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed
                            border-green-600 rounded-lg text-sm font-semibold text-green-800 bg-green-50
                            hover:bg-green-100 hover:border-solid transition mt-1"
                    >
                        <Plus className="w-4 h-4" /> Add another child
                    </button>
                    {validationErrors.children && (
                        <p className="text-red-500 text-xs mt-2">{validationErrors.children}</p>
                    )}
                </SectionCard>
            )}

            {/* Trial Class */}
            <SectionCard icon={Calendar} title="Trial class" subtitle="Pick your preferred date and time">
                <Label>Trial class time <Required /></Label>
                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        type="datetime-local"
                        value={form.trialTime}
                        onChange={(e) => setField('trialTime', e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white
                            focus:outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/10
                            text-gray-900 transition"
                    />
                </div>
                {validationErrors.trialTime && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.trialTime}</p>
                )}
            </SectionCard>

            {/* Feedback */}
            {error && (
                <div className="flex items-center gap-2 px-4 py-3 mb-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                    <X className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 px-4 py-3 mb-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 font-medium">
                    ✓ Enrolment submitted successfully! We&apos;ll be in touch soon.
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-standard btn-lg submit-btn w-full"
            >
                {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                    : <><Send className="w-4 h-4" /> Submit enrolment</>
                }
            </button>
        </form>
    )
}

export default EnrollNow;
