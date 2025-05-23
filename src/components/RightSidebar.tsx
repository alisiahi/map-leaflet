// components/RightSidebar.tsx
import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useSelectionStore } from "../store/useSelectionStore";

import { useKreiseData } from "../utils/useKreiseData";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#845EC2",
  "#FF6F91",
  "#2C73D2",
  "#FFC75F",
];

const RightSidebar: React.FC<{ colorVariable: string }> = ({
  colorVariable,
}) => {
  const kreiseData = useKreiseData();
  const selectedKreis = useSelectionStore((s) => s.selectedKreis);

  const chartData = useMemo(() => {
    if (!selectedKreis || !colorVariable || !kreiseData) return null;

    const selectedAGS = selectedKreis.ags;
    const bundeslandCode = selectedAGS.slice(0, 2);

    return kreiseData
      .filter((row) => row.AGS.slice(0, 2) === bundeslandCode)
      .map((row) => ({
        name: row.GEN,
        value: Number(row[colorVariable] as string) || 0,
      }))
      .filter((d) => d.value > 0);
  }, [selectedKreis, colorVariable, kreiseData]);

  return (
    <div className="p-4">
      {selectedKreis ? (
        <div className="flex flex-col h-screen">
          <p className="mb-4 text-blue-800">
            <strong>Selected Kreis:</strong> {selectedKreis.gen}
          </p>

          {chartData && chartData.length > 0 ? (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    label
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  {/* <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ paddingLeft: 20 }}
                  /> */}
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </div>
      ) : (
        <p>No region selected</p>
      )}
    </div>
  );
};

export default RightSidebar;
