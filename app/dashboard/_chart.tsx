"use client"

import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from "recharts"

type ChartData = { day: string; bookings: number }

export function WeeklyBookingsChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis
          dataKey="day" stroke="#888888" fontSize={12}
          tickLine={false} axisLine={false}
        />
        <YAxis
          stroke="#888888" fontSize={12}
          tickLine={false} axisLine={false}
          tickFormatter={(v) => `${v}`}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="bookings" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
