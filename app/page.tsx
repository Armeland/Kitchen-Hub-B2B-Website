'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SiteSettings, defaultSettings } from '@/lib/types'
import Hero from '@/components/Hero'
import TextOverlay from '@/components/TextOverlay'
import ActionButtons from '@/components/ActionButtons'

export default function Home() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .single()

        if (data && !error) {
          setSettings({
            font: data.font || defaultSettings.font,
            heroType: data.hero_type || defaultSettings.heroType,
            heroUrl: data.hero_url || defaultSettings.heroUrl,
            logoUrl: data.logo_url || defaultSettings.logoUrl,
            overlayText: data.overlay_text || defaultSettings.overlayText,
            buttons: data.buttons || defaultSettings.buttons,
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()

    // Set up real-time subscription
    if (supabase) {
      const channel = supabase
        .channel('site_settings_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_settings' },
          (payload) => {
            const data = payload.new as Record<string, unknown>
            if (data) {
              setSettings({
                font: (data.font as string) || defaultSettings.font,
                heroType: (data.hero_type as 'image' | 'video') || defaultSettings.heroType,
                heroUrl: (data.hero_url as string) || defaultSettings.heroUrl,
                logoUrl: (data.logo_url as string) || defaultSettings.logoUrl,
                overlayText: (data.overlay_text as string) || defaultSettings.overlayText,
                buttons: (data.buttons as typeof defaultSettings.buttons) || defaultSettings.buttons,
              })
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-moss text-2xl font-bold">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Hero Background */}
      <Hero heroType={settings.heroType} heroUrl={settings.heroUrl} />

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Text Overlay - Bottom Left */}
      <TextOverlay text={settings.overlayText} />

      {/* Action Buttons - Bottom Right */}
      <ActionButtons buttons={settings.buttons} />
    </main>
  )
}
