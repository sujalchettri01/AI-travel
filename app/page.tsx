"use client";

import { useState } from "react";

type Highlight = {
  name: string;
  description: string;
};

type FoodItem = {
  name: string;
  description: string;
};

type DayPlan = {
  day: number;
  title: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
  food_recommendation?: string;
  stay_suggestion?: string;
  estimated_day_cost?: string;
  notes?: string;
};

type TravelPlan = {
  success?: boolean;
  destination?: string;
  country?: string;
  introduction?: string;
  best_time_to_visit?: string;
  estimated_budget?: string;
  highlights?: Highlight[];
  food?: FoodItem[];
  culture?: string[];
  travel_tips?: string[];
  days?: DayPlan[];
  error?: string;
};

export default function HomePage() {
  const [destination, setDestination] = useState("");
  const [noOfDays, setNoOfDays] = useState("");
  const [budget, setBudget] = useState("");
  const [destinationType, setDestinationType] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TravelPlan | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setResult(null);

    if (!destination || !noOfDays || !budget || !destinationType) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/travel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          no_of_days: noOfDays,
          budget,
          destination_type: destinationType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Something went wrong");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Smart Travel Planner
        </h1>

        <div className="bg-neutral-900 p-6 rounded-2xl shadow-lg space-y-4">
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 outline-none"
          />

          <input
            type="number"
            placeholder="Number of days"
            value={noOfDays}
            onChange={(e) => setNoOfDays(e.target.value)}
            className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 outline-none"
          />

          <input
            type="text"
            placeholder="Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 outline-none"
          />

          <input
            type="text"
            placeholder="Destination type (mountains, city, beach...)"
            value={destinationType}
            onChange={(e) => setDestinationType(e.target.value)}
            className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 outline-none"
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg font-semibold"
          >
            {loading ? "Generating..." : "Generate Itinerary"}
          </button>
        </div>

        {error && (
          <div className="mt-6 bg-red-600/20 border border-red-500 text-red-300 p-4 rounded-xl">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-10 space-y-6">
            <div className="bg-neutral-900 p-6 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold mb-2">
                {result.destination || "Travel Plan"}
              </h2>
              {result.country && (
                <p className="text-neutral-400 mb-4">{result.country}</p>
              )}

              {result.introduction && (
                <p className="text-neutral-200 leading-7">
                  {result.introduction}
                </p>
              )}

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {result.best_time_to_visit && (
                  <div className="bg-neutral-800 p-4 rounded-xl">
                    <h3 className="font-semibold mb-2">Best Time to Visit</h3>
                    <p>{result.best_time_to_visit}</p>
                  </div>
                )}

                {result.estimated_budget && (
                  <div className="bg-neutral-800 p-4 rounded-xl">
                    <h3 className="font-semibold mb-2">Estimated Budget</h3>
                    <p>{result.estimated_budget}</p>
                  </div>
                )}
              </div>
            </div>

            {result.highlights && result.highlights.length > 0 && (
              <div className="bg-neutral-900 p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Highlights</h3>
                <div className="space-y-4">
                  {result.highlights.map((item, index) => (
                    <div key={index} className="bg-neutral-800 p-4 rounded-xl">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-neutral-300 mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.food && result.food.length > 0 && (
              <div className="bg-neutral-900 p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Food</h3>
                <div className="space-y-4">
                  {result.food.map((item, index) => (
                    <div key={index} className="bg-neutral-800 p-4 rounded-xl">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-neutral-300 mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.culture && result.culture.length > 0 && (
              <div className="bg-neutral-900 p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Culture</h3>
                <ul className="space-y-2 text-neutral-300">
                  {result.culture.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.travel_tips && result.travel_tips.length > 0 && (
              <div className="bg-neutral-900 p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Travel Tips</h3>
                <ul className="space-y-2 text-neutral-300">
                  {result.travel_tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.days && result.days.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Day-wise Plan</h3>

                {result.days.map((day) => (
                  <div
                    key={day.day}
                    className="bg-neutral-900 p-6 rounded-2xl shadow-lg"
                  >
                    <h4 className="text-xl font-bold mb-3">
                      Day {day.day}: {day.title}
                    </h4>

                    {day.morning && (
                      <p className="mb-2">
                        <span className="font-semibold">Morning:</span>{" "}
                        {day.morning}
                      </p>
                    )}

                    {day.afternoon && (
                      <p className="mb-2">
                        <span className="font-semibold">Afternoon:</span>{" "}
                        {day.afternoon}
                      </p>
                    )}

                    {day.evening && (
                      <p className="mb-2">
                        <span className="font-semibold">Evening:</span>{" "}
                        {day.evening}
                      </p>
                    )}

                    {day.food_recommendation && (
                      <p className="mb-2">
                        <span className="font-semibold">Food:</span>{" "}
                        {day.food_recommendation}
                      </p>
                    )}

                    {day.stay_suggestion && (
                      <p className="mb-2">
                        <span className="font-semibold">Stay:</span>{" "}
                        {day.stay_suggestion}
                      </p>
                    )}

                    {day.estimated_day_cost && (
                      <p className="mb-2">
                        <span className="font-semibold">Estimated Cost:</span>{" "}
                        {day.estimated_day_cost}
                      </p>
                    )}

                    {day.notes && (
                      <p className="text-neutral-400 mt-3">
                        <span className="font-semibold text-white">Notes:</span>{" "}
                        {day.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}