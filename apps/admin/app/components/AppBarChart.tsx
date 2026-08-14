"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

const chartConfig = {
  total: {
    label: "Total Orders",
    color: "var(--chart-1)",
  },
  successful: {
    label: "Paid",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export type RevenuePoint = { month: string; total: number; successful: number };

const AppBarChart = ({ data }: { data: RevenuePoint[] }) => {
  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">Orders (Last 6 Months)</h1>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <ChartContainer config={chartConfig} className="min-h-50 w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis tickLine={false} tickMargin={10} axisLine={false} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            <Bar dataKey="successful" fill="var(--color-successful)" radius={4} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
};

export default AppBarChart;
