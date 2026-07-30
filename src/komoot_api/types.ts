export interface KomootUserDetails {
  email: string;
  userId: string;
  displayName: string;
  profileImageUrl: string | null;
  token: string;
}

export interface LoginResult {
  success: boolean;
  userDetails?: KomootUserDetails;
  error?: string;
}

export enum KomootTourType {
  PLANNED = "tour_planned",
  RECORDED = "tour_recorded",
}

export enum KomootTourStatus {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum KomootSport {
  BIKING = "citybike",
  BIKE_TOURING = "touring_bicycle",
  ROAD_CYCLING = "racebike",
  GRAVEL_BIKING = "mtb_easy",
  MT_BIKING = "mtb",
  MT_BIKING_DOWNHILL = "downhillbike",
  MT_BIKING_ENDURO = "mtb_advanced",
  UNICYCLING = "unicycle",
  HIKING = "hike",
  RUNNING = "jogging",
  SKATING = "skaten",
  MOUNTAINEERING = "mountaineering",
  ROCK_CLIMBING = "climbing",
  NORDIC_WALKING = "nordicwalking",
  SKI_TOURING = "skitour",
  CROSS_COUNTRY_SKIING = "nordic",
  ALPINE_SKIING = "skialpin",
  SLEDGING = "sled",
  SNOWBOARDING = "snowboard",
  SNOWSHOEING = "snowshoe",
  OTHER = "other",
}

export enum KomootTourOwner {
  SELF = "self",
  OTHER = "other",
}

export interface GetToursOptions {
  tourType?: KomootTourType[];
  tourStatus?: KomootTourStatus[];
  sport?: KomootSport[];
  tourOwner?: KomootTourOwner[];
}

export interface GetToursResult {
  success: boolean;
  tours?: KomootTour[];
  error?: string;
}

export interface KomootImage {
  src: string;
  templated: boolean;
  type: string;
  attribution: string;
}

export interface KomootLink {
  href: string;
  templated?: boolean;
}

export interface KomootCreator {
  username: string;
  display_name: string;
  status: string;
  is_premium: boolean;
  avatar: KomootImage;
  _links: {
    self: KomootLink;
    relation: KomootLink;
  };
}

export interface KomootStartPoint {
  lat: number;
  lng: number;
  alt: number;
}

export interface KomootTour {
  id: number;
  type: KomootTourType;
  name: string;
  source: string;
  status: KomootTourStatus;
  date: string; // ISO 8601
  changed_at: string; // ISO 8601
  sport: KomootSport;
  distance: number; // meters
  duration: number; // seconds
  time_in_motion: number; // seconds
  elevation_up: number; // meters
  elevation_down: number; // meters
  kcal_active: number;
  kcal_resting: number;
  potential_route_update: boolean;
  start_point: KomootStartPoint;
  map_image: KomootImage;
  map_image_preview: KomootImage;
  vector_map_image: Omit<KomootImage, "attribution"> & { templated: false };
  vector_map_image_preview: Omit<KomootImage, "attribution"> & {
    templated: false;
  };
  _embedded: {
    creator: KomootCreator;
  };
  _links: {
    self: KomootLink;
    creator: KomootLink;
    coordinates: KomootLink;
    tour_line: KomootLink;
    peaks: KomootLink;
    participants: KomootLink;
    timeline: KomootLink;
    translations: KomootLink;
    faqs: KomootLink;
    details: KomootLink;
    cover_images: KomootLink;
    tour_rating: KomootLink;
  };
}

export interface KomootToursResponse {
  _embedded: {
    tours: KomootTour[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface EnrichedCoordinate {
  lat: number;
  lng: number;
  alt: number;
  timestamp?: number; // Unix ms — for speed, year, elapsed time
  speed?: number; // m/s — precomputed on ingest
  incline?: number; // % grade — precomputed on ingest
}

export interface EnrichedRoute {
  tourId: string;
  year: number | undefined; // top-level — for whole-route year coloring
  sport: KomootSport;
  totalDuration: number | undefined; // seconds
  coordinates: EnrichedCoordinate[];
}
