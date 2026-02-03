'use client'

interface TextOverlayProps {
  text: string
}

export default function TextOverlay({ text }: TextOverlayProps) {
  return (
    <div className="absolute bottom-8 left-8 z-20 max-w-md">
      <div className="bg-white/30 backdrop-blur-lg p-6 rounded-lg border border-white/20">
        <p className="text-white text-lg md:text-xl leading-relaxed font-medium drop-shadow-md">
          {text}
        </p>
      </div>
    </div>
  )
}
