import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";

export function validateCoverage(
  coverage,
  latitude,
  longitude
) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    latitude === null ||
    latitude === undefined ||
    latitude === "" ||
    longitude === null ||
    longitude === undefined ||
    longitude === "" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  if (!coverage || !Array.isArray(coverage.features)) {
    return null;
  }

  const selectedPoint = point([lng, lat]);

  const isInside = coverage.features.some((feature) =>
    booleanPointInPolygon(selectedPoint, feature, {
      ignoreBoundary: false,
    })
  );

  return isInside ? "inside" : "outside";
}
