import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

interface SaveOptimizationRequest {
  circuitCode: string;
  circuitDepth: number;
  gateCount: number;
  qubitCount: number;
  optimizationScore: number;
  provider: string;
  isValid: boolean;
  validationErrors?: string[];
  estimatedTimeMs?: number;
  estimatedCost?: number;
  suggestions: Array<{
    title: string;
    description: string;
    impact: "low" | "medium" | "high";
    suggestion: string;
  }>;
  notes?: string;
  jobId?: string;
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

    const body: SaveOptimizationRequest = await request.json();

    const { data: optimization, error: optimizationError } = await supabase
      .from("circuit_optimizations")
      .insert({
        user_id: user.id,
        circuit_code: body.circuitCode,
        circuit_depth: body.circuitDepth,
        gate_count: body.gateCount,
        qubit_count: body.qubitCount,
        optimization_score: body.optimizationScore,
        provider: body.provider,
        is_valid: body.isValid,
        validation_errors: body.validationErrors || [],
        estimated_time_ms: body.estimatedTimeMs,
        estimated_cost: body.estimatedCost,
        notes: body.notes,
        job_id: body.jobId,
      })
      .select()
      .single();

    if (optimizationError) {
      console.error("Error saving optimization:", optimizationError);
      return NextResponse.json(
        { error: "Failed to save optimization" },
        { status: 500 }
      );
    }

    for (const suggestion of body.suggestions) {
      const { error: suggestionError } = await supabase
        .from("optimization_suggestions")
        .insert({
          optimization_id: optimization.id,
          title: suggestion.title,
          description: suggestion.description,
          impact: suggestion.impact,
          suggestion: suggestion.suggestion,
        });

      if (suggestionError) {
        console.error("Error saving suggestion:", suggestionError);
      }
    }

    return NextResponse.json({
      success: true,
      optimizationId: optimization.id,
      message: "Optimization saved successfully",
    });
  } catch (error) {
    console.error("Optimization save error:", error);
    return NextResponse.json(
      { error: "Failed to save optimization" },
      { status: 500 }
    );
  }
}
