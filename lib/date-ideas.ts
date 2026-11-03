/** Editorial suggestions from the visitor's explicit choice, never member matching. */
const allIdeaIds = ["cafe", "dinner", "culture", "activity", "walk", "getaway"] as const;

export function recommendedIdeaIds(context: string): readonly string[] {
  if (context === "first") return ["cafe", "walk"];
  if (context === "shared") return ["culture", "activity", "walk"];
  return allIdeaIds;
}
