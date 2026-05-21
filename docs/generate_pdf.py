from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER

OUTPUT = "Online_Quran_Academy_LMS_Features.pdf"

PRIMARY = HexColor("#0F766E")
DARK = HexColor("#134E4A")
LIGHT_BG = HexColor("#F0FDFA")
GREY = HexColor("#475569")

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    leftMargin=0.7 * inch,
    rightMargin=0.7 * inch,
    topMargin=0.6 * inch,
    bottomMargin=0.6 * inch,
    title="Online Quran Academy - LMS Features Proposal",
)

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "TitleStyle",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=22,
    textColor=DARK,
    alignment=TA_CENTER,
    spaceAfter=4,
)
subtitle_style = ParagraphStyle(
    "Subtitle",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=12,
    textColor=GREY,
    alignment=TA_CENTER,
    spaceAfter=18,
)
section_style = ParagraphStyle(
    "Section",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=14,
    textColor=white,
    backColor=PRIMARY,
    borderPadding=(6, 8, 6, 8),
    leading=18,
    spaceBefore=14,
    spaceAfter=8,
)
bullet_style = ParagraphStyle(
    "Bullet",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=10.5,
    leading=15,
    leftIndent=14,
    bulletIndent=4,
    textColor=black,
    spaceAfter=2,
)
note_style = ParagraphStyle(
    "Note",
    parent=styles["Normal"],
    fontName="Helvetica-Oblique",
    fontSize=10,
    textColor=GREY,
    alignment=TA_CENTER,
    spaceBefore=20,
)

story = []

story.append(Paragraph("Online Quran Academy", title_style))
story.append(Paragraph("Learning Management System (LMS) - Features Proposal", subtitle_style))

sections = [
    ("1. Authentication & User Roles", [
        "Admin, Teacher (Qari/Qariya), Student, and Parent roles",
        "Admin has full control - can remove or suspend any Teacher or Student anytime",
        "Email/Phone signup with OTP verification",
        "Google login support",
        "Role-based dashboards",
        "Password reset & account recovery",
    ]),
    ("2. Student Portal", [
        "Personal profile & learning history",
        "Course enrollment & schedule view",
        "Progress tracking (Sabaq, Sabqi, Manzil)",
        "Attendance record",
        "Assignments & homework submission",
        "Class recordings access",
        "Certificate download",
        "In-app notifications",
    ]),
    ("3. Teacher (Qari) Portal", [
        "Class scheduling & calendar",
        "Assigned students management",
        "Lesson planning",
        "Attendance marking",
        "Progress reports per student",
        "Leave / availability management",
        "Built-in Quran Reader (Arabic + Translation)",
        "Audio recitations (multiple Qaris)",
        "Bookmark verses",
        "Hifz tracker (Para / Surah / Ayah level)",
        "Daily Sabaq audio submission review",
        "Tajweed rules with colored highlighting",
    ]),
    ("4. Parent Portal", [
        "Child's progress monitoring",
        "Attendance reports",
        "In-app communication with Admin",
        "Fee history & payments",
        "Class recordings access",
    ]),
    ("5. Course Management", [
        "Nazra (Quran Reading)",
        "Noorani Qaida (for kids)",
        "Tajweed with audio examples",
        "Hifz (Memorization) tracking",
        "Tafseer & Translation",
        "Arabic Language",
        "Islamic Studies / Duas / Hadith",
        "Course levels: Beginner / Intermediate / Advanced",
        "Free trial classes",
    ]),
    ("6. Live Class System", [
        "Zoom / Agora / Jitsi integration",
        "1-on-1 sessions (standard for Quran academies)",
        "Group classes option",
        "Class recording & replay",
        "In-class chat",
        "Screen sharing",
    ]),
    ("7. Scheduling System", [
        "Time zone support (USA, UK, AUS, UAE students)",
        "Recurring class scheduling",
        "Reschedule / cancel requests",
        "Google Calendar sync",
        "Email reminders",
    ]),
    ("8. Payment & Fee Management", [
        "Stripe / PayPal (international students)",
        "Monthly subscription plans",
        "Family discounts (multiple kids)",
        "Invoice generation",
        "Refund management",
    ]),
    ("9. Admin Panel", [
        "Dashboard with analytics (students, teachers, revenue)",
        "Teacher approval & verification",
        "Course CRUD operations",
        "Fee structure management",
        "Financial / Attendance / Performance reports",
        "Email broadcasting",
        "Coupon & discount management",
    ]),
    ("10. In-App Communication", [
        "Student to Teacher messaging",
        "Email notifications",
        "Announcement board",
        "Class reminders",
    ]),
    ("11. Mobile Responsive", [
        "Fully mobile-friendly website",
        "PWA support (app-like feel without a separate mobile app)",
    ]),
    ("12. Reviews & Ratings", [
        "Teacher ratings by students / parents",
        "Course reviews",
        "Testimonials on public site",
    ]),
    ("13. Public Marketing Website", [
        "Landing page",
        "About us",
        "Courses with pricing",
        "Free trial signup form",
        "Blog (SEO optimized)",
        "Contact form",
    ]),
]

for title, items in sections:
    story.append(Paragraph(title, section_style))
    for it in items:
        story.append(Paragraph(f"&bull;&nbsp;&nbsp;{it}", bullet_style))

story.append(Paragraph("Prepared for review and approval.", note_style))

doc.build(story)
print(f"PDF generated: {OUTPUT}")
