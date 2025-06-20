/**
 * external api data contracts (osm and bing)
 */

/**
 * response data format to expect from the openstreetmap api for a geocoding request
 */
export interface IOSMResponse {
  type: string;
  features: IOSMFeature[];
  results: IOSMFeature[];
}

/**
 * data format of a single openstreetmap feature (e.g. one search result)
 */
export interface IOSMFeature {
  type: string;
  properties: {
    name: string;
    street: string;
    housenumber: string;
    neighbourhood: string;
    suburb: string;
    district: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    lon: number;
    lat: number;
    formatted: string;
    address_line1: string;
    address_line2: string;
    result_type: string;
    rank: {
      confidence: number;
    };
    description: string;
  };
}
interface Waypoint {
  location: [number, number];
  original_index: number;
}
interface Instruction {
  text: string;
}
interface Step {
  from_index: number;
  to_index: number;
  distance: number;
  time: number;
  instruction: Instruction;
}
interface Leg {
  distance: number;
  time: number;
  steps: Step[];
}
interface FeatureProperties {
  mode: string;
  waypoints: Waypoint[];
  units: string;
  distance: number;
  distance_units: string;
  time: number;
  legs: Leg[];
}
interface Geometry {
  type: string;
  coordinates: number[][][];
}
interface Feature {
  type: string;
  properties: FeatureProperties;
  geometry: Geometry;
}
interface WaypointProperties {
  lat: number;
  lon: number;
}
interface FeatureCollectionProperties {
  mode: string;
  waypoints: WaypointProperties[];
  units: string;
}

export interface IOSMRouteFeatureCollection {
  type: string;
  features: Feature[];
  properties: FeatureCollectionProperties;
}
/* entspricht dem datenformat einer antwort der bing-api */

export interface BingMapsResponse {
  resourceSets: { resources: BingResource[] }[];
}

/* entspricht dem datenformat eines einzelnen bing-datensatzes in der antwort der bing-api */
export interface BingResource {
  point: {
    type: string;
    coordinates: {
      0: number; // lng
      1: number; // lat
    };
  };
  address: {
    addressLine: string;
    adminDistrict: string;
    adminDistrict2: string;
    countryRegion: string;
    formattedAddress: string;
    locality: string;
    postalCode: string;
  };
  confidence: string;
  entityType: string;
}

export interface AzureMapsResponse {
  summary: Summary;
  results: Result[];
}

export interface Summary {
  query: string;
  queryType: string;
  queryTime: number;
  numResults: number;
  offset: number;
  totalResults: number;
  fuzzyLevel: number;
}

export interface Result {
  type: string;
  id: string;
  score: number;
  matchConfidence: MatchConfidence;
  address: Address;
  position: LatLon;
  viewport: Viewport;
  entryPoints?: EntryPoint[]; // Optional, not present in all entries
  addressRanges?: AddressRanges; // Optional, only present in last entry
}

export interface MatchConfidence {
  score: number;
}

export interface Address {
  streetNumber: string;
  streetName: string;
  municipality?: string;
  municipalitySubdivision?: string;
  neighbourhood?: string;
  countrySecondarySubdivision: string;
  countrySubdivision: string;
  countrySubdivisionName: string;
  countrySubdivisionCode: string;
  postalCode: string;
  countryCode: string;
  country: string;
  countryCodeISO3: string;
  freeformAddress: string;
  localName: string;
}

export interface LatLon {
  lat: number;
  lon: number;
}

export interface Viewport {
  topLeftPoint: LatLon;
  btmRightPoint: LatLon;
}

export interface EntryPoint {
  type: string;
  position: LatLon;
}

export interface AddressRanges {
  rangeRight: string;
  from: LatLon;
  to: LatLon;
}
