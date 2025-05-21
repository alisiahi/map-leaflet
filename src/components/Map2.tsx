import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMapEvent } from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Legend from "./Legend";
import { csvParse } from "d3-dsv";

function getColorFromValue(value: number, min: number, max: number) {
  const t = (value - min) / (max - min);
  const norm = Math.max(0, Math.min(1, t));
  const lightBlue = [219, 234, 254]; // Tailwind blue-100
  const darkBlue = [30, 64, 175]; // Tailwind blue-800
  const rgb = lightBlue.map((l, i) => Math.round(l + (darkBlue[i] - l) * norm));
  return `rgb(${rgb.join(",")})`;
}

function highlightLayer(layer: L.Layer, weight = 5) {
  if ((layer as L.Path).setStyle) {
    (layer as L.Path).setStyle({ weight });
  }
}

function ZoomListener({ onZoom }: { onZoom: (zoom: number) => void }) {
  useMapEvent("zoomend", (e) => {
    onZoom(e.target.getZoom());
  });
  return null;
}

export default function Map({ onSelectFeature }) {
  const [zoom, setZoom] = useState<number>(6);
  const [kreisGeo, setKreisGeo] = useState<GeoJsonObject | null>(null);
  const [csvData, setCsvData] = useState<Record<string, any>>({});
  const [colorVariable, setColorVariable] = useState<
    "question_01" | "question_02"
  >("question_01");
  const [valueMinMax, setValueMinMax] = useState<[number, number] | null>(null);

  const selectedLayerRef = useRef<L.Layer | null>(null);

  // Load GeoJSON and CSV
  useEffect(() => {
    fetch("/kreise.geo.json")
      .then((res) => res.json())
      .then((data) => {
        setKreisGeo(data);
      });

    fetch("/kreise_data.csv")
      .then((res) => res.text())
      .then((text) => {
        const parsed = csvParse(text);
        // Index by AGS for fast lookup, pad to 5 digits
        const byAGS: Record<string, any> = {};
        parsed.forEach((row) => {
          // Pad AGS to 5 digits (e.g., "1001" => "01001")
          const ags = row.AGS.padStart(5, "0");
          byAGS[ags] = row;
        });
        setCsvData(byAGS);
      });
  }, []);

  // Compute min/max for selected variable
  useEffect(() => {
    if (!kreisGeo || !csvData) return;
    const values: number[] = [];
    (kreisGeo as any).features.forEach((f: any) => {
      const ags = f.properties.AGS;
      const row = csvData[ags];
      if (row && row[colorVariable] !== undefined) {
        const num = Number(row[colorVariable]);
        if (!isNaN(num)) values.push(num);
      }
    });
    if (values.length > 0) {
      setValueMinMax([Math.min(...values), Math.max(...values)]);
    }
  }, [kreisGeo, csvData, colorVariable]);

  // Style function using CSV data
  const geoStyleKreise = (feature: any) => {
    if (!valueMinMax) return {};
    const ags = feature.properties.AGS;
    const row = csvData[ags];
    let color = "#eee";
    if (row && row[colorVariable] !== undefined) {
      const value = Number(row[colorVariable]);
      if (!isNaN(value)) {
        color = getColorFromValue(value, valueMinMax[0], valueMinMax[1]);
      }
    }
    return {
      color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.7,
    };
  };

  // Feature interaction handler
  function createOnEachFeature(type: "Kreis") {
    return (feature: any, layer: L.Layer) => {
      const name = feature.properties.GEN;
      const ags = feature.properties.AGS;
      const row = csvData[ags];
      let tooltip = name;
      if (row) {
        tooltip += ` (${colorVariable}: ${row[colorVariable]})`;
      }
      layer.bindTooltip(tooltip, {
        permanent: false,
        direction: "top",
        sticky: true,
      });

      layer.on("click", () => {
        if (onSelectFeature) {
          onSelectFeature({ type, properties: feature.properties, csv: row });
        }
        if (selectedLayerRef.current) {
          highlightLayer(selectedLayerRef.current, 2);
        }
        highlightLayer(layer, 5);
        selectedLayerRef.current = layer;
      });
    };
  }

  return (
    <>
      {/* Variable selector */}
      <div className="absolute top-4 left-4 z-[1000] bg-white bg-opacity-90 rounded p-2 shadow">
        <label className="mr-2 font-bold">Color by:</label>
        <select
          value={colorVariable}
          onChange={(e) =>
            setColorVariable(e.target.value as "question_01" | "question_02")
          }
          className="border rounded px-2 py-1"
        >
          <option value="question_01">Question 01</option>
          <option value="question_02">Question 02</option>
        </select>
      </div>
      <MapContainer
        center={[51.1657, 10.4515]}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          url="https://tiles.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <ZoomListener onZoom={setZoom} />
        {kreisGeo && (
          <GeoJSON
            data={kreisGeo}
            style={geoStyleKreise}
            onEachFeature={createOnEachFeature("Kreis")}
          />
        )}
      </MapContainer>
      {valueMinMax && (
        <Legend
          min={valueMinMax[0]}
          max={valueMinMax[1]}
          colorFunc={(v) =>
            getColorFromValue(Number(v), valueMinMax[0], valueMinMax[1])
          }
          label={colorVariable}
        />
      )}
    </>
  );
}
