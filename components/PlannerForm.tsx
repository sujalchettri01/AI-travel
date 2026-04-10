async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  setLoading(true);
  setError("");
  setItinerary(null);

  try {
    const res = await fetch("/api/travel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destination,
        days: Number(days),
        budget: Number(budget),
        destination_type: destinationType,
      }),
    });

    const rawText = await res.text();

    if (!rawText || !rawText.trim()) {
      throw new Error("API returned an empty response");
    }

    let data: any;

    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`API returned invalid JSON: ${rawText}`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to generate itinerary");
    }

    setItinerary(data.result);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong");
  } finally {
    setLoading(false);
  }
}