// One persistent meeting link per course.
// If the admin set a custom link (Zoom/Google Meet), use it.
// Otherwise generate a stable Jitsi Meet room from the course slug — it opens
// instantly in the browser with no account or setup required.
export function courseMeetingLink(course: {
  meetingUrl?: string | null;
  slug: string;
}): string {
  const custom = course.meetingUrl?.trim();
  if (custom) return custom;
  return `https://meet.jit.si/OnlineQuranAcademy-${course.slug}`;
}
