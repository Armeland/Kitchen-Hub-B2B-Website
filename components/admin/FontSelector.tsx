'use client'

import { availableFonts } from '@/lib/types'

interface FontSelectorProps {
  currentFont: string
  onChange: (font: string) => void
}

export default function FontSelector({ currentFont, onChange }: FontSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-moss">
        Font Family
      </label>
      <select
        value={currentFont}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border-2 border-moss/30 bg-cream
                   focus:border-jade focus:outline-none transition-colors
                   text-seaweed font-medium"
      >
        {availableFonts.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
      <p className="text-sm text-moss/60">
        Preview: <span style={{ fontFamily: currentFont }}>The quick brown fox jumps over the lazy dog</span>
      </p>
    </div>
  )
}
