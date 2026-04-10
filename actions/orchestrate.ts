export async function runTravelAgent(input: {
  destination: string;
  days: number;
  budget: number;
  destination_type: string;
}) {
  const apiUrl = process.env.LAMATIC_API_URL;
  const apiKey = process.env.LAMATIC_API_KEY;
  const projectId = process.env.LAMATIC_PROJECT_ID;
  const workflowId = process.env.GLOBAL_TRAVEL_AGENT;

  if (!apiUrl || !apiKey || !projectId || !workflowId) {
    throw new Error("Missing Lamatic environment variables");
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "x-project-id": projectId,
    },
    body: JSON.stringify({
      query: `
        query Execute(
          $workflowId: String!
          $destination: String!
          $days: Float!
          $budget: Float!
          $destination_type: String!
        ) {
          executeWorkflow(
            workflowId: $workflowId
            payload: {
              destination: $destination
              days: $days
              budget: $budget
              destination_type: $destination_type
            }
          ) {
            status
            result
          }
        }
      `,
      variables: {
        workflowId,
        destination: input.destination,
        days: input.days,
        budget: input.budget,
        destination_type: input.destination_type,
      },
    }),
    cache: "no-store",
  });

  const rawText = await res.text();

  if (!rawText || !rawText.trim()) {
    throw new Error("Lamatic returned an empty response");
  }

  let data: any;

  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Lamatic returned invalid JSON: ${rawText}`);
  }

  if (!res.ok) {
    throw new Error(
      data?.errors?.[0]?.message || `Lamatic request failed: ${res.status}`
    );
  }

  if (data?.errors?.length) {
    throw new Error(data.errors[0].message || "Lamatic GraphQL error");
  }

  return data?.data?.executeWorkflow?.result;
}