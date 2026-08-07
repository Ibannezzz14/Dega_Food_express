export const DELIVERY_REGION_IDS = ["lausanne", "lucens"] as const;

export type RegionId = (typeof DELIVERY_REGION_IDS)[number];

type DeliveryZone = {
  label: string;
  selectionLabel: string;
  contactArea: string;
  displayPhone: string;
  phoneHref: `tel:${string}`;
  phone: string;
  radiusKm: number;
  center: {
    latitude: number;
    longitude: number;
  };
};

export const DELIVERY_ZONES = {
  lausanne: {
    label: "Lausanne",
    selectionLabel: "Lausanne",
    contactArea: "Lausanne",
    displayPhone: "078 265 40 81",
    phoneHref: "tel:+41782654081",
    phone: "41782654081",
    radiusKm: 30,
    center: {
      latitude: 46.520008,
      longitude: 6.630101,
    },
  },
  lucens: {
    label: "Lucens",
    selectionLabel: "Lucens & alentours",
    contactArea: "Lucens et alentours",
    displayPhone: "076 603 60 11",
    phoneHref: "tel:+41766036011",
    phone: "41766036011",
    radiusKm: 25,
    center: {
      latitude: 46.708527,
      longitude: 6.836576,
    },
  },
} as const satisfies Record<RegionId, DeliveryZone>;

type PublicRegion =
  | {
      id: RegionId;
      label: string;
      selectionLabel: string;
      availability: "available";
    }
  | {
      id: "geneve";
      label: "Genève";
      selectionLabel: "Genève";
      availability: "coming_soon";
      availabilityLabel: "Contact bientôt disponible";
    };

export const PUBLIC_REGIONS = [
  {
    id: "lausanne",
    label: DELIVERY_ZONES.lausanne.label,
    selectionLabel: DELIVERY_ZONES.lausanne.selectionLabel,
    availability: "available",
  },
  {
    id: "lucens",
    label: DELIVERY_ZONES.lucens.label,
    selectionLabel: DELIVERY_ZONES.lucens.selectionLabel,
    availability: "available",
  },
  {
    id: "geneve",
    label: "Genève",
    selectionLabel: "Genève",
    availability: "coming_soon",
    availabilityLabel: "Contact bientôt disponible",
  },
] as const satisfies readonly PublicRegion[];

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
  return distanceInKilometers(DELIVERY_ZONES[region].center, coordinates);
}

export function findEligibleDeliveryZone(coordinates: Coordinates) {
  return DELIVERY_REGION_IDS
    .map((region) => ({
      region,
      distanceKm: distanceFromDeliveryZone(region, coordinates),
    }))
    .filter(
      ({ region, distanceKm }) =>
        distanceKm <= DELIVERY_ZONES[region].radiusKm,
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
    status: "outside",
    region: requestedRegion,
    distanceKm,
    suggestedRegion: eligibleRegion ?? null,
  };
}
