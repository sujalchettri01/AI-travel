export type TravelRequest = {
  destination: string;
  days: number;
  budget: number;
  destination_type: string;
};

export type HighlightItem = {
  name: string;
  description: string;
};

export type FoodItem = {
  name: string;
  description: string;
};

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

export type TravelResult = {
  success: boolean;
  destination: string;
  country: string;
  introduction: string;
  best_time_to_visit: string;
  estimated_budget: string;
  highlights: HighlightItem[];
  food: FoodItem[];
  culture: string[];
  travel_tips: string[];
  days: DayPlan[];
  error?: string;
  raw?: unknown;
};

export type TravelApiResponse = {
  result: TravelResult;
};