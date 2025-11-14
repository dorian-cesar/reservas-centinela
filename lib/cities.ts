export type CitiesMap = Record<string, string[]>;

export async function fetchCities(): Promise<CitiesMap | null> {
  try {
    const res = await fetch("/api/services/cities", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (err) {
    console.error("fetchCities error:", err);
    return null;
  }
}
