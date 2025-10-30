export async function searchGoogle(query: string) {
  try {
    const params = new URLSearchParams({
      q: query,
      engine: "google",
      api_key: process.env.SEARCHAPI_API_KEY || "",
    })

    const response = await fetch(`https://www.searchapi.io/api/v1/search?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("[v0] SearchAPI Error:", response.status, response.statusText)
      return []
    }

    const data = await response.json()
    console.log("[v0] SearchAPI Response received with", data.organic_results?.length || 0, "results")

    return (
      data.organic_results?.slice(0, 5).map((result: any) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
      })) || []
    )
  } catch (error) {
    console.error("[v0] Search API Error:", error)
    return []
  }
}
