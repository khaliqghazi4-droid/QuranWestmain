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
