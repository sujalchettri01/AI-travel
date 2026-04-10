import PlannerForm from "@/components/PlannerForm";
import FloatingChatbot from "@/components/FloatingChatbot";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#07111f] via-[#0a1930] to-[#10284d] text-white">
      <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-12">
        <div className="mb-10 text-center">
          <p className="mb-3 inline-block rounded-full border border-white/15 bg-white/10 px-4 py-1 text-sm text-white/80">
            Agentic AI Travel Platform
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Smart Travel Planner
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/75 md:text-lg">
            Plan complete trips using AI. Enter your destination, number of days,
            budget, and travel style to generate a structured itinerary with local
            highlights, food, culture, tips, and day-wise planning.
          </p>
        </div>

        <PlannerForm />
      </section>

      <FloatingChatbot />
    </main>
  );
}