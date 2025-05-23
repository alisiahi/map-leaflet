import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { csvParse } from "d3-dsv";
import { useSelectionStore } from "../store/useSelectionStore";

function getColorFromValue(value, min, max) {
  const t = (value - min) / (max - min);
  const norm = Math.max(0, Math.min(1, t));
  const lightBlue = [219, 234, 254];
  const darkBlue = [30, 64, 175];
  const rgb = lightBlue.map((l, i) => Math.round(l + (darkBlue[i] - l) * norm));
  return `rgb(${rgb.join(",")})`;
}

function ZoomListener({ onZoom }) {
  useMapEvent("zoomend", (e) => {
    onZoom(e.target.getZoom());
  });
  return null;
}

export default function MapView({ colorVariable }) {
  const [zoom, setZoom] = useState(6);
  const [kreisGeo, setKreisGeo] = useState(null);
  const [csvData, setCsvData] = useState({});
  const [valueMinMax, setValueMinMax] = useState(null);

  const geoJsonRef = useRef();
  const selectedKreis = useSelectionStore((s) => s.selectedKreis);
  const setSelectedKreis = useSelectionStore((s) => s.setSelectedKreis);

  useEffect(() => {
    fetch("/kreise.geo.json")
      .then((res) => res.json())
      .then((data) => setKreisGeo(data));

    fetch("/kreise_data.csv")
      .then((res) => res.text())
      .then((text) => {
        const parsed = csvParse(text);
        const byAGS = {};
        parsed.forEach((row) => {
          const ags = row.AGS.padStart(5, "0");
          byAGS[ags] = row;
        });
        setCsvData(byAGS);
      });
  }, []);

  useEffect(() => {
    if (!kreisGeo || !csvData) return;
    const values = [];
    kreisGeo.features.forEach((f) => {
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

  // Style function using CSV data and selection
  const geoStyleKreise = (feature) => {
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
    const isSelected = selectedKreis && ags === selectedKreis.ags;
    return {
      color: isSelected ? "#1e40af" : "#fff",
      weight: isSelected ? 3 : 1,
      fillColor: color,
      fillOpacity: 0.6,
    };
  };

  // Feature interaction handler
  function createOnEachFeature(type) {
    return (feature, layer) => {
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
        const current = useSelectionStore.getState().selectedKreis;
        if (current && current.ags === ags) {
          useSelectionStore.getState().clearSelectedKreis(); // Deselect if already selected
        } else {
          setSelectedKreis({ ags, gen: name }); // Select new one
        }
      });
    };
  }

  // bringToFront for selected Kreis after render
  useEffect(() => {
    if (!geoJsonRef.current || !selectedKreis) return;

    const frame = requestAnimationFrame(() => {
      const layers = geoJsonRef.current.getLayers();
      layers.forEach((layer) => {
        if (
          layer.feature &&
          layer.feature.properties.AGS === selectedKreis.ags &&
          layer.bringToFront
        ) {
          layer.bringToFront();
        }
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedKreis, kreisGeo, colorVariable]);

  return (
    <>
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
            key={colorVariable}
            data={kreisGeo}
            style={geoStyleKreise}
            onEachFeature={createOnEachFeature("Kreis")}
            ref={geoJsonRef}
          />
        )}
      </MapContainer>
    </>
  );
}
