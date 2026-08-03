import simplify from "@turf/simplify";
import { gpxToEnrichedGeoJson } from "./gpxParser";
import {
  LoginResult,
  KomootUserDetails,
  GetToursOptions,
  GetToursResult,
  KomootTourStatus,
  KomootTourOwner,
  KomootTour,
  KomootToursResponse,
  EnrichedRoute,
} from "./types";

const LOGIN_URL = "https://api.komoot.de/v006/account/email/%s/";
const TOURS_URL = "https://api.komoot.de/v007/users/%s/tours/";
const DL_GPX_URL = "https://api.komoot.de/v007/tours/%s.gpx";

function toBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return btoa(String.fromCharCode(...bytes));
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const url = LOGIN_URL.replace("%s", encodeURIComponent(email));

  let resp: Response;
  try {
    resp = await fetch(url, {
      headers: {
        Authorization: "Basic " + toBase64Utf8(`${email}:${password}`),
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return {
      success: false,
      error: "Network error: " + (err as Error).message,
    };
  }

  if (resp.status === 401 || resp.status === 403) {
    return { success: false, error: "Invalid email or password." };
  }

  if (!resp.ok) {
    return {
      success: false,
      error: `Komoot API error: ${resp.status} ${resp.statusText}`,
    };
  }

  let data: any;
  try {
    data = await resp.json();
  } catch {
    return { success: false, error: "Failed to parse Komoot API response." };
  }

  try {
    const userDetails: KomootUserDetails = {
      email,
      userId: data.username,
      displayName: data.user.displayname,
      profileImageUrl: data.user.content?.hasImage ? data.user.imageUrl : null,
      token: data.password,
    };

    return { success: true, userDetails };
  } catch {
    return {
      success: false,
      error: "Unexpected response structure from Komoot API.",
    };
  }
}

function buildFlagParam(flags: string[]): string {
  return flags.join(",");
}

function addFlagParam(
  params: Record<string, string>,
  paramName: string,
  flags: string[] | undefined,
): void {
  if (flags && flags.length > 0) {
    params[paramName] = buildFlagParam(flags);
  }
}

function filterByStatus(
  tours: KomootTour[],
  statuses: KomootTourStatus[] | undefined,
): KomootTour[] {
  if (!statuses || statuses.length === 0) return tours;
  return tours.filter((tour) =>
    statuses.includes(tour.status as KomootTourStatus),
  );
}

function filterByOwner(
  tours: KomootTour[],
  owners: KomootTourOwner[] | undefined,
  userId: string,
): KomootTour[] {
  if (!owners || owners.length === 0) return tours;
  if (
    owners.includes(KomootTourOwner.SELF) &&
    owners.includes(KomootTourOwner.OTHER)
  )
    return tours;

  return tours.filter((tour) => {
    const creatorId = tour._embedded?.creator?.username;
    if (owners.includes(KomootTourOwner.SELF)) return creatorId === userId;
    if (owners.includes(KomootTourOwner.OTHER)) return creatorId !== userId;
    return false;
  });
}

export async function getUserTours(
  userId: string,
  token: string,
  options: GetToursOptions = {},
): Promise<GetToursResult> {
  const { tourType, tourStatus, sport, tourOwner } = options;

  const params: Record<string, string> = {};
  addFlagParam(params, "type", tourType);
  addFlagParam(params, "sport_types", sport);

  let page = 0;
  let tours: KomootTour[] = [];

  while (true) {
    const query = new URLSearchParams({ ...params, page: String(page) });
    const url = `${TOURS_URL.replace("%s", userId)}?${query}`;

    let resp: Response;
    try {
      resp = await fetch(url, {
        headers: {
          Authorization: "Basic " + btoa(`${userId}:${token}`),
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      return {
        success: false,
        error: "Network error: " + (err as Error).message,
      };
    }

    if (!resp.ok) {
      return {
        success: false,
        error: `Komoot API error on page ${page}: ${resp.status} ${resp.statusText}`,
        tours, // return what we have so far
      };
    }

    let content: KomootToursResponse;
    try {
      content = await resp.json();
    } catch {
      return {
        success: false,
        error: "Failed to parse Komoot API response.",
        tours,
      };
    }

    if (content.page?.totalElements === 0) break;

    tours = tours.concat(content._embedded?.tours ?? []);
    page++;

    if (content.page?.totalPages === page) break;
  }

  tours = filterByStatus(tours, tourStatus);
  tours = filterByOwner(tours, tourOwner, userId);

  return { success: true, tours };
}

async function downloadTourGPX(
  tourId: number,
  userId: string,
  token: string,
): Promise<string | null> {
  const url = DL_GPX_URL.replace("%s", String(tourId));

  let resp: Response;
  try {
    resp = await fetch(url, {
      headers: {
        Authorization: "Basic " + btoa(`${userId}:${token}`),
        "Content-Type": "application/gpx+xml",
      },
    });
  } catch (err) {
    console.error("Network error:", (err as Error).message);
    return null;
  }

  if (!resp.ok) {
    console.error(
      `Komoot API error: ${resp.status} ${resp.statusText} for tour ${tourId}`,
    );
    return null;
  }

  try {
    const gpxData = await resp.text();
    return gpxData;
  } catch {
    console.error("Failed to parse Komoot API response for tour", tourId);
    return null;
  }
}

export async function fetchAndParseTour(
  tourId: string,
  userId: string,
  token: string,
): Promise<EnrichedRoute | null> {
  const gpxData = await downloadTourGPX(Number(tourId), userId, token);
  if (!gpxData) return null;

  const enrichedRoute = gpxToEnrichedGeoJson(gpxData, tourId);

  return enrichedRoute;
}
