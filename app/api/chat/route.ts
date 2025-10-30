import { type NextRequest, NextResponse } from "next/server"
import { chatWithAI } from "@/lib/openai-client"
import { searchGoogle } from "@/lib/search-api-client"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    console.log("[v0] Chat API received message:", message)

    const aiResponse = await chatWithAI(message)
    console.log("[v0] Response generated:", aiResponse.substring(0, 50))

    let searchResults = []
    const lowerMessage = message.toLowerCase()
    const needsSearch =
      lowerMessage.includes("search") ||
      lowerMessage.includes("find") ||
      lowerMessage.includes("latest") ||
      lowerMessage.includes("current") ||
      lowerMessage.includes("today") ||
      lowerMessage.includes("news") ||
      lowerMessage.includes("weather") ||
      lowerMessage.includes("price") ||
      lowerMessage.includes("stock") ||
      lowerMessage.includes("what is") ||
      lowerMessage.includes("who is") ||
      lowerMessage.includes("when is")

    if (needsSearch) {
      searchResults = await searchGoogle(message)
      console.log("[v0] Search results retrieved:", searchResults.length)
    }

    return NextResponse.json({
      response: aiResponse,
      searchResults: searchResults,
    })
  } catch (error) {
    console.error("[v0] Chat API Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to process request"
    console.error("[v0] Error details:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
