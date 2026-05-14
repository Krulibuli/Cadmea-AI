import { motion } from "framer-motion";
import { getScoreColor } from "@/lib/score-color";

interface ScoreBarProps {
  label: string;
  score?: number | null;
  max?: number;
  className?: string;
  delay?: number;
}

export function ScoreBar({ label, score, max = 10, className = "", delay = 0 }: ScoreBarProps) {
  const safeScore = typeof score === "number" && Number.isFinite(score) ? score : 5;
  const percentage = Math.max(0, Math.min(100, (safeScore / max) * 100));
  const color = getScoreColor(safeScore);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between items-end text-sm">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-bold">{safeScore.toFixed(1)}</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
