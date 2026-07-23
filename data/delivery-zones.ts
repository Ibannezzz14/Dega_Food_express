export const DELIVERY_ZONES = {
  lausanne: {
    label: "Lausanne",
    selectionLabel: "Lausanne",
    phone: "41782654081",
    radiusKm: 10,
    center: {
      latitude: 46.520008,
      longitude: 6.630101,
    },
  },
  lucens: {
    label: "Lucens",
    selectionLabel: "Lucens & alentours",
    phone: "41766036011",
    radiusKm: 25,
    center: {
      latitude: 46.708527,
      longitude: 6.836576,
    },
  },
} as const;

export type RegionId = keyof typeof DELIVERY_ZONES;

export type DeliveryZoneResult =
  | {
      status: "eligible";
      region: RegionId;
      distanceKm: number;
    }
  | {
      status: "outside";
      region: RegionId;
      distanceKm: number;
      suggestedRegion: RegionId | null;
    }
  | {
      status: "not_found";
    }
  | {
      status: "service_error";
    };

type Coordinates = {
  latitude: number;
  longitude: number;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceInKilometers(
  from: Coordinates,
  to: Coordinates,
) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  const boundedHaversine = Math.min(1, Math.max(0, haversine));

  return (
    earthRadiusKm *
    2 *
    Math.atan2(
      Math.sqrt(boundedHaversine),
      Math.sqrt(1 - boundedHaversine),
    )
  );
}

export function distanceFromDeliveryZone(
  region: RegionId,
  coordinates: Coordinates,
) {
  return distanceInKilometers(DELIVERY_ZONES[region].center, coordinates);
}

export function findEligibleDeliveryZone(coordinates: Coordinates) {
  return (Object.keys(DELIVERY_ZONES) as RegionId[]).find(
    (region) =>
      distanceFromDeliveryZone(region, coordinates) <=
      DELIVERY_ZONES[region].radiusKm,
  );
}
