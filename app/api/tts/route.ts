import { type NextRequest, NextResponse } from "next/server"
import { generateSpeech } from "@/lib/elevenlabs-client"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    console.log("[v0] TTS API called with text:", text.substring(0, 50))

    const audioUrl = await generateSpeech(text)

    console.log("[v0] TTS API returning audio URL")
    return NextResponse.json({ audioUrl })
  } catch (error) {
    console.error("[v0] TTS API Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate speech"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
