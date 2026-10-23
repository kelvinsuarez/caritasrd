import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";

import coverageUrl from "../data/coverage.geojson?url";
import "leaflet/dist/leaflet.css";

const selectedIcon = L.divIcon({
  className: "coverage-map__selected-marker",
  html: '<span class="coverage-map__pin">📍</span>',
  iconSize: [32, 38],
  iconAnchor: [16, 36],
});

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng);
    },
  });

  return null;
}

export default function CoverageMap() {
  const [coverage, setCoverage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(coverageUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudo cargar el mapa de cobertura");
        }
        return response.json();
      })
      .then((data) => setCoverage(data))
      .catch((error) => console.error(error));
  }, []);
  const handleSelectLocation = (latlng) => {
    const locationPoint = point([latlng.lng, latlng.lat]);
    
    if (!coverage?.features) return;
    
    const isCovered = coverage.features.some((feature) =>
      booleanPointInPolygon(locationPoint, feature, {
        ignoreBoundary: false,
      })
    );

    setSelectedLocation(latlng);
    setResult(isCovered ? "inside" : "outside");
  };

  return (
    <div className="coverage-map">
      <p className="coverage-map__instruction">
        Toca el mapa en el lugar donde será tu celebración.
      </p>

      <MapContainer
        center={[18.478, -69.936]}
        zoom={12}
        scrollWheelZoom={false}
        className="coverage-map__canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {coverage && (
            <GeoJSON
                data={coverage}
                style={{
                color: "#ec1763",
                weight: 3,
                fillColor: "#ffc1d6",
                fillOpacity: 0.4,
            }}
        />
    )}

        <MapClickHandler onSelect={handleSelectLocation} />

        {selectedLocation && (
          <Marker
            position={selectedLocation}
            icon={selectedIcon}
          />
        )}
      </MapContainer>

      {result === "inside" && (
        <div className="coverage-map__result coverage-map__result--inside">
          <strong>¡Tu celebración está dentro de nuestra zona!</strong>
          <p>
            Según el mapa provisional, el transporte está incluido.
            Confirmaremos la dirección al reservar.
          </p>
        </div>
      )}

      {result === "outside" && (
        <div className="coverage-map__result coverage-map__result--outside">
          <strong>¡También podemos llevar alegría hasta ti!</strong>
          <p>
            Tu ubicación está fuera del perímetro provisional.
            El transporte se cotizará según la dirección.
          </p>
        </div>
      )}

      <p className="coverage-map__disclaimer">
        Cobertura orientativa. La confirmación definitiva se realiza
        al validar la dirección del evento.
      </p>
    </div>
  );
}