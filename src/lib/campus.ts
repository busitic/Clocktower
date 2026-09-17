/*
  CAMPUS DISTANCE CALCULATIONS
  ----------------------------
  Every property's distance to Edge Hill is derived from its coordinates,
  never typed in by a landlord. That means a landlord can't claim a house in
  Skelmersdale is "5 minutes from campus" — the data decides.
*/

// Edge Hill University main campus, St Helens Road, Ormskirk L39 4QP.
// Approximate centre of campus. Verify on Google Maps and adjust if you
// want a different anchor point (e.g. the Hub, or the main entrance).
export const CAMPUS = {
  name: "Edge Hill University",
  latitude: 53.5627,
  longitude: -2.8759,
} as const;

// Average adult walking speed, metres per minute (~4.8 km/h).
const WALK_METRES_PER_MIN = 80;
// Relaxed cycling speed, metres per minute (~15 km/h).
const CYCLE_METRES_PER_MIN = 250;

/*
  Straight-line distance ignores the fact that you can't walk through
  buildings. Real walking routes are typically 25–35% longer than the
  crow-flies distance in a town like Ormskirk. We apply a 1.3 multiplier
  so our estimates are honest rather than flattering.

  (In Phase 11 we could replace this with the Mapbox Directions API for
  true routed distances. This is a deliberate, documented approximation —
  worth saying so in your README.)
*/
const STREET_DETOUR_FACTOR = 1.3;

const EARTH_RADIUS_METRES = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Haversine formula: great-circle distance between two lat/lng points.
 * Returns metres. Accurate to well under a metre at these distances.
 */
export function haversineMetres(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METRES * c;
}

export interface CampusDistance {
  distanceMetres: number;
  walkMinutes: number;
  cycleMinutes: number;
}

/**
 * Given a property's coordinates, work out its distance and travel times
 * to campus. Call this whenever a property is created or its address changes.
 */
export function calculateCampusDistance(
  latitude: number,
  longitude: number,
): CampusDistance {
  const straightLine = haversineMetres(
    latitude,
    longitude,
    CAMPUS.latitude,
    CAMPUS.longitude,
  );

  const walkingDistance = straightLine * STREET_DETOUR_FACTOR;

  return {
    distanceMetres: Math.round(walkingDistance),
    // Math.max(1, …) so a property on campus doorstep shows "1 min", not "0 min".
    walkMinutes: Math.max(1, Math.round(walkingDistance / WALK_METRES_PER_MIN)),
    cycleMinutes: Math.max(
      1,
      Math.round(walkingDistance / CYCLE_METRES_PER_MIN),
    ),
  };
}

/**
 * Turns walk minutes into a short badge label for the UI.
 * Beyond 30 minutes, walking stops being the useful frame of reference.
 */
export function formatCampusDistance(
  walkMinutes: number | null,
  cycleMinutes: number | null,
): string {
  if (walkMinutes === null) return "Distance unknown";
  if (walkMinutes <= 30) return `${walkMinutes} min walk to campus`;
  if (cycleMinutes !== null) return `${cycleMinutes} min cycle to campus`;
  return "Off-campus";
}

/** Distance bands used by the search filter. */
export const DISTANCE_BANDS = [
  { slug: "5", label: "Under 5 min walk", maxWalkMinutes: 5 },
  { slug: "10", label: "Under 10 min walk", maxWalkMinutes: 10 },
  { slug: "20", label: "Under 20 min walk", maxWalkMinutes: 20 },
  { slug: "30", label: "Under 30 min walk", maxWalkMinutes: 30 },
] as const;