import { NextResponse } from "next/server";

type LamaticFlowResponse = {
  result?: unknown;
  reply?: unknown;
  message?: unknown;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const flowUrl = process.env.LAMATIC_FLOW_URL;
    const apiKey = process.env.LAMATIC_API_KEY;

    if (!flowUrl || !apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing chatbot environment variables" },
        { status: 500 }
      );
    }

    const res = await fetch(flowUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ message }),
      cache: "no-store",
    });

    const data = (await res.json()) as LamaticFlowResponse;

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Chatbot flow request failed",
          raw: data,
        },
        { status: res.status }
      );
    }

    const reply =
      typeof data?.reply === "string"
        ? data.reply
        : typeof data?.result === "string"
        ? data.result
        : typeof data?.message === "string"
        ? data.message
        : JSON.stringify(data);

    return NextResponse.json({
      success: true,
      reply,
      raw: data,
    });
  } catch (error) {
    console.error("Chatbot route error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get chatbot reply",
      },
      { status: 500 }
    );
  }
}