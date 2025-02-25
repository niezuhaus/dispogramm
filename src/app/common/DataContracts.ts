// data contracts
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
  resourceSets: { resources: BingResource[]; }[];
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
