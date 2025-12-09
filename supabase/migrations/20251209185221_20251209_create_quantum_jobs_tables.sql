/*
  # Create Quantum Jobs Management Tables

  1. New Tables
    - `quantum_jobs` - Store all quantum job submissions
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `job_type` (text, algorithm/circuit type)
      - `provider` (text, quantum provider used)
      - `priority` (text, low/medium/high)
      - `submission_type` (text, prompt/qasm/preset)
      - `description` (text, job description or code)
      - `qasm_code` (text, actual QASM code)
      - `status` (text, submitted/running/completed/failed)
      - `progress` (integer, 0-100)
      - `results` (jsonb, execution results)
      - `error_message` (text, error details if failed)
      - `execution_time_ms` (float, execution duration)
      - `metrics` (jsonb, fidelity, depth, gates used)
      - `submitted_at` (timestamp)
      - `started_at` (timestamp)
      - `completed_at` (timestamp)
      - `metadata` (jsonb, additional data)

    - `job_executions` - Track execution history
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to quantum_jobs)
      - `attempt` (integer, retry attempt number)
      - `execution_time_ms` (float)
      - `fidelity` (float)
      - `circuit_depth` (integer)
      - `gate_count` (integer)
      - `measurements` (jsonb, measurement results)
      - `status` (text, success/failure)
      - `error` (text)
      - `created_at` (timestamp)

    - `job_templates` - Store reusable job templates
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `description` (text)
      - `job_type` (text)
      - `provider` (text)
      - `qasm_code` (text)
      - `priority` (text)
      - `is_public` (boolean)
      - `tags` (text[])
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user-scoped job management
    - Add policies for template sharing
    - Allow anonymous job submission with user tracking
    
  3. Indexes
    - User ID for fast lookups
    - Status for filtering
    - Provider for analytics
    - Created date for sorting
*/

CREATE TABLE IF NOT EXISTS quantum_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type text NOT NULL,
  provider text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  submission_type text NOT NULL,
  description text NOT NULL,
  qasm_code text,
  status text NOT NULL DEFAULT 'submitted',
  progress integer DEFAULT 0,
  results jsonb,
  error_message text,
  execution_time_ms float,
  metrics jsonb DEFAULT '{}'::jsonb,
  submitted_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS job_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES quantum_jobs(id) ON DELETE CASCADE,
  attempt integer DEFAULT 1,
  execution_time_ms float,
  fidelity float,
  circuit_depth integer,
  gate_count integer,
  measurements jsonb,
  status text NOT NULL,
  error text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  job_type text NOT NULL,
  provider text NOT NULL,
  qasm_code text,
  priority text DEFAULT 'medium',
  is_public boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quantum_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
  ON quantum_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create jobs"
  ON quantum_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own jobs"
  ON quantum_jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own jobs"
  ON quantum_jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view executions of own jobs"
  ON job_executions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quantum_jobs
      WHERE quantum_jobs.id = job_executions.job_id
      AND (quantum_jobs.user_id = auth.uid() OR quantum_jobs.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert executions for own jobs"
  ON job_executions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quantum_jobs
      WHERE quantum_jobs.id = job_executions.job_id
      AND (quantum_jobs.user_id = auth.uid() OR quantum_jobs.user_id IS NULL)
    )
  );

CREATE POLICY "Users can view own templates and public ones"
  ON job_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create templates"
  ON job_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON job_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON job_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_quantum_jobs_user_id ON quantum_jobs(user_id);
CREATE INDEX idx_quantum_jobs_status ON quantum_jobs(status);
CREATE INDEX idx_quantum_jobs_provider ON quantum_jobs(provider);
CREATE INDEX idx_quantum_jobs_submitted_at ON quantum_jobs(submitted_at DESC);
CREATE INDEX idx_quantum_jobs_user_status ON quantum_jobs(user_id, status);
CREATE INDEX idx_job_executions_job_id ON job_executions(job_id);
CREATE INDEX idx_job_executions_status ON job_executions(status);
CREATE INDEX idx_job_templates_user_id ON job_templates(user_id);
CREATE INDEX idx_job_templates_public ON job_templates(is_public);
CREATE INDEX idx_job_templates_tags ON job_templates USING GIN(tags);
