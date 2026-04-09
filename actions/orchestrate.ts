"use server";

type TravelInput = {
  destination: string;   // changed from destination_type
  days: number;
  people?: number;
  budget: number;
  travel_style: string;
};

type ActivityItem = {
  time?: string;
  activity?: string;
  details?: string;
};

type HighlightItem = {
  name?: string;
  description?: string;
};

type FoodItem = {
  name?: string;
  description?: string;
};

type BudgetSummary = {
  total_budget?: number;
  estimated_spend?: number;
  per_day_budget?: number;
  style?: string;
};

type DayPlan = {
  day: number;
  title: string;
  overview?: string;
  activities: ActivityItem[];
  estimated_cost?: string | number;
  tips?: string[];
};

type TravelPlan = {
  success: boolean;
  destination: string;
  country?: string;
  introduction: string;
  best_time: string;
  budget_summary?: BudgetSummary;
  top_highlights: HighlightItem[];
  food: FoodItem[];
  travel_tips: string[];
  days: DayPlan[];
};

type TravelError = {
  error: string;
  raw?: unknown;
};

function safeJsonParse(value: unknown): unknown {
  if (typeof value !== "string") return value;

  const cleaned = value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return value;
  }
}

function unwrapResult(value: any): any {
  let current = value;

  for (let i = 0; i < 4; i++) {
    if (typeof current === "string") {
      current = safeJsonParse(current);
    }

    if (
      current &&
      typeof current === "object" &&
      "result" in current &&
      current.result
    ) {
      current = current.result;
      continue;
    }

    break;
  }

  return current;
}

function normalizeActivity(activity: any): ActivityItem {
  if (typeof activity === "string") {
    return { time: "", activity, details: "" };
  }

  return {
    time: activity?.time || "",
    activity: activity?.activity || activity?.name || "",
    details: activity?.details || activity?.description || "",
  };
}

function normalizeDay(item: any, index: number): DayPlan {
  return {
    day: Number(item?.day || index + 1),
    title: item?.title || `Day ${index + 1}`,
    overview: item?.overview || "",
    activities: Array.isArray(item?.activities)
      ? item.activities.map(normalizeActivity)
      : [],
    estimated_cost: item?.estimated_cost || item?.estimated_day_budget || "",
    tips: Array.isArray(item?.tips) ? item.tips.filter(Boolean) : [],
  };
}

function normalizeHighlights(value: unknown): HighlightItem[] {
  if (!Array.isArray(value)) return [];

  return value.map((item: any) => {
    if (typeof item === "string") return { name: item, description: "" };
    return {
      name: item?.name || item?.title || "",
      description: item?.description || "",
    };
  });
}

function normalizeFood(value: unknown): FoodItem[] {
  if (!Array.isArray(value)) return [];

  return value.map((item: any) => {
    if (typeof item === "string") return { name: item, description: "" };
    return {
      name: item?.name || item?.title || "",
      description: item?.description || "",
    };
  });
}

function normalizeTravelTips(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item: any) =>
      typeof item === "string" ? item : item?.tip || item?.text || ""
    )
    .filter(Boolean);
}

export async function runTravelAgent(
  input: TravelInput
): Promise<TravelPlan | TravelError> {
  try {
    const response = await fetch(process.env.LAMATIC_API_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LAMATIC_API_KEY as string}`,
        "x-project-id": process.env.LAMATIC_PROJECT_ID as string,
      },
      body: JSON.stringify({
        query: `
          query ExecuteWorkflow(
            $workflowId: String!,
            $destination: String,
            $days: Int,
            $people: Int,
            $budget: Int,
            $travel_style: String
          ) {
            executeWorkflow(
              workflowId: $workflowId,
              payload: {
                destination: $destination,
                days: $days,
                people: $people,
                budget: $budget,
                travel_style: $travel_style
              }
            ) {
              status
              result
            }
          }
        `,
        variables: {
          workflowId: process.env.GLOBAL_TRAVEL_AGENT,
          destination: input.destination,
          days: input.days,
          people: input.people ?? 1,
          budget: input.budget,
          travel_style: input.travel_style,
        },
      }),
      cache: "no-store",
    });

    const rawText = await response.text();
    console.log("LAMATIC RAW RESPONSE:", rawText);

    let data: any;

    try {
      data = JSON.parse(rawText);
    } catch {
      return {
        error: "Lamatic returned invalid JSON",
        raw: rawText,
      };
    }

    const workflowResult =
      data?.data?.executeWorkflow?.result ?? data?.result ?? data;

    console.log(
      "LAMATIC executeWorkflow.result:",
      JSON.stringify(workflowResult, null, 2)
    );

    const parsed = unwrapResult(workflowResult);

    console.log("FINAL PARSED RESULT:", JSON.stringify(parsed, null, 2));

    if (!parsed || typeof parsed !== "object") {
      return {
        error: "Invalid result structure",
        raw: parsed,
      };
    }

    return {
      success: Boolean(parsed?.success ?? true),
      // Safety fallback chain — uses input.destination as last resort
      destination:
        parsed?.destination ||
        input.destination ||
        "",
      country: parsed?.country || "",
      introduction: parsed?.introduction || "",
      best_time: parsed?.best_time || "",
      budget_summary:
        parsed?.budget_summary && typeof parsed.budget_summary === "object"
          ? {
              total_budget: Number(parsed.budget_summary.total_budget || 0),
              estimated_spend: Number(parsed.budget_summary.estimated_spend || 0),
              per_day_budget: Number(parsed.budget_summary.per_day_budget || 0),
              style: parsed.budget_summary.style || "",
            }
          : undefined,
      top_highlights: normalizeHighlights(parsed?.top_highlights),
      food: normalizeFood(parsed?.food),
      travel_tips: normalizeTravelTips(parsed?.travel_tips),
      days: Array.isArray(parsed?.days) ? parsed.days.map(normalizeDay) : [],
    };
  } catch (error) {
    console.error("runTravelAgent error:", error);

    return {
      error: "Failed to generate travel plan",
      raw: error instanceof Error ? error.message : error,
    };
  }
}