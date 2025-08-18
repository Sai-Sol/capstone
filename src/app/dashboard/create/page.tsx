"use client";

import JobSubmissionForm from "@/components/job-submission-form";
import { useState } from "react";
import { motion } from "framer-motion";

export default function CreatePage() {
  const [jobsLastUpdated, setJobsLastUpdated] = useState(Date.now());

  const handleJobLogged = () => {
    setJobsLastUpdated(Date.now());
  };

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          🧪 Quantum Computing Lab
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Run real quantum algorithms on Google, IBM, and Amazon quantum computers. All results are permanently verified on the blockchain!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <JobSubmissionForm onJobLogged={handleJobLogged} />
      </motion.div>
    </div>
  );
}