export function getScoreColor(score: number): string {
  if (score >= 8) return "hsl(142, 60%, 45%)"; // Green
  if (score >= 6) return "hsl(45, 90%, 50%)"; // Yellow/Amber
  if (score >= 4) return "hsl(30, 90%, 55%)"; // Orange
  return "hsl(0, 84%, 60%)"; // Red
}

export function getScoreBgColor(score: number): string {
  if (score >= 8) return "bg-green-500/10 text-green-600 dark:text-green-400";
  if (score >= 6) return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
  if (score >= 4) return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
  return "bg-red-500/10 text-red-600 dark:text-red-400";
}
