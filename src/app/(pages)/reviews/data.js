// Content for the Reviews page. Everything here is placeholder content for the
// layout ([..] and `sample: true`, which shows a "Sample" tag on the card).
// Replace it with real reviews only: the family's own words, word for word,
// with written consent and proof saved (see the testimonials content brief).
// Never show a child's face or full name; use the parent's first name and
// initial.

// Your Google Business Profile reviews page (rating badge, "Read our Google
// reviews" and "Leave a review" links)
export const GOOGLE_REVIEWS_URL = "#";
// e.g. { score: "4.9", count: 60 }. Leave null until you have real Google
// reviews: the rating badge stays hidden while this is null.
export const GOOGLE_RATING = null;
// Your Trustpilot page. The Trustpilot button stays hidden while this is null.
export const TRUSTPILOT_URL = null;
// Only regions you have real reviews from
export const TRUST_REGIONS = "[the UK and Canada]";

// Course each review is about: shown in its details and linked under it
export const COURSES = {
  qaida: { label: "Noorani Qaida", page: "Quran Reading", href: "/coursesGrid/quran-reading-nazra" },
  tajweed: { label: "Tajweed", page: "Tajweed", href: "/coursesGrid/tajweed-mastery" },
  hifz: { label: "Hifz", page: "Hifz", href: "/coursesGrid/quran-memorization" },
};

const SHORT = "[The parent’s own words, word for word. Two sentences.]";
const MEDIUM =
  "[The review exactly as the family wrote it on Google or WhatsApp. Fix spelling only with their agreement. Keep it to 2 to 5 sentences.]";
const LONG =
  "[The family’s own words, copied word for word with their permission. A longer review might say what their child has learnt, what the teacher is like and how lessons fit around school and work. Up to 5 sentences.]";

// Video reviews: 30 to 60 seconds, filmed by the parent on a phone. Set
// `youtubeId` (an unlisted video is fine, with captions on) to show the video.
export const videoReviews = [
  {
    sample: true,
    youtubeId: null,
    name: "[Amina R.]",
    role: "Parent",
    city: "[Watford]",
    country: "UK",
    course: "qaida",
    months: "[6]",
    summary: "[One line they said in the video, in their own words.]",
  },
  {
    sample: true,
    youtubeId: null,
    name: "[Bilal H.]",
    role: "Adult student",
    city: "[Toronto]",
    country: "Canada",
    course: "tajweed",
    months: "[9]",
    summary: "[One line they said in the video, in their own words.]",
  },
  {
    sample: true,
    youtubeId: null,
    name: "[Sana M.]",
    role: "Parent",
    city: "[Manchester]",
    country: "UK",
    course: "hifz",
    months: "[14]",
    summary: "[One line they said in the video, in their own words.]",
  },
];

// Written reviews, newest first. `audience` (kids / adults) and `course` drive
// the filters; a filter shows only when 2 or more reviews match it.
export const writtenReviews = [
  { sample: true, stars: 5, text: MEDIUM, name: "[Sara A.]", role: "Parent", city: "[Birmingham]", country: "UK", course: "qaida", audience: "kids", months: "[8]", date: "[March 2026]" },
  { sample: true, stars: 5, text: LONG, name: "[Yusuf K.]", role: "Parent", city: "[Luton]", country: "UK", course: "hifz", audience: "kids", months: "[14]", date: "[March 2026]" },
  { sample: true, stars: 5, text: SHORT, name: "[Hina S.]", role: "Adult student", city: "[Toronto]", country: "Canada", course: "tajweed", audience: "adults", months: "[5]", date: "[February 2026]" },
  { sample: true, stars: 4, text: MEDIUM, name: "[Imran Q.]", role: "Parent", city: "[Watford]", country: "UK", course: "tajweed", audience: "kids", months: "[7]", date: "[February 2026]" },
  { sample: true, stars: 5, text: SHORT, name: "[Maryam T.]", role: "Parent", city: "[Mississauga]", country: "Canada", course: "qaida", audience: "kids", months: "[4]", date: "[January 2026]" },
  { sample: true, stars: 5, text: LONG, name: "[Adeel N.]", role: "Adult student", city: "[Manchester]", country: "UK", course: "qaida", audience: "adults", months: "[10]", date: "[January 2026]" },
  { sample: true, stars: 5, text: MEDIUM, name: "[Fatima Z.]", role: "Parent", city: "[Leicester]", country: "UK", course: "hifz", audience: "kids", months: "[18]", date: "[December 2025]" },
  { sample: true, stars: 4, text: SHORT, name: "[Omar D.]", role: "Parent", city: "[Calgary]", country: "Canada", course: "tajweed", audience: "kids", months: "[6]", date: "[December 2025]" },
  { sample: true, stars: 5, text: MEDIUM, name: "[Ruqayyah B.]", role: "Adult student", city: "[London]", country: "UK", course: "tajweed", audience: "adults", months: "[8]", date: "[November 2025]" },
  { sample: true, stars: 5, text: LONG, name: "[Khalid M.]", role: "Parent", city: "[Bradford]", country: "UK", course: "qaida", audience: "kids", months: "[5]", date: "[November 2025]" },
  { sample: true, stars: 5, text: SHORT, name: "[Zainab F.]", role: "Parent", city: "[Ottawa]", country: "Canada", course: "hifz", audience: "kids", months: "[20]", date: "[October 2025]" },
  { sample: true, stars: 4, text: MEDIUM, name: "[Hamza I.]", role: "Adult student", city: "[Slough]", country: "UK", course: "hifz", audience: "adults", months: "[12]", date: "[October 2025]" },
];

// Longer stories (150 to 250 words each), written from an interview with the
// family and approved by them before publishing
export const studentStories = [
  {
    sample: true,
    title: "[Name]’s journey: from [the Arabic letters] to [reading Surah Yasin]",
    name: "[Name]",
    role: "Parent",
    city: "[Luton]",
    country: "UK",
    course: "qaida",
    months: "[10]",
    before:
      "[Where they started and what was hard: mosque timings that clashed with school, or an earlier academy that did not work out.]",
    why: "[What made them choose Quran West, in their own words.]",
    teacher: "[What their teacher is like, and what difference that made to their child.]",
    now: "[What they can do now. Only real, checked results.]",
    quote: "[One line from the family to end the story.]",
  },
  {
    sample: true,
    title: "[Name]’s journey: from [hesitant reading] to [confident Tajweed]",
    name: "[Name]",
    role: "Adult student",
    city: "[Toronto]",
    country: "Canada",
    course: "tajweed",
    months: "[9]",
    before: "[Where they started and what was hard about finding lessons around work and family.]",
    why: "[What made them choose Quran West, in their own words.]",
    teacher: "[What their teacher is like, and what difference that made to their learning.]",
    now: "[What they can do now. Only real, checked results.]",
    quote: "[One line from the student to end the story.]",
  },
];
