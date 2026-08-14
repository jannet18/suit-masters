"use client";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export type StatusPoint = { status: string; count: number };

const AppPieChart = ({ data }: { data: StatusPoint[] }) => {
  const chartData = data.map((d, i) => ({
    status: d.status,
    count: d.count,
    fill: PALETTE[i % PALETTE.length],
  }));

  const chartConfig = chartData.reduce((config, d, i) => {
    config[d.status] = { label: d.status, color: PALETTE[i % PALETTE.length] };
    return config;
  }, {} as ChartConfig);

  const totalOrders = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">Orders by Status</h1>
      {chartData.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <>
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalOrders.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Orders
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-4 flex flex-wrap gap-3 items-center justify-center text-xs text-muted-foreground">
            {chartData.map((d) => (
              <div key={d.status} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: d.fill }}
                />
                {d.status} ({d.count})
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AppPieChart;
