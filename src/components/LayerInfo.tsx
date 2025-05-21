import { useEffect, useState } from "react";
import { useSelectionStore } from "../store/useSelectionStore";
import { csvParse } from "d3-dsv"; // <-- Use ES module import

const geoJsonUrl = "/kreise.geo.json";
const csvUrl = "/kreise_data.csv";

function padAGS(ags: string) {
  return ags.padStart(5, "0");
}

const LayerInfo = () => {
  const selectedKreis = useSelectionStore((s) => s.selectedKreis);
  const [geoData, setGeoData] = useState<any>(null);
  const [csvData, setCsvData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch(geoJsonUrl)
      .then((res) => res.json())
      .then((data) => setGeoData(data));
    fetch(csvUrl)
      .then((res) => res.text())
      .then((text) => {
        const parsed = csvParse(text);
        const byAGS: Record<string, any> = {};
        parsed.forEach((row: any) => {
          const ags = padAGS(row.AGS);
          byAGS[ags] = row;
        });
        setCsvData(byAGS);
      });
  }, []);

  if (!selectedKreis) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-rose-500 overflow-scroll">
        No selection
      </div>
    );
  }

  const ags = padAGS(selectedKreis.ags);
  const gen = selectedKreis.gen;
  const csvRow = csvData[ags];
  let geoFeature = null;
  if (geoData && geoData.features) {
    geoFeature = geoData.features.find(
      (f: any) => padAGS(f.properties.AGS) === ags
    );
  }

  return (
    <div className="h-full w-full flex flex-col items-start justify-start bg-rose-100 p-4 overflow-scroll">
      <h2 className="text-xl font-bold mb-2">{gen}</h2>
      <div className="mb-2 text-gray-700">AGS: {ags}</div>
      {csvRow && (
        <div className="mb-4">
          <h3 className="font-semibold mb-1">CSV Data</h3>
          <table className="table-auto border-collapse w-full">
            <tbody>
              {Object.entries(csvRow).map(([key, value]) => (
                <tr key={key}>
                  <td className="border px-2 py-1 font-semibold">{key}</td>
                  <td className="border px-2 py-1">{value as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {geoFeature && (
        <div>
          <h3 className="font-semibold mb-1">GeoJSON Properties</h3>
          <table className="table-auto border-collapse w-full">
            <tbody>
              {Object.entries(geoFeature.properties).map(([key, value]) => (
                <tr key={key}>
                  <td className="border px-2 py-1 font-semibold">{key}</td>
                  <td className="border px-2 py-1">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LayerInfo;
