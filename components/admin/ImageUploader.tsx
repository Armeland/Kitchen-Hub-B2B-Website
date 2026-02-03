'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'

interface ImageUploaderProps {
  label: string
  currentUrl: string
  onUpload: (url: string) => void
  accept?: 'image' | 'video' | 'both'
  storagePath: string
}

export default function ImageUploader({
  label,
  currentUrl,
  onUpload,
  accept = 'image',
  storagePath,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')

  const acceptConfig = {
    image: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    video: { 'video/*': ['.mp4', '.webm', '.mov'] },
    both: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      if (!supabase) {
        setError('Supabase not configured. Use the URL input below instead.')
        return
      }

      setUploading(true)
      setError(null)

      try {
        const timestamp = Date.now()
        const fileExt = file.name.split('.').pop()
        const fileName = `${storagePath}/${timestamp}.${fileExt}`

        // Using 'Photos' bucket to match existing setup
        const { error: uploadError } = await supabase.storage
          .from('Photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
          })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('Photos')
          .getPublicUrl(fileName)

        onUpload(urlData.publicUrl)
        setError(null)
      } catch (err: unknown) {
        console.error('Upload error:', err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(`Upload failed: ${message}. Use the URL input below instead.`)
      } finally {
        setUploading(false)
      }
    },
    [storagePath, onUpload]
  )

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (urlInput.trim()) {
      onUpload(urlInput.trim())
      setUrlInput('')
      setError(null)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptConfig[accept],
    multiple: false,
    disabled: uploading,
  })

  const isVideo = currentUrl && (currentUrl.includes('.mp4') || currentUrl.includes('.webm') || currentUrl.includes('.mov'))

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-semibold text-moss">{label}</label>}

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive ? 'border-jade bg-mint/20' : 'border-moss/30 hover:border-jade'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moss" />
            <p className="text-moss/70">Uploading...</p>
          </div>
        ) : isDragActive ? (
          <p className="text-jade font-medium">Drop the file here...</p>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <p className="text-moss/70">
              Drag and drop a file here, or click to select
            </p>
            <p className="text-sm text-moss/50">
              {accept === 'image' && 'Supports: PNG, JPG, GIF, WebP'}
              {accept === 'video' && 'Supports: MP4, WebM, MOV'}
              {accept === 'both' && 'Supports: Images and Videos'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      {/* URL Input Option */}
      <div className="pt-2 border-t border-moss/10">
        <p className="text-sm text-moss/70 mb-2">Or enter image URL:</p>
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 rounded-lg border-2 border-moss/30 bg-cream
                       focus:border-jade focus:outline-none transition-colors text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-jade text-cream rounded-lg font-medium
                       hover:bg-moss transition-colors text-sm"
          >
            Use URL
          </button>
        </form>
      </div>

      {currentUrl && (
        <div className="mt-4">
          <p className="text-sm text-moss/70 mb-2">Current:</p>
          <div className="relative w-full h-32 bg-moss/10 rounded-lg overflow-hidden">
            {isVideo ? (
              <video
                src={currentUrl}
                className="w-full h-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={currentUrl}
                alt="Current"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
