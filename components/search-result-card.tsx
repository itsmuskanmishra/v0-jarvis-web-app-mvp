"use client"

interface SearchResult {
  title: string
  link: string
  snippet: string
}

interface SearchResultCardProps {
  result: SearchResult
}

export default function SearchResultCard({ result }: SearchResultCardProps) {
  return (
    <a
      href={result.link}
      target="_blank"
      rel="noopener noreferrer"
      className="glass p-3 rounded-lg hover:border-primary/50 transition-all hover:glow-primary group cursor-pointer"
    >
      <h3 className="font-semibold text-sm text-primary group-hover:text-accent transition-colors line-clamp-1">
        {result.title}
      </h3>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.snippet}</p>
      <p className="text-xs text-primary/60 mt-2 truncate">{new URL(result.link).hostname}</p>
    </a>
  )
}
