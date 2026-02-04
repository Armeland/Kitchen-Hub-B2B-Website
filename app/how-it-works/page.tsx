'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import HotspotModal from '@/components/HotspotModal'

// Floor plan background image URL
const FLOOR_PLAN_URL = 'https://ydphaxugqmdiurgsnsfo.supabase.co/storage/v1/object/public/Photos/Floor%20Plan.png'

interface Hotspot {
  id: string
  title: string
  description: string
  imageUrls: string[]
  position: { x: number; y: number }
}

const hotspots: Hotspot[] = [
  {
    id: 'ordering',
    title: 'Customer Ordering',
    description:
      'The Customer starts by placing their order digitally in person or off-premises for pick-up or delivery.',
    imageUrls: [],
    position: { x: 90, y: 85 },
  },
  {
    id: 'kitchen',
    title: 'Kitchen Space',
    description:
      'Restaurant Partners are provided their own dedicated, health inspected, kitchen space, freezer and dry/cold storage. With all of the infrastructure required to start cooking.',
    imageUrls: [],
    position: { x: 15, y: 50 },
  },
  {
    id: 'handoff',
    title: 'Order Handoff',
    description:
      'Kitchen Hub has developed an express pick-up model that allows for a quick and convenient order handoff experience.',
    imageUrls: [],
    position: { x: 85, y: 50 },
  },
]

export default function HowItWorksPage() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [contactFormUrl, setContactFormUrl] = useState('')

  useEffect(() => {
    const fetchContactUrl = async () => {
      if (!supabase) return

      const { data } = await supabase
        .from('site_settings')
        .select('contact_form_url')
        .single()

      if (data?.contact_form_url) {
        setContactFormUrl(data.contact_form_url)
      }
    }

    fetchContactUrl()
  }, [])

  const activeData = hotspots.find((h) => h.id === activeHotspot)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floor Plan Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${FLOOR_PLAN_URL})` }}
      />

      {/* Header */}
      <header className="relative z-30 p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-cream/90 hover:text-cream transition-colors
                     bg-moss/50 backdrop-blur-sm px-4 py-2 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </header>

      {/* 3 Easy Steps Box */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-moss/70 backdrop-blur-sm text-cream px-8 py-4 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-2">3 Easy Steps</h2>
          <p className="text-lg">1. Order  •  2. Kitchen Space  •  3. Order Handoff</p>
        </div>
      </div>

      {/* Hotspot Buttons */}
      {hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          onClick={() => setActiveHotspot(hotspot.id)}
          className="absolute z-20 group"
          style={{
            left: `${hotspot.position.x}%`,
            top: `${hotspot.position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-mint/40 animate-ping" />
          {/* Outer ring */}
          <span className="absolute -inset-3 rounded-full border-2 border-mint animate-pulse" />
          {/* Button */}
          <span
            className="relative flex items-center justify-center w-14 h-14 rounded-full
                       bg-mint text-moss font-bold text-xl shadow-xl
                       group-hover:scale-110 group-hover:bg-cream
                       transition-all duration-300"
          >
            {hotspot.id === 'ordering' && '1'}
            {hotspot.id === 'kitchen' && '2'}
            {hotspot.id === 'handoff' && '3'}
          </span>
          {/* Label */}
          <span
            className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap
                       bg-cream/90 text-moss text-sm font-semibold px-3 py-1 rounded-full
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
          >
            {hotspot.title}
          </span>
        </button>
      ))}

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-center">
        <p className="bg-moss/70 backdrop-blur-sm text-cream/90 text-xl px-6 py-3 rounded-full">
          Click the numbered points to learn more
        </p>
      </div>

      {/* Modal */}
      <HotspotModal
        isOpen={!!activeHotspot}
        onClose={() => setActiveHotspot(null)}
        title={activeData?.title || ''}
        description={activeData?.description || ''}
        imageUrls={activeData?.imageUrls || []}
        contactFormUrl={contactFormUrl}
      />
    </div>
  )
}
