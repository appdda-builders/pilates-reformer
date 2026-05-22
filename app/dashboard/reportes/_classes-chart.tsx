"use client"

import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend,
} from "recharts"

type ChartData = { month: string; regular: number; totalPass: number }

export function ClassesBarChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">Sin datos para el periodo</p>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barCategoryGap="25%">
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Bar dataKey="regular" name="Regulares" fill="#1b2d6e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="totalPass" name="Total Pass" fill="#16a34a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
