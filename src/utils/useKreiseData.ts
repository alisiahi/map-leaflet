// hooks/useKreiseData.ts
import { useEffect, useState } from "react";
import Papa from "papaparse";
import type KreisData from "./types";

export function useKreiseData(): KreisData[] | null {
  const [data, setData] = useState<KreisData[] | null>(null);

  useEffect(() => {
    fetch("/kreise_data.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse<KreisData>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            // Post-process AGS to ensure 5 digits
            const fixedData = result.data.map((row) => ({
              ...row,
              AGS: row.AGS ? String(row.AGS).padStart(5, "0") : "",
            }));
            setData(fixedData);
          },
        });
      });
  }, []);

  return data;
}
