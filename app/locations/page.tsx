'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Location } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLocations = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('created_at', { ascending: true })

        if (data && !error) {
          setLocations(data)
        }
      } catch (error) {
        console.error('Error fetching locations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-moss text-cream py-6 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto relative">
          <Link
            href="/"
            className="absolute left-0 top-1/2 -translate-y-1/2 text-cream/80 hover:text-cream transition-colors text-sm md:text-base"
          >
            ← Back to Home
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-center">Our Locations</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4 md:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-moss text-xl">Loading locations...</div>
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-moss text-xl mb-2">No locations yet</div>
            <p className="text-seaweed/60">Check back soon for our upcoming locations!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Current Locations */}
            {locations.filter(loc => !loc.is_upcoming).length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-moss mb-6">Current Locations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {locations.filter(loc => !loc.is_upcoming).map((location) => (
                    <LocationCard key={location.id} location={location} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Locations */}
            {locations.filter(loc => loc.is_upcoming).length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-moss mb-6">Upcoming Locations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {locations.filter(loc => loc.is_upcoming).map((location) => (
                    <LocationCard key={location.id} location={location} isUpcoming />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function LocationCard({ location, isUpcoming = false }: { location: Location; isUpcoming?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-colors ${
      isUpcoming ? 'border-jade/30 hover:border-jade' : 'border-moss/10 hover:border-jade/30'
    }`}>
      {/* Photo */}
      <div className="relative h-48 bg-moss/10">
        {location.photo_url ? (
          <Image
            src={location.photo_url}
            alt={location.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-moss/30 text-4xl">📍</span>
          </div>
        )}
        {isUpcoming && (
          <div className="absolute top-3 right-3 bg-jade text-cream text-xs font-bold px-3 py-1 rounded-full">
            Coming Soon
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Name */}
        <h2 className="text-xl font-bold text-moss mb-2">{location.name}</h2>

        {/* Address */}
        {location.address && (
          <p className="text-jade text-sm mb-3">{location.address}</p>
        )}

        {/* Description */}
        {location.description && (
          <p className="text-seaweed/80 text-sm mb-4">{location.description}</p>
        )}

        {/* Characteristics */}
        {location.characteristics && location.characteristics.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-moss/10">
            {location.characteristics.map((char) => (
              <div
                key={char.id}
                className="flex items-start gap-2 text-sm"
              >
                <span className="font-semibold text-jade min-w-[80px]">{char.label}:</span>
                <span className="text-seaweed">{char.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
