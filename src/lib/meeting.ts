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

// Free-trial Jitsi room: the teacher's in-app class and the link sent to the student both use it
export function trialRoomName(requestId: string): string {
  return `OnlineQuranAcademy-trial-${requestId.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 64)}`;
}

export function trialMeetingLink(requestId: string): string {
  return `https://meet.jit.si/${trialRoomName(requestId)}`;
}
