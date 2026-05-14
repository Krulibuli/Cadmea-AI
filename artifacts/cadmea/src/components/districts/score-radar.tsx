import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface ScoreRadarProps {
  scores?: {
    safety: number;
    family: number;
    affordability: number;
    environment: number;
    transport: number;
    tourism: number;
    walkability: number;
  } | null;
  className?: string;
  color?: string;
}

const fallbackScores = {
  safety: 5,
  family: 5,
  affordability: 5,
  environment: 5,
  transport: 5,
  tourism: 5,
  walkability: 5,
};

export function ScoreRadar({ scores, className, color = "hsl(var(--primary))" }: ScoreRadarProps) {
  const safeScores = scores ?? fallbackScores;
  const data = [
    { subject: "Safety", A: safeScores.safety, fullMark: 10 },
    { subject: "Family", A: safeScores.family, fullMark: 10 },
    { subject: "Afford", A: safeScores.affordability, fullMark: 10 },
    { subject: "Nature", A: safeScores.environment, fullMark: 10 },
    { subject: "Transit", A: safeScores.transport, fullMark: 10 },
    { subject: "Tourism", A: safeScores.tourism, fullMark: 10 },
    { subject: "Walk", A: safeScores.walkability, fullMark: 10 },
  ];

  return (
    <div className={`w-full aspect-square ${className || ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke={color}
            fill={color}
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
