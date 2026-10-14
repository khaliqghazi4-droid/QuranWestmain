import Link from "next/link";
import {
  FaArrowRight,
  FaClock,
  FaGraduationCap,
  FaLanguage,
  FaUser,
} from "react-icons/fa";
import { getInstructorById } from "@/app/(pages)/instructors/data";

// "Meet Our Qualified Quran Teachers" cards. Name, photo and experience come
// from the Instructors page data so they match the teacher's profile. Set
// here: the subjects (from their role and qualifications), the languages, and
// a short qualification label so the cards stay the same height (the full
// qualification is on the profile page).
export const teacherCards = [
  {
    id: "sheikh-abdullah-rashid",
    teaches: ["Quran Recitation", "Tajweed"],
    qualification: "Ijazah in Hafs (Asim)",
    languages: "English, Urdu, Arabic",
  },
  {
    id: "ustadha-aisha-siddiqui",
    teaches: ["Fiqh", "Seerah", "Aqeedah"],
    qualification: "B.A. Islamic Studies, Madinah",
    languages: "English, Urdu, Arabic",
  },
  {
    id: "sheikh-muhammad-ibrahim",
    teaches: ["Hifz", "Hifz for Kids"],
    qualification: "Hafiz with Ijazah (Sanad)",
    languages: "English, Urdu, Arabic",
  },
].map(({ id, teaches, qualification, languages }) => {
  const teacher = getInstructorById(id);
  return {
    photo: teacher.image,
    name: teacher.name,
    teaches,
    qualification,
    experience: `${teacher.experience.toLowerCase()} teaching`,
    languages,
    profileHref: `/instructors/${id}`,
  };
});

// One teacher card: a navy band with the photo across its bottom edge, the
// subjects, then qualification, experience and languages. `compact` tightens
// the spacing so three cards fit one laptop screen on the home page.
export function TeacherCard({ t, compact = false }) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[20px] border-[1px] border-solid border-[#0B1A37]/10 bg-white shadow-[0_10px_30px_rgba(11,26,55,0.08)] transition-all duration-300 hover:-translate-y-[4px] hover:border-[#EECC65]">
      {/* Navy band; the photo sits across its bottom edge */}
      <div className={`relative shrink-0 bg-[#0B1A37] ${compact ? "h-[72px]" : "h-[92px]"}`}>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(238,204,101,0.22),transparent_70%)]"
        />
        <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2">
          {t.photo ? (
            <img
              src={t.photo}
              alt={`${t.name}, ${t.teaches.join(" and ")} teacher at Quran West`}
              className={`block rounded-full border-[4px] border-solid border-white bg-[#F4EEE3] object-cover object-top shadow-[0_0_0_3px_#EECC65] ${
                compact ? "h-[92px] w-[92px]" : "h-[108px] w-[108px]"
              }`}
            />
          ) : (
            <span
              className={`grid place-items-center rounded-full border-[4px] border-solid border-white bg-[#F4EEE3] text-[#0B1A37]/25 shadow-[0_0_0_3px_#EECC65] ${
                compact ? "h-[92px] w-[92px]" : "h-[108px] w-[108px]"
              }`}
            >
              <FaUser className="h-[42px] w-[42px]" aria-hidden="true" />
            </span>
          )}
        </div>
      </div>

      <div className={`flex flex-1 flex-col px-[22px] ${compact ? "pb-[18px] pt-[58px]" : "pb-[22px] pt-[70px]"}`}>
        <h3 className="!m-0 text-center !text-[20px] !leading-snug !font-bold !text-[#0B1A37]">
          {t.name}
        </h3>

        {/* Teaches */}
        <div className={`flex flex-wrap justify-center gap-[6px] ${compact ? "mt-[10px]" : "mt-[12px]"}`}>
          {t.teaches.map((subject) => (
            <span
              key={subject}
              className="rounded-full bg-[#EECC65]/25 px-[12px] py-[4px] text-[12px] font-semibold text-[#6f5419]"
            >
              {subject}
            </span>
          ))}
        </div>

        <div
          aria-hidden="true"
          className={`h-[1px] bg-[#0B1A37]/10 ${compact ? "my-[14px]" : "my-[18px]"}`}
        />

        <dl className={`!m-0 flex flex-col ${compact ? "gap-[9px]" : "gap-[12px]"}`}>
          {[
            [FaGraduationCap, "Qualification", t.qualification],
            [FaClock, "Experience", t.experience],
            [FaLanguage, "Languages", t.languages],
          ].map(([Icon, label, value]) => (
            <div key={label} className="flex items-start gap-[12px]">
              <span className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-full bg-[#0B1A37]/[0.06] text-[#9B7930]">
                <Icon className="h-[15px] w-[15px]" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0B1A37]/50">
                  {label}
                </dt>
                <dd className="!m-0 text-[15px] leading-snug text-[#0B1A37]">
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <div className={`mt-auto ${compact ? "pt-[16px]" : "pt-[22px]"}`}>
          <Link
            href={t.profileHref}
            className="flex items-center justify-center gap-[8px] rounded-full border-[1px] border-solid border-[#0B1A37]/15 px-[16px] py-[10px] text-[14px] font-semibold !text-[#0B1A37] !no-underline transition-colors hover:border-[#EECC65] hover:bg-[#EECC65]"
          >
            View profile
            <FaArrowRight
              className="h-[12px] w-[12px] transition-transform group-hover:translate-x-[3px]"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
