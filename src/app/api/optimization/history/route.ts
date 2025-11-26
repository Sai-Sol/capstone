import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const provider = searchParams.get("provider");

    let query = supabase
      .from("circuit_optimizations")
      .select(
        `
        id,
        circuit_code,
        circuit_depth,
        gate_count,
        qubit_count,
        optimization_score,
        provider,
        is_valid,
        validation_errors,
        estimated_time_ms,
        estimated_cost,
        notes,
        job_id,
        created_at,
        optimization_suggestions (
          id,
          title,
          description,
          impact,
          suggestion,
          applied,
          applied_at
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (provider) {
      query = query.eq("provider", provider);
    }

    const { data: optimizations, error, count } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);

    if (error) {
      console.error("Error fetching optimizations:", error);
      return NextResponse.json(
        { error: "Failed to fetch optimization history" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      optimizations: optimizations || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Optimization history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch optimization history" },
      { status: 500 }
    );
  }
}
