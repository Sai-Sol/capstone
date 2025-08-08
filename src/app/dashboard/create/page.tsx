"use client";

import JobSubmissionForm from "@/components/job-submission-form";
import JobList from "@/components/job-list";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, History, Zap } from "lucide-react";

export default function CreateJobPage() {
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
                    Quantum Lab
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Execute quantum algorithms and secure results on blockchain
                </p>
            </motion.div>

            <Tabs defaultValue="submit" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/30 h-14">
                    <TabsTrigger 
                        value="submit" 
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 text-base"
                    >
                        <Terminal className="h-5 w-5" />
                        Submit Job
                    </TabsTrigger>
                    <TabsTrigger 
                        value="history" 
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 text-base"
                    >
                        <History className="h-5 w-5" />
                        Job History
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="submit" className="mt-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <JobSubmissionForm onJobLogged={handleJobLogged} />
                    </motion.div>
                </TabsContent>
                
                <TabsContent value="history" className="mt-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <JobList 
                            userRole="user" 
                            jobsLastUpdated={jobsLastUpdated} 
                            onTotalJobsChange={() => {}} 
                        />
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    );
}