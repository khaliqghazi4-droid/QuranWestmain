"use client";

import { useState } from "react";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import EnrollModal from "@/components/enroll-modal";
import LearningRoadmap from "@/components/courses/learning-roadmap";

// All courses, as the steps of a roadmap. Enroll Now on a step
// opens the free-trial form with that course already picked.
const Page = () => {
  const [enrollCourse, setEnrollCourse] = useState(null);

  return (
    <>
      <Header />
      <main className="page-content">
        <LearningRoadmap onEnroll={setEnrollCourse} />
      </main>
      <Footer />
      <EnrollModal
        open={!!enrollCourse}
        onClose={() => setEnrollCourse(null)}
        defaultCourse={enrollCourse ? (enrollCourse.enrollCourse ?? enrollCourse.title) : undefined}
      />
    </>
  );
};

export default Page;
