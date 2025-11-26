/*
  # Create Execution Reproducibility Tables

  1. New Tables
    - `execution_records` - Stores execution snapshots with environment details
    - `execution_comparisons` - Comparison results between executions
    - `reproducibility_verifications` - Verification status and checks

  2. Security
    - Enable RLS on all tables
    - Users can only access their own execution records
    - Authenticated users only

  3. Indexes
    - user_id for fast lookups
    - created_at for sorting and pagination
    - input_hash and output_hash for comparisons
*/

CREATE TABLE IF NOT EXISTS execution_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id text NOT NULL,
  circuit_code text NOT NULL,
  status text NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  environment jsonb NOT NULL,
  parameters jsonb NOT NULL,
  metrics jsonb NOT NULL,
  input_hash text NOT NULL,
  output_hash text,
  results jsonb,
  notes text,
  execution_time_ms integer,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, job_id, input_hash)
);

CREATE TABLE IF NOT EXISTS execution_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  execution_id_1 uuid NOT NULL REFERENCES execution_records(id) ON DELETE CASCADE,
  execution_id_2 uuid NOT NULL REFERENCES execution_records(id) ON DELETE CASCADE,
  parameters_match boolean,
  environment_match boolean,
  output_match boolean,
  reproducibility_score integer,
  differences jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(execution_id_1, execution_id_2)
);

CREATE TABLE IF NOT EXISTS reproducibility_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  execution_id uuid NOT NULL REFERENCES execution_records(id) ON DELETE CASCADE,
  check_name text NOT NULL,
  check_type text NOT NULL CHECK (check_type IN ('verified', 'warning', 'failed')),
  description text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE execution_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproducibility_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for execution_records
CREATE POLICY "Users can read own execution records"
  ON execution_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own execution records"
  ON execution_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own execution records"
  ON execution_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own execution records"
  ON execution_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for execution_comparisons
CREATE POLICY "Users can read own execution comparisons"
  ON execution_comparisons FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own execution comparisons"
  ON execution_comparisons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for reproducibility_verifications
CREATE POLICY "Users can read own verifications"
  ON reproducibility_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications"
  ON reproducibility_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_execution_records_user_id ON execution_records(user_id);
CREATE INDEX idx_execution_records_created_at ON execution_records(created_at DESC);
CREATE INDEX idx_execution_records_job_id ON execution_records(job_id);
CREATE INDEX idx_execution_records_input_hash ON execution_records(input_hash);
CREATE INDEX idx_execution_records_output_hash ON execution_records(output_hash);
CREATE INDEX idx_execution_comparisons_user_id ON execution_comparisons(user_id);
CREATE INDEX idx_execution_comparisons_execution_id_1 ON execution_comparisons(execution_id_1);
CREATE INDEX idx_execution_comparisons_execution_id_2 ON execution_comparisons(execution_id_2);
CREATE INDEX idx_reproducibility_verifications_user_id ON reproducibility_verifications(user_id);
CREATE INDEX idx_reproducibility_verifications_execution_id ON reproducibility_verifications(execution_id);