"use client";

import { useState } from "react";
import ItineraryDisplay from "./ItineraryDisplay";

export type DayPlan = {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  food_recommendation: string;
  stay_suggestion: string;
  estimated_day_cost: string;
  notes: string;
};

export type ItineraryData = {
  success: boolean;
  destination: string;
  country: string;
  introduction: string;
  best_time_to_visit: string;
  estimated_budget: string;
  highlights: { name: string; description: string }[];
  food: { name: string; description: string }[];
  culture: string[];
  travel_tips: string[];
  days: DayPlan[];
};

const DESTINATION_TYPES = [
  "beach",
  "mountain",
  "city",
  "cultural",
  "adventure",
  "wildlife",
  "luxury",
  "budget",
];

export default function PlannerForm() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [destinationType, setDestinationType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);

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

      // Lamatic wraps result in nested result.result
      const itineraryData =
        data.result?.result?.result ?? data.result?.result ?? data.result;

      setItinerary(itineraryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {/* Destination */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/70">
              Destination
            </label>
            <input
              type="text"
              placeholder="e.g. Bali, Paris, Tokyo"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="rounded-2xl border border-white/10 bg-[#0d1b2f] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/50"
            />
          </div>

          {/* Destination Type */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/70">
              Travel Style
            </label>
            <select
              value={destinationType}
              onChange={(e) => setDestinationType(e.target.value)}
              required
              className="rounded-2xl border border-white/10 bg-[#0d1b2f] px-4 py-3 text-white outline-none focus:border-cyan-400/50"
            >
              <option value="" disabled>
                Select a style
              </option>
              {DESTINATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Days */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/70">
              Number of Days
            </label>
            <input
              type="number"
              placeholder="e.g. 5"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              required
              className="rounded-2xl border border-white/10 bg-[#0d1b2f] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/50"
            />
          </div>

          {/* Budget */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/70">
              Budget (USD)
            </label>
            <input
              type="number"
              placeholder="e.g. 1000"
              min={1}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
              className="rounded-2xl border border-white/10 bg-[#0d1b2f] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/50"
            />
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 font-semibold text-black shadow-lg transition-opacity disabled:opacity-60"
        >
          {loading ? "Generating your itinerary..." : "Generate Itinerary"}
        </button>
      </form>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-10 text-white/60">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-sm">Building your personalized travel plan...</p>
        </div>
      )}

      {itinerary && <ItineraryDisplay data={itinerary} />}
    </div>
  );
}