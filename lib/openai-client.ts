import { searchGoogle } from "./search-api-client"

export async function chatWithAI(message: string) {
  try {
    console.log("[v0] Processing message:", message.substring(0, 50))

    const needsSearch = requiresSearch(message)

    if (needsSearch) {
      console.log("[v0] Fetching real-time search results")
      const searchResults = await searchGoogle(message)
      const response = await generateResponseWithSearch(message, searchResults)
      console.log("[v0] Response generated with search results")
      return response
    }

    const response = await generateLocalResponse(message)
    console.log("[v0] Local response generated successfully")
    return response
  } catch (error) {
    console.error("[v0] Chat Error:", error)
    throw error
  }
}

function requiresSearch(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  const searchKeywords = [
    "news",
    "latest",
    "current",
    "today",
    "weather",
    "stock",
    "price",
    "how much",
    "what is the",
    "tell me about",
    "search for",
    "find",
    "what happened",
    "when did",
    "who is",
    "where is",
    "how to",
  ]
  return searchKeywords.some((keyword) => lowerMessage.includes(keyword))
}

async function generateResponseWithSearch(message: string, searchResults: any[]): Promise<string> {
  if (searchResults.length === 0) {
    return "No results found. Try rephrasing your question."
  }

  const topResult = searchResults[0]
  return `${topResult.title}: ${topResult.snippet}`
}

function generateLocalResponse(message: string): string {
  const lowerMessage = message.toLowerCase().trim()

  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hey") ||
    lowerMessage.includes("greetings")
  ) {
    return "Hi! I'm JARVIS. How can I help?"
  }

  if (
    lowerMessage.includes("how are you") ||
    lowerMessage.includes("how are u") ||
    lowerMessage.includes("how r u") ||
    lowerMessage.includes("how's it going") ||
    lowerMessage.includes("what's up") ||
    lowerMessage.includes("sup")
  ) {
    const responses = [
      "I'm doing great! What can I help with?",
      "All systems operational! What do you need?",
      "I'm ready to help. What's your question?",
      "Excellent! How can I assist?",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  if (lowerMessage === "thanks" || lowerMessage === "thank you" || lowerMessage === "thx" || lowerMessage === "ty") {
    return "You're welcome!"
  }

  if (lowerMessage.includes("what time") || lowerMessage.includes("current time")) {
    const now = new Date()
    return `It's ${now.toLocaleTimeString()}.`
  }

  if (lowerMessage.includes("what's the date") || lowerMessage.includes("today's date")) {
    const now = new Date()
    return `Today is ${now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}.`
  }

  // Math queries
  if (lowerMessage.includes("calculate") || lowerMessage.includes("what is")) {
    const mathMatch = lowerMessage.match(/(\d+)\s*[+\-*/]\s*(\d+)/)
    if (mathMatch) {
      const num1 = Number.parseInt(mathMatch[1])
      const num2 = Number.parseInt(mathMatch[2])
      const operator = lowerMessage.match(/[+\-*/]/)?.[0]

      let result
      switch (operator) {
        case "+":
          result = num1 + num2
          break
        case "-":
          result = num1 - num2
          break
        case "*":
          result = num1 * num2
          break
        case "/":
          result = num1 / num2
          break
        default:
          result = 0
      }

      return `The result of ${num1} ${operator} ${num2} is ${result}.`
    }
  }

  // Weather queries
  if (lowerMessage.includes("weather")) {
    return "I don't have access to real-time weather data, but I can tell you that weather information is typically available through weather services. Would you like to know something else?"
  }

  // News queries
  if (lowerMessage.includes("news") || lowerMessage.includes("latest")) {
    return "I don't have access to real-time news, but I can help you with general knowledge questions. What would you like to know?"
  }

  // Who am I queries
  if (lowerMessage.includes("who are you") || lowerMessage.includes("what are you")) {
    return "I'm JARVIS, an AI voice assistant inspired by the Iron Man universe. I can help you with information, answer questions, and have conversations. How can I assist you?"
  }

  // Capabilities
  if (lowerMessage.includes("what can you do") || lowerMessage.includes("capabilities")) {
    return "I can help you with general knowledge questions, perform simple calculations, tell you the current time and date, and have conversations. I work entirely in your browser without needing external services."
  }

  // Jokes
  if (lowerMessage.includes("joke") || lowerMessage.includes("funny")) {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "How many programmers does it take to change a light bulb? None, that's hardware!",
      "Why did the AI go to school? To improve its neural networks!",
    ]
    return jokes[Math.floor(Math.random() * jokes.length)]
  }

  // Help
  if (lowerMessage.includes("help") || lowerMessage === "?") {
    return "I can help with time, math, jokes, and general questions. What do you need?"
  }

  // Default response for general queries
  const generalResponses = [
    "That's interesting. What specifically would you like to know?",
    "I can help with that. Tell me more.",
    "Got it. What else can I help with?",
    "Understood. What's your question?",
  ]

  return generalResponses[Math.floor(Math.random() * generalResponses.length)]
}
