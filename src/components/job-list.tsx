// src/components/job-list.tsx

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { jobService, QuantumJob } from "@/services/jobService";

interface JobListProps {
  userRole: string;
  jobsLastUpdated: number;
  onTotalJobsChange: (count: number) => void;
}

export default function JobList({
  userRole,
  jobsLastUpdated,
  onTotalJobsChange,
}: JobListProps) {
  const [jobs, setJobs] = useState<QuantumJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [jobsLastUpdated]);

  const fetchJobs = () => {
    setIsLoading(true);
    const allJobs = jobService.getJobs();
    setJobs(allJobs);
    onTotalJobsChange(allJobs.length);
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job ID</TableHead>
            <TableHead>Algorithm</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={6}>
                  <div className="animate-pulse h-8 bg-muted/50 rounded"></div>
                </TableCell>
              </TableRow>
            ))
          ) : jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No jobs found.
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.id}</TableCell>
                <TableCell>{job.algorithm}</TableCell>
                <TableCell>{job.provider}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      job.status === "completed"
                        ? "text-green-400 border-green-400/50"
                        : job.status === "failed"
                        ? "text-red-400 border-red-400/50"
                        : "text-yellow-400 border-yellow-400/50"
                    }
                  >
                    {job.status === "completed" && (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    )}
                    {job.status === "failed" && (
                      <AlertTriangle className="mr-1 h-3 w-3" />
                    )}
                    {job.status === "running" && (
                      <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                    )}
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(job.submittedAt), "PPP p")}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://www.megaexplorer.xyz/tx/${job.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Verify
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </motion.div>
  );
}
