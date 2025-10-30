"use client"

import { useState, useRef, useEffect } from "react"
import ChatWindow from "@/components/chat-window"
import MicVisualizer from "@/components/mic-visualizer"
import WakeWordIndicator from "@/components/wake-word-indicator"
import SearchResultCard from "@/components/search-result-card"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useTTS } from "@/hooks/use-tts"

interface Message {
  id: string
  type: "user" | "assistant"
  text: string
  searchResults?: Array<{
    title: string
    link: string
    snippet: string
  }>
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [wakeWordDetected, setWakeWordDetected] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [textInput, setTextInput] = useState("")
  const { transcript, startListening, stopListening } = useSpeechRecognition()
  const { speak } = useTTS()
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Initialize audio context for visualizer
  useEffect(() => {
    if (typeof window !== "undefined" && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContextRef.current.createAnalyser()
      analyserRef.current = analyser
    }
  }, [])

  // Wake word detection simulation
  useEffect(() => {
    if (transcript.toLowerCase().includes("jarvis")) {
      setWakeWordDetected(true)
      setIsListening(true)
      startListening()
    }
  }, [transcript, startListening])

  // Handle sending message
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setIsListening(false)
    setTextInput("")

    try {
      console.log("[v0] Sending message to chat API:", text)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })

      console.log("[v0] Chat API response status:", response.status)

      if (!response.ok) {
        console.log("[v0] Response not OK, attempting to parse error...")
        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          console.error("[v0] Failed to parse error response as JSON:", parseError)
          const errorText = await response.text()
          console.error("[v0] Raw error response:", errorText)
          throw new Error(`Chat API failed: ${response.status} - ${errorText.substring(0, 100)}`)
        }
        throw new Error(`Chat API failed: ${response.status} - ${errorData.error}`)
      }

      const data = await response.json()
      console.log("[v0] Chat API response received:", data.response.substring(0, 50))

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        text: data.response,
        searchResults: data.searchResults,
      }

      setMessages((prev) => [...prev, assistantMessage])

      setIsSpeaking(true)
      try {
        console.log("[v0] Starting voice response for:", data.response.substring(0, 50))
        await speak(data.response)
        console.log("[v0] Voice response completed successfully")
      } catch (error) {
        console.error("[v0] Voice playback error:", error)
        // Continue even if voice fails - user can still see the text response
      } finally {
        setIsSpeaking(false)
      }
    } catch (error) {
      console.error("[v0] Error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        type: "assistant",
        text: `Error: ${errorMessage}`,
      }
      setMessages((prev) => [...prev, errorMsg])
      setIsSpeaking(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted to-background overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,217,255,.05)_25%,rgba(0,217,255,.05)_26%,transparent_27%,transparent_74%,rgba(0,217,255,.05)_75%,rgba(0,217,255,.05)_76%,transparent_77%,transparent)] bg-[length:50px_50px]" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-md bg-muted/20 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-lg font-bold text-background">J</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">JARVIS</h1>
                <p className="text-xs text-muted-foreground">AI Voice Assistant</p>
              </div>
            </div>
            <WakeWordIndicator detected={wakeWordDetected} />
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatWindow messages={messages} isLoading={isLoading} />

          {/* Visualizer and controls */}
          <div className="border-t border-border/50 backdrop-blur-md bg-muted/20 p-6">
            <div className="max-w-6xl mx-auto space-y-4">
              {isListening && <MicVisualizer analyser={analyserRef.current} />}

              {/* Search results display */}
              {messages.length > 0 && messages[messages.length - 1].searchResults && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {messages[messages.length - 1].searchResults?.map((result, idx) => (
                    <SearchResultCard key={idx} result={result} />
                  ))}
                </div>
              )}

              {/* Input area */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (isListening) {
                      stopListening()
                      setIsListening(false)
                      if (transcript) {
                        handleSendMessage(transcript)
                      }
                    } else {
                      setWakeWordDetected(true)
                      setIsListening(true)
                      startListening()
                    }
                  }}
                  disabled={isLoading || isSpeaking}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    isListening
                      ? "bg-accent glow-accent text-background"
                      : "bg-primary glow-primary text-background hover:bg-primary-dark"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading
                    ? "Processing..."
                    : isSpeaking
                      ? "Speaking..."
                      : isListening
                        ? "Stop Listening"
                        : "Start Listening"}
                </button>
                <button
                  onClick={() => {
                    setMessages([])
                    setWakeWordDetected(false)
                  }}
                  className="px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isLoading && !isSpeaking) {
                      handleSendMessage(textInput)
                    }
                  }}
                  placeholder="Or type a message here..."
                  disabled={isLoading || isSpeaking}
                  className="flex-1 px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <button
                  onClick={() => handleSendMessage(textInput)}
                  disabled={isLoading || isSpeaking || !textInput.trim()}
                  className="px-4 py-3 rounded-lg bg-accent text-background font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>

              {transcript && (
                <div className="glass p-3 text-sm">
                  <p className="text-muted-foreground">
                    Transcript: <span className="text-foreground">{transcript}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
