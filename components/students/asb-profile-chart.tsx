"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from "recharts"

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
import { AlertCircle } from "lucide-react"

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
  console.log("[ASBProfileChart] Received props:", { studentName, scores });

  // Check if there's actual assessment data
  const hasData = scores && scores.length > 0 && scores.some(score => score.standardized_score > 0);

  // Transform the scores data for the chart
  const chartData = scores.map(score => ({
    component: score.component_name,
    componentLabel: score.component_name === "Visual Perception" ? "Visual Perception" :
                   score.component_name === "Spatial" ? "Spatial" :
                   score.component_name === "Reasoning" ? "Reasoning" :
                   score.component_name === "Numerical" ? "Numerical" :
                   score.component_name === "Gestalt" ? "Gestalt" :
                   score.component_name === "Co-ordination" ? "Co-ordination" :
                   score.component_name === "Memory" ? "Memory" :
                   score.component_name === "Verbal Comprehension" ? "Verbal Comprehension" :
                   score.component_name,
    score: score.standardized_score,
    rawScore: score.raw_score
  }));

  // Ensure the data is ordered correctly for the chart display
  const orderedComponents = [
    "Visual Perception",
    "Spatial",
    "Reasoning",
    "Numerical",
    "Gestalt",
    "Co-ordination",
    "Memory",
    "Verbal Comprehension"
  ];

  // Sort the chartData based on the ordered components
  const sortedChartData = [...chartData].sort((a, b) => {
    return orderedComponents.indexOf(a.componentLabel) - orderedComponents.indexOf(b.componentLabel);
  });

  console.log("[ASBProfileChart] Constructed chartData:", sortedChartData);

  const chartConfig = {
    score: {
      label: "Learner's Score",
      color: "hsl(210, 100%, 45%)", // Blue
    }
  };

  return (
    <Card className="w-full" id="asb-profile-chart">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{studentName}</CardTitle>
            <CardDescription>Standardized scores comparison</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <>
            <ChartContainer config={chartConfig} className="h-[320px] sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={sortedChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="componentLabel" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={12}
                    angle={-30}
                    textAnchor="end"
                    height={70}
                    interval={0}
                    fontSize={11}
                  />
                  <YAxis 
                    domain={[0, 5]} 
                    ticks={[1, 2, 3, 4, 5]} 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                  />
                  <ReferenceLine 
                    y={3} 
                    stroke="hsl(35, 100%, 60%)" 
                    strokeWidth={2} 
                    strokeDasharray="3 3" 
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
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span>Learner's Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-400"></div>
                <span>Expected Level (3)</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 h-[320px] sm:h-80 bg-gray-50 rounded-md">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Assessment Data Available</h3>
            <p className="text-sm text-gray-500 text-center">
              This learner has not completed the ASB assessment yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 