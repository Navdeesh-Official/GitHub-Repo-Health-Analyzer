"use client";

import { BarChart, Bar, ResponsiveContainer, Tooltip } from "recharts";

interface ActivityGraphProps {
    data: number[];
}

export function ActivityGraph({ data }: ActivityGraphProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm italic">
                No activity data available
            </div>
        );
    }

    // Transform data for Recharts (last 52 weeks)
    // We want to show maybe the last 26 weeks to avoid crowding?
    // Let's show all but maybe filter zeros if it's too sparse? No, showing zeros is important.
    const chartData = data.slice(-52).map((count, index) => ({
        week: index,
        commits: count
    }));

    return (
        <div className="h-40 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '8px',
                            color: '#f8fafc'
                        }}
                        itemStyle={{ color: '#818cf8' }}
                        labelStyle={{ display: 'none' }}
                        cursor={{ fill: '#1e293b', opacity: 0.5 }}
                    />
                    <Bar
                        dataKey="commits"
                        fill="#6366f1"
                        radius={[2, 2, 0, 0]}
                        maxBarSize={8}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
