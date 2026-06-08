import { MongoClient } from "mongodb";

// Reads enrollment submissions from the public website's MongoDB Atlas
// (the developer's "Enroll Now" form writes to the `enrollments` collection).
const uri = process.env.ENROLL_MONGO_URI;
const dbName = process.env.ENROLL_MONGO_DB || "test";

// Cache the client across hot reloads / serverless invocations.
const globalForMongo = globalThis as unknown as {
  enrollMongo?: Promise<MongoClient>;
};

function getClient(): Promise<MongoClient> {
  if (!uri) throw new Error("ENROLL_MONGO_URI is not configured");
  if (!globalForMongo.enrollMongo) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
    globalForMongo.enrollMongo = client.connect();
  }
  return globalForMongo.enrollMongo;
}

// Lightweight ping used by /api/health to keep the Atlas connection warm.
export async function pingEnrollDb(): Promise<boolean> {
  try {
    const client = await getClient();
    await client.db(dbName).command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

export type EnrollChild = {
  name: string;
  age: number | null;
  gender: "male" | "female" | null;
};

export type WebsiteEnrollment = {
  id: string;
  course: string;
  courseFor: "adult" | "kid";
  tutorGender: "male" | "female" | null;
  gender: "male" | "female" | null;
  fullName: string;
  email: string;
  whatsapp: string;
  city: string;
  country: string;
  trialTime: string | null;
  children: EnrollChild[];
  createdAt: string | null;
};

// Shape the website form posts into MongoDB. We mirror it exactly when a
// signed-in student submits the in-app enrollment form so the admin's
// existing /app/admin/enrollments review flow keeps working with no
// changes — the request shows up in the same list either way.
export type EnrollSubmission = {
  course: string;            // course name (matches a row in our Postgres `courses` table)
  courseFor: "adult" | "kid";
  gender: "male" | "female" | null;
  tutorGender: "male" | "female" | null;
  fullName: string;
  email: string;
  whatsapp: string;
  city: string;
  country: string;
  trialTime: string | null;  // ISO timestamp the student picked, optional
  children: EnrollChild[];
  source: "website" | "dashboard"; // so admin can tell where it came from
};

export async function submitWebsiteEnrollment(
  payload: EnrollSubmission
): Promise<{ id: string }> {
  const client = await getClient();
  const result = await client
    .db(dbName)
    .collection("enrollments")
    .insertOne({
      ...payload,
      // `trialTime` is stored as a real Date object in the website's own
      // submissions; preserve that shape so existing admin code that reads
      // it back doesn't have to special-case our submissions.
      trialTime: payload.trialTime ? new Date(payload.trialTime) : null,
      createdAt: new Date(),
    });
  return { id: String(result.insertedId) };
}

export async function getWebsiteEnrollments(): Promise<WebsiteEnrollment[]> {
  const client = await getClient();
  const docs = await client
    .db(dbName)
    .collection("enrollments")
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((d) => ({
    id: String(d._id),
    course: typeof d.course === "string" ? d.course : "",
    courseFor: d.courseFor === "kid" ? "kid" : "adult",
    tutorGender: d.tutorGender === "female" ? "female" : d.tutorGender === "male" ? "male" : null,
    gender: d.gender === "female" ? "female" : d.gender === "male" ? "male" : null,
    fullName: typeof d.fullName === "string" ? d.fullName : "",
    email: typeof d.email === "string" ? d.email : "",
    whatsapp: typeof d.whatsapp === "string" ? d.whatsapp : "",
    city: typeof d.city === "string" ? d.city : "",
    country: typeof d.country === "string" ? d.country : "",
    trialTime: d.trialTime ? new Date(d.trialTime).toISOString() : null,
    children: Array.isArray(d.children)
      ? d.children.map((ch: { name?: unknown; age?: unknown; gender?: unknown }) => ({
          name: typeof ch.name === "string" ? ch.name : "",
          age: typeof ch.age === "number" ? ch.age : null,
          gender: ch.gender === "female" ? "female" : ch.gender === "male" ? "male" : null,
        }))
      : [],
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
  }));
}
