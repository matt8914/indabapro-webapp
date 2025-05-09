"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, TooltipProps } from "recharts"

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

// Define the structure of academic age data
interface AcademicAgeData {
  grade: string;
  mathsAge: string | null;
  readingAge: string | null;
  spellingAge: string | null;
}

interface ProgressOverviewChartProps {
  studentName: string;
  academicAgeData: AcademicAgeData[];
}

export function ProgressOverviewChart({ studentName, academicAgeData }: ProgressOverviewChartProps) {
  console.log("[ProgressOverviewChart] Received props:", { studentName, academicAgeData });

  // Transform the data for the chart
  const chartData = academicAgeData.map(data => {
    // Convert string ages to numeric values for the chart
    const mathsAgeNum = data.mathsAge ? parseFloat(data.mathsAge) : null;
    const readingAgeNum = data.readingAge ? parseFloat(data.readingAge) : null;
    const spellingAgeNum = data.spellingAge ? parseFloat(data.spellingAge) : null;

    return {
      grade: data.grade,
      mathsAge: mathsAgeNum,
      readingAge: readingAgeNum,
      spellingAge: spellingAgeNum,
      // Store original string values for tooltips
      mathsAgeLabel: data.mathsAge,
      readingAgeLabel: data.readingAge,
      spellingAgeLabel: data.spellingAge
    };
  });

  console.log("[ProgressOverviewChart] Constructed chartData:", chartData);

  const chartConfig = {
    mathsAge: {
      label: "Maths Age",
      color: "hsl(210, 100%, 45%)", // Blue
    },
    readingAge: {
      label: "Reading Age",
      color: "hsl(340, 70%, 50%)", // Pink
    },
    spellingAge: {
      label: "Spelling Age",
      color: "hsl(130, 70%, 40%)", // Green
    },
  };
  
  // Get min and max ages for axis scale
  const allAges = chartData
    .flatMap(d => [d.mathsAge, d.readingAge, d.spellingAge])
    .filter(age => age !== null) as number[];
    
  const minAge = Math.max(6, Math.floor(Math.min(...allAges, 6)));
  const maxAge = Math.min(14, Math.ceil(Math.max(...allAges, 14)));

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>{studentName}</CardTitle>
        <CardDescription>Academic age progression over grades</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                dataKey="grade" 
                tickLine={false} 
                axisLine={true}
                tickMargin={8}
                label={{ value: 'Grade', position: 'insideBottom', offset: -15 }}
              />
              <YAxis 
                domain={[minAge, maxAge]} 
                tickLine={false} 
                axisLine={true} 
                tickMargin={8}
                label={{ value: 'Age', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Line
                dataKey="mathsAge"
                type="monotone"
                stroke="var(--color-mathsAge)"
                strokeWidth={2}
                connectNulls={true}
                dot={{
                  fill: "var(--color-mathsAge)",
                  r: 5,
                }}
                activeDot={{
                  r: 7,
                }}
              />
              <Line
                dataKey="readingAge"
                type="monotone"
                stroke="var(--color-readingAge)"
                strokeWidth={2}
                connectNulls={true}
                dot={{
                  fill: "var(--color-readingAge)",
                  r: 5,
                }}
                activeDot={{
                  r: 7,
                }}
              />
              <Line
                dataKey="spellingAge"
                type="monotone"
                stroke="var(--color-spellingAge)"
                strokeWidth={2}
                connectNulls={true}
                dot={{
                  fill: "var(--color-spellingAge)",
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
            <span>Maths Age</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(340, 70%, 50%)" }}></div>
            <span>Reading Age</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(130, 70%, 40%)" }}></div>
            <span>Spelling Age</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 