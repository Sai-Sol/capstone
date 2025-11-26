/*
  # Create Circuit Optimization Tables

  1. New Tables
    - `circuit_optimizations` - Stores circuit optimization analyses
    - `optimization_suggestions` - Individual optimization suggestions for each analysis
    - `optimization_history` - History of optimization applications

  2. Security
    - Enable RLS on all tables
    - Users can only access their own optimization records
    - Authenticated users only

  3. Indexes
    - user_id for fast lookups
    - created_at for sorting and pagination
    - job_id for linking to jobs
*/

CREATE TABLE IF NOT EXISTS circuit_optimizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id text,
  circuit_code text NOT NULL,
  circuit_depth integer,
  gate_count integer,
  qubit_count integer,
  optimization_score integer,
  provider text DEFAULT 'Google Willow',
  is_valid boolean DEFAULT true,
  validation_errors text[] DEFAULT '{}',
  estimated_time_ms integer,
  estimated_cost decimal,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS optimization_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  optimization_id uuid NOT NULL REFERENCES circuit_optimizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  impact text NOT NULL CHECK (impact IN ('low', 'medium', 'high')),
  suggestion text NOT NULL,
  applied boolean DEFAULT false,
  applied_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS optimization_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  optimization_id uuid NOT NULL REFERENCES circuit_optimizations(id) ON DELETE CASCADE,
  original_circuit text NOT NULL,
  optimized_circuit text NOT NULL,
  improvement_percentage integer,
  time_saved_ms integer,
  cost_saved decimal,
  applied_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE circuit_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for circuit_optimizations
CREATE POLICY "Users can read own optimizations"
  ON circuit_optimizations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own optimizations"
  ON circuit_optimizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own optimizations"
  ON circuit_optimizations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own optimizations"
  ON circuit_optimizations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for optimization_suggestions
CREATE POLICY "Users can read suggestions from own optimizations"
  ON optimization_suggestions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM circuit_optimizations
      WHERE circuit_optimizations.id = optimization_suggestions.optimization_id
      AND circuit_optimizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert suggestions for own optimizations"
  ON optimization_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM circuit_optimizations
      WHERE circuit_optimizations.id = optimization_suggestions.optimization_id
      AND circuit_optimizations.user_id = auth.uid()
    )
  );

-- Create RLS policies for optimization_history
CREATE POLICY "Users can read own optimization history"
  ON optimization_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own optimization history"
  ON optimization_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_circuit_optimizations_user_id ON circuit_optimizations(user_id);
CREATE INDEX idx_circuit_optimizations_created_at ON circuit_optimizations(created_at DESC);
CREATE INDEX idx_circuit_optimizations_job_id ON circuit_optimizations(job_id);
CREATE INDEX idx_optimization_suggestions_optimization_id ON optimization_suggestions(optimization_id);
CREATE INDEX idx_optimization_history_user_id ON optimization_history(user_id);
CREATE INDEX idx_optimization_history_created_at ON optimization_history(applied_at DESC);