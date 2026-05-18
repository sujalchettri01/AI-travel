const LAMATIC_API_URL = process.env.LAMATIC_API_URL!;
const LAMATIC_API_KEY = process.env.LAMATIC_API_KEY!;
const LAMATIC_PROJECT_ID = process.env.LAMATIC_PROJECT_ID!;

export async function callLamaticFlow(flowId: string, inputs: Record<string, unknown>) {
  const res = await fetch(`${LAMATIC_API_URL}/project/${LAMATIC_PROJECT_ID}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LAMATIC_API_KEY}`,
    },
    body: JSON.stringify({ flowId, inputs }),
  });

  if (!res.ok) throw new Error(`Lamatic error: ${res.statusText}`);
  return res.json();
}