"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Legend,
  PieChart as RechartsPieChart,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
} from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart";

interface ChartDataset {
  label?: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string | string[];
  fill?: boolean;
  tension?: number;
  borderRadius?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: "top" | "bottom" | "left" | "right";
      labels?: {
        usePointStyle?: boolean;
        padding?: number;
      };
    };
  };
  scales?: {
    x?: {
      grid?: {
        display?: boolean;
      };
    };
    y?: {
      beginAtZero?: boolean;
      min?: number;
      grid?: {
        color?: string;
      };
      ticks?: {
        callback?: (value: number | string) => string;
        stepSize?: number;
      };
    };
  };
}

interface CommonChartProps {
  data: ChartData;
  options?: ChartOptions;
  className?: string;
}

// Convert chart.js style data to recharts format
function convertDataToRechartsFormat(chartData: ChartData) {
  const { labels, datasets } = chartData;

  // Create an array of objects where each object represents a data point
  return labels.map((label, index) => {
    const dataPoint: Record<string, string | number> = {
      name: label,
    };

    // Add values from each dataset
    datasets.forEach((dataset, datasetIndex) => {
      const dataKey = dataset.label ?? `data${datasetIndex}`;
      dataPoint[dataKey] = dataset.data[index];
    });

    return dataPoint;
  });
}

// Function to format y-axis tick values
function formatYAxisTick(options?: ChartOptions) {
  if (!options?.scales?.y?.ticks?.callback) return undefined;

  return (value: number | string) => {
    if (typeof value === "number") {
      // Safely invoke the callback
      const callback = options.scales?.y?.ticks?.callback;
      if (callback) {
        return callback(value);
      }
    }
    return String(value);
  };
}

export function LineChart({ data, options, className }: CommonChartProps) {
  const rechartsData = convertDataToRechartsFormat(data);
  const formatTick = formatYAxisTick(options);

  const config = data.datasets.reduce((acc, dataset, index) => {
    const key = dataset.label ?? `data${index}`;
    return {
      ...acc,
      [key]: {
        label: dataset.label,
        color: dataset.borderColor ?? `hsl(var(--chart-${index + 1}))`,
      },
    };
  }, {});

  return (
    <ChartContainer className={className} config={config}>
      <RechartsLineChart data={rechartsData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={formatTick}
          domain={[options?.scales?.y?.min ?? "auto", "auto"]}
          minTickGap={5}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend
          verticalAlign={
            options?.plugins?.legend?.position === "bottom" ? "bottom" : "top"
          }
          align={
            options?.plugins?.legend?.position === "right" ? "right" : "center"
          }
          wrapperStyle={{
            display:
              options?.plugins?.legend?.display === false ? "none" : "block",
          }}
        />
        {data.datasets.map((dataset, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={dataset.label ?? `data${index}`}
            stroke={dataset.borderColor ?? `hsl(var(--chart-${index + 1}))`}
            fill={
              dataset.fill
                ? typeof dataset.backgroundColor === "string"
                  ? dataset.backgroundColor
                  : `hsla(var(--chart-${index + 1}), 0.1)`
                : "none"
            }
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
}

export function BarChart({ data, options, className }: CommonChartProps) {
  const rechartsData = convertDataToRechartsFormat(data);
  const formatTick = formatYAxisTick(options);

  const config = data.datasets.reduce((acc, dataset, index) => {
    const key = dataset.label ?? `data${index}`;
    return {
      ...acc,
      [key]: {
        label: dataset.label,
        color: dataset.backgroundColor ?? `hsl(var(--chart-${index + 1}))`,
      },
    };
  }, {});

  return (
    <ChartContainer className={className} config={config}>
      <RechartsBarChart data={rechartsData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={formatTick}
          domain={[options?.scales?.y?.min ?? 0, "auto"]}
          minTickGap={5}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend
          verticalAlign={
            options?.plugins?.legend?.position === "bottom" ? "bottom" : "top"
          }
          align={
            options?.plugins?.legend?.position === "right" ? "right" : "center"
          }
          wrapperStyle={{
            display:
              options?.plugins?.legend?.display === false ? "none" : "block",
          }}
        />
        {data.datasets.map((dataset, index) => {
          // Get the fill color - handle both string and array types
          const fillColor =
            typeof dataset.backgroundColor === "string"
              ? dataset.backgroundColor
              : `hsl(var(--chart-${index + 1}))`;

          return (
            <Bar
              key={index}
              dataKey={dataset.label ?? `data${index}`}
              fill={fillColor}
              radius={dataset.borderRadius ?? 0}
              barSize={30}
            />
          );
        })}
      </RechartsBarChart>
    </ChartContainer>
  );
}

export function PieChart({ data, options, className }: CommonChartProps) {
  // For Pie charts, we need a different data format
  const pieData = data.datasets[0].data.map((value, index) => ({
    name: data.labels[index],
    value,
  }));

  const colors = Array.isArray(data.datasets[0].backgroundColor)
    ? data.datasets[0].backgroundColor
    : data.labels.map((_, index) => `hsl(var(--chart-${index + 1}))`);

  const config = data.labels.reduce((acc, label, index) => {
    return {
      ...acc,
      [label]: {
        label,
        color: Array.isArray(colors) ? colors[index] : colors,
      },
    };
  }, {});

  return (
    <ChartContainer className={className} config={config}>
      <RechartsPieChart>
        <Legend
          verticalAlign={
            options?.plugins?.legend?.position === "bottom" ? "bottom" : "top"
          }
          align={
            options?.plugins?.legend?.position === "right" ? "right" : "left"
          }
          wrapperStyle={{
            display:
              options?.plugins?.legend?.display === false ? "none" : "block",
          }}
          layout={
            options?.plugins?.legend?.position === "right" ||
            options?.plugins?.legend?.position === "left"
              ? "vertical"
              : "horizontal"
          }
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={0}
          paddingAngle={2}
          label
        >
          {pieData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                Array.isArray(colors) ? colors[index % colors.length] : colors
              }
            />
          ))}
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  );
}
