"use client";

import { useState } from "react";
import type { TravelApiResponse, TravelResult } from "@/lib/types";

const initialResult: TravelResult | null = null;

export default function TravelPlanner() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(10000);
  const [destinationType, setDestinationType] = useState("mountain");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TravelResult | null>(initialResult);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

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

      const data = (await res.json()) as TravelApiResponse;

      if (!res.ok || !data?.result?.success) {
        throw new Error(
          data?.result?.error || "Failed to generate itinerary"
        );
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-4xl">AI Travel Planner</h1>
          <p className="mt-2 text-sm text-neutral-400 md:text-base">
            Enter destination, days, budget, and destination type to generate a
            detailed itinerary.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-lg"
          >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Destination
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Sikkim"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Number of Days
                </label>
                <input
                  type="number"
                  min={1}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Budget</label>
                <input
                  type="number"
                  min={1}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="e.g. 20000"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Destination Type
                </label>
                <select
                  value={destinationType}
                  onChange={(e) => setDestinationType(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-500"
                >
                  <option value="mountain">Mountain</option>
                  <option value="beach">Beach</option>
                  <option value="city">City</option>
                  <option value="adventure">Adventure</option>
                  <option value="cultural">Cultural</option>
                  <option value="nature">Nature</option>
                  <option value="luxury">Luxury</option>
                  <option value="budget">Budget</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate Itinerary"}
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-lg">
            {!result && !error && !loading && (
              <div className="flex h-full min-h-[300px] items-center justify-center text-center text-neutral-400">
                Your generated itinerary will appear here.
              </div>
            )}

            {loading && (
              <div className="flex h-full min-h-[300px] items-center justify-center text-neutral-300">
                Creating your itinerary...
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
                {error}
              </div>
            )}

            {result && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-bold">
                    {result.destination}
                    {result.country ? `, ${result.country}` : ""}
                  </h2>
                  <p className="mt-3 text-neutral-300">{result.introduction}</p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                      <p className="text-sm text-neutral-400">
                        Best Time to Visit
                      </p>
                      <p className="mt-1 font-medium">
                        {result.best_time_to_visit}
                      </p>
                    </div>
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                      <p className="text-sm text-neutral-400">
                        Estimated Budget
                      </p>
                      <p className="mt-1 font-medium">
                        {result.estimated_budget}
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-xl font-semibold">Highlights</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {result.highlights?.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="rounded-xl border border-neutral-800 bg-neutral-950 p-4"
                      >
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-2 text-sm text-neutral-300">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-xl font-semibold">Food</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {result.food?.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="rounded-xl border border-neutral-800 bg-neutral-950 p-4"
                      >
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-2 text-sm text-neutral-300">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-xl font-semibold">Culture</h3>
                  <ul className="space-y-2 text-neutral-300">
                    {result.culture?.map((item, index) => (
                      <li key={index} className="rounded-xl bg-neutral-950 p-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="mb-3 text-xl font-semibold">Travel Tips</h3>
                  <ul className="space-y-2 text-neutral-300">
                    {result.travel_tips?.map((item, index) => (
                      <li key={index} className="rounded-xl bg-neutral-950 p-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="mb-4 text-xl font-semibold">
                    Day-wise Itinerary
                  </h3>
                  <div className="space-y-4">
                    {result.days?.map((day) => (
                      <div
                        key={day.day}
                        className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h4 className="text-lg font-bold">
                            Day {day.day}: {day.title}
                          </h4>
                          <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                            {day.estimated_day_cost}
                          </span>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="rounded-xl bg-neutral-900 p-4">
                            <p className="text-sm text-neutral-400">Morning</p>
                            <p className="mt-2 text-sm text-neutral-200">
                              {day.morning}
                            </p>
                          </div>
                          <div className="rounded-xl bg-neutral-900 p-4">
                            <p className="text-sm text-neutral-400">Afternoon</p>
                            <p className="mt-2 text-sm text-neutral-200">
                              {day.afternoon}
                            </p>
                          </div>
                          <div className="rounded-xl bg-neutral-900 p-4">
                            <p className="text-sm text-neutral-400">Evening</p>
                            <p className="mt-2 text-sm text-neutral-200">
                              {day.evening}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl bg-neutral-900 p-4">
                            <p className="text-sm text-neutral-400">
                              Food Recommendation
                            </p>
                            <p className="mt-2 text-sm text-neutral-200">
                              {day.food_recommendation}
                            </p>
                          </div>
                          <div className="rounded-xl bg-neutral-900 p-4">
                            <p className="text-sm text-neutral-400">
                              Stay Suggestion
                            </p>
                            <p className="mt-2 text-sm text-neutral-200">
                              {day.stay_suggestion}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-neutral-900 p-4">
                          <p className="text-sm text-neutral-400">Notes</p>
                          <p className="mt-2 text-sm text-neutral-200">
                            {day.notes}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}