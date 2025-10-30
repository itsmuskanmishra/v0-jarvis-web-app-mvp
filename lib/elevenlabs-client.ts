export async function generateSpeech(text: string) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!apiKey) {
      console.error("[v0] ELEVENLABS_API_KEY is not set")
      throw new Error("ElevenLabs API key is not configured")
    }

    console.log("[v0] Calling ElevenLabs API with text:", text.substring(0, 50))

    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("[v0] ElevenLabs API error:", response.status, errorData)
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorData}`)
    }

    const audioBuffer = await response.arrayBuffer()
    const blob = new Blob([audioBuffer], { type: "audio/mpeg" })
    const url = URL.createObjectURL(blob)
    console.log("[v0] Speech generated successfully, blob URL created")
    return url
  } catch (error) {
    console.error("[v0] ElevenLabs Error:", error)
    throw error
  }
}
