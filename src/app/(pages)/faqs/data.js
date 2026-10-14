import {
    FaBookOpen,
    FaHeadset,
    FaPlayCircle,
    FaPoundSign,
    FaShieldAlt,
} from "react-icons/fa";

export const EMAIL = "info@quranwest.com";

// ─── FAQ Groups (the main page) ──────────────────────────────────────────────
// Copied word for word from the content brief. [..] are facts still to
// confirm. `link` is shown under the answer: { label, href }, or
// { label, trial: true } to open the free-trial form.
export const faqGroups = [
    {
        id: "getting-started",
        nav: "Getting Started",
        title: "Getting Started",
        Icon: FaPlayCircle,
        items: [
            {
                q: "How do online Quran classes work?",
                a: "Your child (or you) joins a live, one-to-one video lesson with the same qualified teacher each week. The teacher listens, corrects and guides in real time, just like a lesson in person.",
                link: { label: "How it works", href: "/about#how-it-works" },
            },
            {
                q: "Do you offer a free trial class?",
                a: "Yes. Your first lesson is a free [30]-minute trial. You meet your teacher, they check your level and suggest a plan. There is no payment and no commitment.",
                link: { label: "Book a free trial", trial: true },
            },
            {
                q: "Which countries do you teach?",
                a: "We teach families in the UK, USA, Canada, Europe and Australia. Every lesson is booked in your own local time, with weekday and weekend slots.",
            },
            {
                q: "Can adults learn Quran online?",
                a: "Yes. Many of our students are adults, from complete beginners learning the Arabic letters to those polishing their Tajweed. Lessons go at your pace and fit around work.",
                link: { label: "Adult courses", href: "/coursesGrid" },
            },
            {
                q: "Is online Quran learning good for kids?",
                a: "Yes, when the lessons are one-to-one and the teacher is consistent. Your child gets full attention, learns at home with no travel, and you can watch their progress. Short, regular lessons work best for young children.",
            },
            {
                q: "What do I need to join a class?",
                a: "A laptop, tablet or phone with a camera, a stable internet connection, and [Zoom/Google Meet] installed. Headphones help young children focus. You do not need to buy any books — your teacher shares everything on screen.",
            },
            {
                q: "How do I enrol?",
                a: "Book a free trial, choose a plan after the lesson, and we fix a regular weekly time with your teacher. Most students start within [a week].",
                link: { label: "Book a free trial", trial: true },
            },
        ],
    },
    {
        id: "teachers-safety",
        nav: "Teachers & Safety",
        title: "Teachers & Child Safety",
        Icon: FaShieldAlt,
        items: [
            {
                q: "Are your Quran teachers qualified?",
                a: "Yes. Every teacher holds a recognised qualification, such as an Ijazah in Quran recitation, and has at least [X] years of teaching experience. We check each qualification before a teacher joins.",
                link: { label: "Meet our teachers", href: "/instructors" },
            },
            {
                q: "Where do your teachers teach from?",
                a: "Our teachers are based in Pakistan and teach onsite at Quran West's own teaching centre — never from home. Every classroom is quiet and free from noise or interruptions, and our management team observes lessons in person.",
            },
            {
                q: "Are female Quran teachers available?",
                a: "Yes. You can ask for a female teacher for your daughter, your son or yourself when you book your free trial.",
                link: { label: "Meet our female teachers", href: "/instructors" },
            },
            {
                q: "How do you check your teachers?",
                a: "We verify every teacher's qualifications, test their recitation and Tajweed, and run [background/police character checks — confirm]. New teachers are observed by management before they teach on their own.",
            },
            {
                q: "Are online Quran classes safe for kids?",
                a: "Yes. Teachers are checked before they join and teach from our supervised centre. Lessons use private links that only your family receives, and parents are welcome to sit in on any lesson.",
            },
            {
                q: "Can I watch my child's lesson?",
                a: "Yes, always. You can sit beside your child or join from another room. Many parents watch the first few lessons, then check in from time to time.",
            },
            {
                // Link to the privacy policy once that page exists
                q: "How do you protect my family's data?",
                a: "Your details are stored securely and seen only by the staff who need them. Lesson links are private, and we never share or sell your information. [Teachers cannot use personal phones or storage in class — confirm].",
            },
        ],
    },
    {
        id: "classes-courses",
        nav: "Classes & Courses",
        title: "Classes & Courses",
        Icon: FaBookOpen,
        items: [
            {
                q: "What age should a child start learning Quran?",
                a: "Most children are ready at 4 or 5, once they can sit and focus for 15 to 20 minutes. We teach children from age [4/5]. Younger children start with short Noorani Qaida lessons.",
                link: { label: "Noorani Qaida course", href: "/coursesGrid/quran-reading-nazra" },
            },
            {
                q: "Which courses do you offer?",
                a: "Noorani Qaida for beginners, Quran reading with Tajweed, Hifz (memorisation) and Islamic studies, for children and adults. [Arabic language — confirm if offered].",
                link: { label: "See all courses", href: "/coursesGrid" },
            },
            {
                q: "How long is each class?",
                a: "Lessons are [30, 45 or 60] minutes. Most young children do best with 30 minutes; older children and adults often choose 45 or 60.",
                link: { label: "See plans", href: "/pricing" },
            },
            {
                q: "How many classes a week should my child take?",
                a: "We suggest at least [3] lessons a week for steady progress. Hifz students usually need [5]. Your teacher will recommend a plan after the free trial.",
            },
            {
                q: "How long does a Tajweed course take?",
                a: "Most students finish Noorani Qaida in [3 to 6] months, then learn to read the Quran fluently with Tajweed in a further [6 to 12] months. It depends on age, lessons per week and practice at home.",
                link: { label: "Tajweed course", href: "/coursesGrid/tajweed-mastery" },
            },
            {
                q: "How long does it take to memorise the Quran?",
                a: "Full Hifz usually takes [2 to 5] years with daily lessons and home revision. Some students go faster, others slower. We focus on strong, lasting memorisation rather than speed.",
                link: { label: "Hifz course", href: "/coursesGrid/quran-memorization" },
            },
            {
                // Link to the class policy once that page exists
                q: "What if we miss a class?",
                a: "Let us know at least [24 hours] before, and we will rebook the lesson at no cost. Lessons missed without notice cannot be made up.",
            },
            {
                q: "What happens when the clocks change?",
                a: "The UK, USA, Europe and Australia change their clocks on different dates. We adjust your lesson time automatically and message you the week before, so your child keeps the same local time.",
            },
            {
                q: "How will I know my child is making progress?",
                a: "Your teacher sends a short progress update every [month], and you can ask for a call with them at any time. Students receive a certificate when they finish each course.",
            },
        ],
    },
    {
        id: "prices-payments",
        nav: "Prices & Payments",
        title: "Prices & Payments",
        Icon: FaPoundSign,
        items: [
            {
                q: "How much do online Quran classes cost?",
                a: "Plans start from £[12] per hour, depending on lesson length and how many lessons you take each week. You pay monthly, with no long contract.",
                link: { label: "See full pricing", href: "/pricing" },
            },
            {
                q: "Which currencies do you accept?",
                a: "We charge in GBP, USD, CAD, EUR and [AUD], so you pay in your own currency with no surprise conversion fees.",
            },
            {
                q: "How can I pay?",
                a: "By debit or credit card, [PayPal] or [bank transfer]. Payments are taken monthly in advance through a secure payment system.",
            },
            {
                q: "Do you offer sibling or family discounts?",
                a: "[Yes — [X]% off for each additional child / confirm or delete this question.]",
                link: { label: "See family plans", href: "/pricing" },
            },
            {
                // Link to the refund policy once that page exists
                q: "Can I cancel or get a refund?",
                a: "You can cancel at any time with [30] days' notice. If you are not happy, you can request a refund within [X] days of payment for any unused lessons.",
            },
        ],
    },
    {
        id: "support",
        nav: "Support",
        title: "Support",
        Icon: FaHeadset,
        items: [
            {
                q: "How can I contact Quran West?",
                a: `Message us on WhatsApp at +44 7508 803086, email ${EMAIL}, or call +44 7508 803086. Our UK team replies within [a few hours] during office hours, [Mon–Sat, 9am–9pm UK time].`,
            },
            {
                q: "Can I change my teacher or lesson time?",
                a: "Yes. If the fit is not right or your schedule changes, message us and we will arrange a new teacher or time, usually within [a week].",
            },
            {
                q: "What if there is a technical problem during a lesson?",
                a: "If the call drops, rejoin the same private link. If the lesson cannot continue because of a problem on our side, we rebook it at no cost.",
            },
        ],
    },
];
