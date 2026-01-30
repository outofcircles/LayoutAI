import { FloorPlan } from "../types";

// AI features have been removed.
export const analyzeLayout = async (floorPlan: FloorPlan): Promise<any> => {
  return Promise.resolve({
    score: 0,
    critique: "AI features are currently disabled.",
    suggestions: []
  });
};