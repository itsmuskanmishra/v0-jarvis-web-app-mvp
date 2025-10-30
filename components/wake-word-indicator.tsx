"use client"

interface WakeWordIndicatorProps {
  detected: boolean
}

export default function WakeWordIndicator({ detected }: WakeWordIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full transition-all ${detected ? "bg-accent pulse-glow" : "bg-muted-foreground"}`}
      />
      <span className="text-sm font-medium text-muted-foreground">{detected ? "Listening" : "Standby"}</span>
    </div>
  )
}
