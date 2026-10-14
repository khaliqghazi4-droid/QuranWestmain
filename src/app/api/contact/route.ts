import { NextResponse } from "next/server";
import { trimStr } from "@/lib/enroll-source";
import { sendContactEnquiryEmails } from "@/lib/email";

const ENQUIRY_TYPES = [
  "Book a free trial",
  "Prices",
  "Course question",
  "Current student help",
  "Something else",
];
const LEARNERS = ["My child", "Myself", "Both"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/contact — the Contact page's "Send Us a Message" form. Emails the
// enquiry to info@quranwest.com and sends the family an automatic reply.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  // Spam trap: a field people never see. Bots that fill it get a normal
  // "sent" reply so they don't try again, but nothing is sent.
  if (trimStr(body.website)) {
    return NextResponse.json({ message: "Sent." }, { status: 200 });
  }

  const enquiry = {
    firstName: trimStr(body.firstName, 80),
    lastName: trimStr(body.lastName, 80),
    whatsapp: trimStr(body.whatsapp, 40),
    email: trimStr(body.email, 200).toLowerCase(),
    country: trimStr(body.country, 40),
    enquiry: trimStr(body.enquiry, 60),
    learner: trimStr(body.learner, 20),
    preferredTime: trimStr(body.preferredTime, 120),
    message: trimStr(body.message, 3000),
    updates: body.updates === true,
  };

  if (!enquiry.firstName) {
    return NextResponse.json({ message: "Please tell us your first name." }, { status: 400 });
  }
  if (!enquiry.whatsapp && !enquiry.email) {
    return NextResponse.json(
      { message: "Please add a WhatsApp number or email so we can reply." },
      { status: 400 },
    );
  }
  if (enquiry.email && !EMAIL_RE.test(enquiry.email)) {
    return NextResponse.json(
      { message: "Please check your email address, e.g. name@email.com." },
      { status: 400 },
    );
  }
  if (!ENQUIRY_TYPES.includes(enquiry.enquiry)) {
    return NextResponse.json({ message: "Please choose what we can help with." }, { status: 400 });
  }
  if (enquiry.learner && !LEARNERS.includes(enquiry.learner)) enquiry.learner = "";

  const result = await sendContactEnquiryEmails(enquiry);
  if (!result.sent) {
    return NextResponse.json(
      { message: "Sorry, your message didn't send. Please try again or message us on WhatsApp." },
      { status: 502 },
    );
  }
  return NextResponse.json({ message: "Sent." }, { status: 200 });
}
