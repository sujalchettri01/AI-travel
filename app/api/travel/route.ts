import { NextResponse } from "next/server";
import { generateTravelPlan } from "../../../lib/travel";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { destination, no_of_days, budget, destination_type } = body;

    if (!destination || !no_of_days || !budget || !destination_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await generateTravelPlan({
      destination,
      no_of_days,
      budget,
      destination_type,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Travel API Error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate itinerary",
      },
      { status: 500 }
    );
  }
}