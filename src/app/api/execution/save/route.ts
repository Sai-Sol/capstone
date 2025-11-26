import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";

interface SaveExecutionRequest {
  jobId: string;
  circuitCode: string;
  status: "running" | "success" | "failed";
  environment: {
    seed: number;
    hardware: string;
    framework: string;
    version: string;
  };
  parameters: Record<string, string | number>;
  metrics: {
    duration: number;
    accuracy: number;
    iterations: number;
  };
  results?: any;
  notes?: string;
}

function generateHash(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: SaveExecutionRequest = await request.json();

    const inputHash = generateHash(
      body.circuitCode + JSON.stringify(body.parameters)
    );
    const outputHash = body.results
      ? generateHash(JSON.stringify(body.results))
      : null;

    const { data: execution, error: executionError } = await supabase
      .from("execution_records")
      .insert({
        user_id: user.id,
        job_id: body.jobId,
        circuit_code: body.circuitCode,
        status: body.status,
        environment: body.environment,
        parameters: body.parameters,
        metrics: body.metrics,
        input_hash: inputHash,
        output_hash: outputHash,
        results: body.results,
        notes: body.notes,
        execution_time_ms: body.metrics.duration * 1000,
        completed_at: body.status !== "running" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (executionError) {
      console.error("Error saving execution:", executionError);
      return NextResponse.json(
        { error: "Failed to save execution record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      executionId: execution.id,
      inputHash,
      outputHash,
      message: "Execution record saved successfully",
    });
  } catch (error) {
    console.error("Execution save error:", error);
    return NextResponse.json(
      { error: "Failed to save execution record" },
      { status: 500 }
    );
  }
}
