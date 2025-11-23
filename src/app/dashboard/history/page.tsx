
"use client";
import { motion } from "framer-motion";
import JobList from "@/components/job-list";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function HistoryPage() {
    const { user } = useAuth();
    const [jobsLastUpdated, setJobsLastUpdated] = useState(Date.now());
    const [totalJobs, setTotalJobs] = useState(0);

    if (!user) return null;

    const handleRefresh = () => {
      setJobsLastUpdated(Date.now());
    }

    return (
        <div className="space-y-8 p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
            >
                <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                    📚 Quantum Job History
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Track all your quantum experiments with blockchain-verified results and detailed execution metrics. You have submitted {totalJobs} jobs.
                </p>
            </motion.div>

            <div className="flex justify-center">
              <Button onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh History
              </Button>
            </div>
            
            <JobList 
                userRole={user.role} 
                jobsLastUpdated={jobsLastUpdated}
                onTotalJobsChange={setTotalJobs} 
            />
        </div>
    );
}
