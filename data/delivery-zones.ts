import { DELIVERY_SETTINGS } from "../config/site-config.ts";

export const DELIVERY_REGION_IDS = ["lucens"] as const;

export type RegionId = (typeof DELIVERY_REGION_IDS)[number];

type DeliveryAnchor = {
  id: string;
  label: string;
  center: {
    latitude: number;
    longitude: number;
  };
};

type DeliveryZone = {
  label: string;
  selectionLabel: string;
  standardRadiusKm: number;
  anchors: readonly DeliveryAnchor[];
};

export const DELIVERY_ZONES = {
  lucens: {
    label: DELIVERY_SETTINGS.label,
    selectionLabel: DELIVERY_SETTINGS.selectionLabel,
    standardRadiusKm: DELIVERY_SETTINGS.standardRadiusKm,
    anchors: DELIVERY_SETTINGS.anchors,
  },
} as const satisfies Record<RegionId, DeliveryZone>;

export function isDeliveryRegionId(value: string): value is RegionId {
  return DELIVERY_REGION_IDS.some((region) => region === value);
}

export type DeliveryZoneResult =
  | {
      status: "eligible";
      region: RegionId;
      distanceKm: number;
    }
  | {
      status: "on_request";
      region: RegionId;
      distanceKm: number;
    }
  | {
      status: "not_found";
    }
  | {
      status: "service_error";
      reference?: string;
    };

export type Coordinates = {
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
  return Math.min(
    ...DELIVERY_ZONES[region].anchors.map((anchor) =>
      distanceInKilometers(anchor.center, coordinates),
    ),
  );
}

export function findEligibleDeliveryZone(coordinates: Coordinates) {
  return DELIVERY_REGION_IDS
    .map((region) => ({
      region,
      distanceKm: distanceFromDeliveryZone(region, coordinates),
    }))
    .filter(
      ({ region, distanceKm }) =>
        distanceKm <= DELIVERY_ZONES[region].standardRadiusKm,
    )
    .sort((first, second) => first.distanceKm - second.distanceKm)[0]?.region;
}

export function resolveDeliveryZone(
  requestedRegion: RegionId,
  coordinates: Coordinates,
): DeliveryZoneResult {
  const distanceKm = distanceFromDeliveryZone(
    requestedRegion,
    coordinates,
  );
  const eligibleRegion = findEligibleDeliveryZone(coordinates);

  if (eligibleRegion === requestedRegion) {
    return {
      status: "eligible",
      region: requestedRegion,
      distanceKm,
    };
  }

  return {
    status: "on_request",
    region: requestedRegion,
    distanceKm,
  };
}
