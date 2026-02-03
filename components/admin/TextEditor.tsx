'use client'

interface TextEditorProps {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  placeholder?: string
}

export default function TextEditor({
  label,
  value,
  onChange,
  multiline = false,
  placeholder = '',
}: TextEditorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-moss">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border-2 border-moss/30 bg-cream
                     focus:border-jade focus:outline-none transition-colors
                     text-seaweed resize-y min-h-[100px]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-lg border-2 border-moss/30 bg-cream
                     focus:border-jade focus:outline-none transition-colors
                     text-seaweed"
        />
      )}
    </div>
  )
}
