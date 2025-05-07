"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis, ReferenceLine } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Define the structure of ASB test scores
interface ASBScore {
  component_name: string;
  raw_score: number;
  standardized_score: number;
}

interface ASBProfileChartProps {
  studentName: string;
  scores: ASBScore[];
}

export function ASBProfileChart({ studentName, scores }: ASBProfileChartProps) {
  // Transform the scores data for the chart
  const chartData = scores.map(score => ({
    component: score.component_name,
    // Display friendly names for chart labels
    componentLabel: score.component_name === "Visual Perception" ? "Perception" : 
                   score.component_name === "Verbal Comprehension" ? "Verbal" : 
                   score.component_name === "Co-ordination" ? "Co-ordination" : 
                   score.component_name,
    score: score.standardized_score,
    rawScore: score.raw_score
  }));

  const chartConfig = {
    score: {
      label: "Learner's Score",
      color: "hsl(210, 100%, 45%)", // Blue
    },
    average: {
      label: "Average Score",
      color: "hsl(35, 100%, 60%)", // Orange
    },
  };

  // Calculate average (typically 3 but can be configurable)
  const averageScore = 3;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>ASB TEST PROFILE</CardTitle>
        <CardDescription>{studentName}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis 
              dataKey="componentLabel" 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8}
            />
            <YAxis 
              domain={[0, 5]} 
              ticks={[1, 2, 3, 4, 5]} 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8}
            />
            <ReferenceLine 
              y={averageScore} 
              stroke="var(--color-average)" 
              strokeDasharray="3 3" 
              strokeWidth={2}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Line
              dataKey="score"
              type="monotone"
              stroke="var(--color-score)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-score)",
                r: 5,
              }}
              activeDot={{
                r: 7,
              }}
            />
          </LineChart>
        </ChartContainer>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span>Learner's Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-400"></div>
            <span>Average Score</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 