/**
 * Validates URLs and replaces broken ones with working search links.
 */

interface Resource {
  name: string;
  type?: string;
  provider?: string;
  url?: string;
}

// Generate a guaranteed-working fallback URL based on resource type
function getFallbackUrl(resource: Resource): string {
  const query = encodeURIComponent(resource.name);

  switch (resource.type) {
    case "video":
      return `https://www.youtube.com/results?search_query=${query}`;
    case "book":
      return `https://www.amazon.com/s?k=${query}`;
    case "course":
      if (resource.provider?.toLowerCase().includes("udemy")) {
        return `https://www.udemy.com/courses/search/?q=${query}`;
      }
      if (resource.provider?.toLowerCase().includes("coursera")) {
        return `https://www.coursera.org/search?query=${query}`;
      }
      if (resource.provider?.toLowerCase().includes("edx")) {
        return `https://www.edx.org/search?q=${query}`;
      }
      return `https://www.coursera.org/search?query=${query}`;
    case "tutorial":
      return `https://www.google.com/search?q=${query}+tutorial`;
    case "docs":
      return `https://www.google.com/search?q=${query}+documentation`;
    default:
      return `https://www.google.com/search?q=${query}`;
  }
}

async function checkUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 CareerNavigator/1.0" },
    });
    // Accept 200-399, reject 404, 500, etc.
    return response.status >= 200 && response.status < 400;
  } catch {
    return false;
  }
}

export async function validateResources(resources: Resource[]): Promise<Resource[]> {
  // Check all URLs in parallel with a concurrency limit
  const results = await Promise.all(
    resources.map(async (resource) => {
      if (!resource.url) {
        return { ...resource, url: getFallbackUrl(resource) };
      }

      // Quick sanity check — skip obviously fake URLs
      if (
        resource.url.includes("example.com") ||
        resource.url.includes("placeholder") ||
        resource.url.includes("real-url") ||
        !resource.url.startsWith("https://")
      ) {
        return { ...resource, url: getFallbackUrl(resource) };
      }

      const isValid = await checkUrl(resource.url);
      if (!isValid) {
        return { ...resource, url: getFallbackUrl(resource) };
      }

      return resource;
    })
  );

  return results;
}
