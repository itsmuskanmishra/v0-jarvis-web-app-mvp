"use client"

import { useCallback } from "react"

export function useTTS() {
  const speak = useCallback(async (text: string) => {
    try {
      console.log("[v0] Starting browser TTS for text:", text.substring(0, 50))

      if (!("speechSynthesis" in window)) {
        throw new Error("Speech Synthesis not supported in this browser")
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // Try to use a male voice for JARVIS effect
      const voices = window.speechSynthesis.getVoices()
      const maleVoice = voices.find((voice) => voice.name.includes("Google UK English Male")) || voices[0]
      if (maleVoice) {
        utterance.voice = maleVoice
      }

      return new Promise<void>((resolve, reject) => {
        let isResolved = false

        utterance.onend = () => {
          console.log("[v0] Speech synthesis finished")
          if (!isResolved) {
            isResolved = true
            resolve()
          }
        }

        utterance.onerror = (event) => {
          console.error("[v0] Speech synthesis error:", event.error)
          if (!isResolved) {
            isResolved = true
            reject(new Error(`Speech synthesis error: ${event.error}`))
          }
        }

        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
        console.log("[v0] Speech synthesis started")
      })
    } catch (error) {
      console.error("[v0] TTS Error:", error)
      throw error
    }
  }, [])

  return { speak }
}
