// AI features have been removed.
export const analyzeLayout = async (): Promise<any> => {
  return Promise.resolve({
    score: 0,
    critique: "AI features are disabled.",
    suggestions: []
  });
};