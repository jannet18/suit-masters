"use client";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  count: {
    label: "New Customers",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export type CustomerPoint = { month: string; count: number };

const AppAreaChart = ({ data }: { data: CustomerPoint[] }) => {
  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">New Customers (Last 6 Months)</h1>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No customers yet.</p>
      ) : (
        <ChartContainer config={chartConfig} className="min-h-50 w-full">
          <AreaChart accessibilityLayer data={data}>
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
            <defs>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="count"
              type="natural"
              fill="url(#fillCount)"
              fillOpacity={0.4}
              stroke="var(--color-count)"
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
};

export default AppAreaChart;
