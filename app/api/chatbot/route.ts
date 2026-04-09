import { NextResponse } from "next/server";

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

function unwrapLamaticResult(value: any): any {
  let current = value;

  for (let i = 0; i < 4; i++) {
    if (typeof current === "string") {
      const parsed = safeJsonParse(current);

      if (parsed === current) break;
      current = parsed;
      continue;
    }

    if (current && typeof current === "object" && "result" in current) {
      current = current.result;
      continue;
    }

    break;
  }

  return current;
}

function extractReply(value: any): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (!value || typeof value !== "object") {
    return "Sorry, I couldn't understand that properly.";
  }

  if (typeof value.reply === "string" && value.reply.trim()) {
    return value.reply.trim();
  }

  if (typeof value.output === "string" && value.output.trim()) {
    return value.output.trim();
  }

  if (typeof value.message === "string" && value.message.trim()) {
    return value.message.trim();
  }

  if (typeof value.text === "string" && value.text.trim()) {
    return value.text.trim();
  }

  if (Array.isArray(value.messages) && value.messages.length > 0) {
    const firstText = value.messages.find(
      (item: any) => typeof item === "string" || typeof item?.text === "string"
    );

    if (typeof firstText === "string" && firstText.trim()) {
      return firstText.trim();
    }

    if (firstText && typeof firstText?.text === "string" && firstText.text.trim()) {
      return firstText.text.trim();
    }
  }

  return "Sorry, I couldn't understand that properly.";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { reply: "Please enter a message." },
        { status: 400 }
      );
    }

    const response = await fetch(process.env.LAMATIC_API_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LAMATIC_API_KEY as string}`,
        "x-project-id": process.env.LAMATIC_PROJECT_ID as string,
      },
      body: JSON.stringify({
        query: `
          query ExecuteWorkflow($workflowId: String!, $message: String!) {
            executeWorkflow(
              workflowId: $workflowId,
              payload: {
                message: $message
              }
            ) {
              status
              result
            }
          }
        `,
        variables: {
          workflowId: process.env.CHATBOT_FLOW_ID,
          message,
        },
      }),
      cache: "no-store",
    });

    const rawText = await response.text();
    console.log("CHATBOT LAMATIC RAW RESPONSE:", rawText);

    let data: any;

    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { reply: "Lamatic returned invalid JSON." },
        { status: 500 }
      );
    }

    const workflowResult =
      data?.data?.executeWorkflow?.result ?? data?.result ?? data;

    console.log(
      "CHATBOT executeWorkflow.result:",
      JSON.stringify(workflowResult, null, 2)
    );

    const parsed = unwrapLamaticResult(workflowResult);

    console.log("CHATBOT FINAL PARSED RESULT:", JSON.stringify(parsed, null, 2));

    const reply = extractReply(parsed);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chatbot API Error:", error);

    return NextResponse.json(
      { reply: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}