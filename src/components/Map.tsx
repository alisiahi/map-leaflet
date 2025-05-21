import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMapEvent } from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Highlight utility
function highlightLayer(layer: L.Layer, weight = 5) {
  if ((layer as L.Path).setStyle) {
    (layer as L.Path).setStyle({ weight });
  }
}

// Zoom listener component
function ZoomListener({ onZoom }: { onZoom: (zoom: number) => void }) {
  useMapEvent("zoomend", (e) => {
    onZoom(e.target.getZoom());
  });
  return null;
}

export default function Map({ onSelectFeature }) {
  const [zoom, setZoom] = useState<number>(6);
  const [bundesGeo, setBundesGeo] = useState<GeoJsonObject | null>(null);
  const [kreisGeo, setKreisGeo] = useState<GeoJsonObject | null>(null);
  const [gemeindeGeo, setGemeindeGeo] = useState<GeoJsonObject | null>(null);

  // Use ref instead of state for selected layer (avoids async problem)
  const selectedLayerRef = useRef<L.Layer | null>(null);

  // Load GeoJSONs
  useEffect(() => {
    fetch("/bundeslaender.geo.json")
      .then((res) => res.json())
      .then(setBundesGeo);

    fetch("/kreise.geo.json")
      .then((res) => res.json())
      .then(setKreisGeo);

    fetch("/gemeinde.geo.json")
      .then((res) => res.json())
      .then(setGemeindeGeo);
  }, []);

  // Style definitions
  const geoStyleKreise = () => ({
    color: "#f43f5e",
    weight: 2,
    fillColor: "#f43f5e",
    fillOpacity: 0.3,
  });

  const geoStyleGemeinde = () => ({
    color: "#2563eb",
    weight: 2,
    fillColor: "#2563eb",
    fillOpacity: 0.3,
  });

  // Reusable feature interaction handler
  function createOnEachFeature(type: "Kreis" | "Gemeinde") {
    return (feature: any, layer: L.Layer) => {
      const name = feature.properties.GEN;

      layer.bindTooltip(name, {
        permanent: false,
        direction: "top",
        sticky: true,
      });

      layer.on("click", () => {
        console.log(`Selected ${type}:`, feature.properties);
        if (onSelectFeature) {
          onSelectFeature({ type, properties: feature.properties });
        }
        // Reset previous
        if (selectedLayerRef.current) {
          highlightLayer(selectedLayerRef.current, 2);
        }

        // Highlight new and store it
        highlightLayer(layer, 5);
        selectedLayerRef.current = layer;
      });
    };
  }

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

        {/* Kreise */}
        {zoom < 10 && kreisGeo && (
          <GeoJSON
            data={kreisGeo}
            style={geoStyleKreise}
            onEachFeature={createOnEachFeature("Kreis")}
          />
        )}

        {/* Gemeinden */}
        {zoom >= 10 && gemeindeGeo && (
          <GeoJSON
            data={gemeindeGeo}
            style={geoStyleGemeinde}
            onEachFeature={createOnEachFeature("Gemeinde")}
          />
        )}
      </MapContainer>
    </>
  );
}
