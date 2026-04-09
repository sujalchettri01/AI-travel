type TravelRequest = {
  destination: string;
  no_of_days: string;
  budget: string;
  destination_type: string;
};

export async function generateTravelPlan(payload: TravelRequest) {
  const FLOW_URL = process.env.LAMATIC_FLOW_URL;
  const API_KEY = process.env.LAMATIC_API_KEY;

  if (!FLOW_URL) {
    throw new Error("Missing LAMATIC_FLOW_URL in environment variables");
  }

  const lamaticRes = await fetch(FLOW_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const rawText = await lamaticRes.text();

  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Lamatic returned invalid JSON: ${rawText}`);
  }

  if (!lamaticRes.ok) {
    throw new Error(data?.error || "Lamatic request failed");
  }

  const finalResult = data?.result?.result;

  if (!finalResult) {
    throw new Error("Unexpected response format from Lamatic");
  }

  return finalResult;
}