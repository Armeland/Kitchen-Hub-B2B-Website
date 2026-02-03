'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Location, LocationCharacteristic } from '@/lib/types'
import ImageUploader from '@/components/admin/ImageUploader'
import Link from 'next/link'

export default function AdminLocationsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set())

  const toggleLocation = (id: string) => {
    setExpandedLocations(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
    if (password === adminPassword) {
      setIsAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Incorrect password')
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    fetchLocations()
  }, [isAuthenticated])

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

  const addLocation = async () => {
    const newLocationId = crypto.randomUUID()

    // Base location data without is_upcoming (in case column doesn't exist)
    const baseLocation = {
      id: newLocationId,
      name: 'New Location',
      address: '',
      description: '',
      photo_url: '',
      characteristics: []
    }

    const newLocationFull: Omit<Location, 'created_at'> = {
      ...baseLocation,
      is_upcoming: false
    }

    if (!supabase) {
      // Allow adding locally even without Supabase for testing
      setLocations([...locations, newLocationFull as Location])
      setExpandedLocations(prev => new Set(prev).add(newLocationId))
      return
    }

    setSaving(true)
    try {
      // Try with is_upcoming first
      let { error } = await supabase
        .from('locations')
        .insert([{ ...baseLocation, is_upcoming: false }])

      // If is_upcoming column doesn't exist, try without it
      if (error && error.message.includes('is_upcoming')) {
        const result = await supabase
          .from('locations')
          .insert([baseLocation])
        error = result.error
      }

      if (error) {
        console.error('Supabase error:', error)
        alert(`Error: ${error.message}. Make sure the locations table exists in Supabase.`)
      } else {
        setLocations([...locations, newLocationFull as Location])
        setExpandedLocations(prev => new Set(prev).add(newLocationId))
      }
    } catch (error) {
      console.error('Error adding location:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    // Update local state immediately for better UX
    setLocations(locations.map(loc =>
      loc.id === id ? { ...loc, ...updates } : loc
    ))

    if (!supabase) return

    setSaving(true)
    try {
      // If updating is_upcoming, try without it first if it fails
      let { error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)

      // If is_upcoming column doesn't exist, notify user
      if (error && error.message.includes('is_upcoming') && 'is_upcoming' in updates) {
        alert('The "Upcoming Location" feature requires adding the is_upcoming column to your Supabase locations table. Run: ALTER TABLE locations ADD COLUMN is_upcoming BOOLEAN DEFAULT false;')
        // Try updating other fields if any
        const { is_upcoming, ...otherUpdates } = updates
        if (Object.keys(otherUpdates).length > 0) {
          const result = await supabase
            .from('locations')
            .update(otherUpdates)
            .eq('id', id)
          error = result.error
        } else {
          error = null
        }
      }

      if (error) {
        console.error('Error updating location:', error)
      }
    } catch (error) {
      console.error('Error updating location:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteLocation = async (id: string) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this location?')) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)

      if (!error) {
        setLocations(locations.filter(loc => loc.id !== id))
      }
    } catch (error) {
      console.error('Error deleting location:', error)
    } finally {
      setSaving(false)
    }
  }

  const addCharacteristic = (locationId: string) => {
    const location = locations.find(l => l.id === locationId)
    if (!location) return

    const newChar: LocationCharacteristic = {
      id: crypto.randomUUID(),
      label: '',
      value: ''
    }

    const updatedChars = [...(location.characteristics || []), newChar]
    updateLocation(locationId, { characteristics: updatedChars })
  }

  const updateCharacteristic = (
    locationId: string,
    charId: string,
    field: 'label' | 'value',
    newValue: string
  ) => {
    const location = locations.find(l => l.id === locationId)
    if (!location) return

    const updatedChars = location.characteristics.map(char =>
      char.id === charId ? { ...char, [field]: newValue } : char
    )

    // Update local state immediately for better UX
    setLocations(locations.map(loc =>
      loc.id === locationId ? { ...loc, characteristics: updatedChars } : loc
    ))
  }

  const saveCharacteristics = async (locationId: string) => {
    const location = locations.find(l => l.id === locationId)
    if (!location) return
    await updateLocation(locationId, { characteristics: location.characteristics })
  }

  const removeCharacteristic = (locationId: string, charId: string) => {
    const location = locations.find(l => l.id === locationId)
    if (!location) return

    const updatedChars = location.characteristics.filter(char => char.id !== charId)
    updateLocation(locationId, { characteristics: updatedChars })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-moss mb-6 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-moss mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-moss/30 bg-cream
                           focus:border-jade focus:outline-none transition-colors"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            {authError && (
              <p className="text-red-600 text-sm">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-moss text-cream py-3 rounded-lg font-semibold
                         hover:bg-jade transition-colors"
            >
              Login
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-jade hover:text-moss transition-colors text-sm">
              ← Back to Website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-pulse text-moss text-xl">Loading locations...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-moss text-cream py-4 px-6 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Manage Locations</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-cream/80 hover:text-cream transition-colors text-sm"
            >
              ← Back to Admin
            </Link>
            <Link
              href="/locations"
              target="_blank"
              className="text-cream/80 hover:text-cream transition-colors text-sm"
            >
              View Page →
            </Link>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-cream/80 hover:text-cream transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-6">
        <div className="space-y-6">
          {/* Add Location Button */}
          <div className="flex justify-end">
            <button
              onClick={addLocation}
              disabled={saving}
              className="bg-jade text-cream px-6 py-3 rounded-lg font-semibold
                         hover:bg-moss transition-colors disabled:opacity-50"
            >
              + Add Location
            </button>
          </div>

          {/* Locations List */}
          {locations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-seaweed/60 mb-4">No locations yet</p>
              <button
                onClick={addLocation}
                className="text-jade hover:text-moss transition-colors font-semibold"
              >
                Add your first location
              </button>
            </div>
          ) : (
            locations.map((location) => (
              <div key={location.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Collapsible Header */}
                <div
                  className="bg-moss text-cream px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-moss/90 transition-colors"
                  onClick={() => toggleLocation(location.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`transform transition-transform ${expandedLocations.has(location.id) ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    <h2 className="text-lg font-bold">{location.name || 'New Location'}</h2>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteLocation(location.id)
                    }}
                    className="text-cream/70 hover:text-red-300 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>

                {/* Collapsible Content */}
                {expandedLocations.has(location.id) && (
                <div className="p-6 space-y-6">
                  {/* Photo */}
                  <div>
                    <label className="block text-sm font-semibold text-moss mb-2">
                      Photo
                    </label>
                    <ImageUploader
                      label=""
                      currentUrl={location.photo_url}
                      onUpload={(url) => updateLocation(location.id, { photo_url: url })}
                      accept="image"
                      storagePath="locations"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-moss mb-2">
                      Location Name
                    </label>
                    <input
                      type="text"
                      value={location.name}
                      onChange={(e) => updateLocation(location.id, { name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-moss/30 bg-cream
                                 focus:border-jade focus:outline-none transition-colors"
                      placeholder="e.g. Downtown Toronto"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-moss mb-2">
                      Location Address
                    </label>
                    <input
                      type="text"
                      value={location.address || ''}
                      onChange={(e) => updateLocation(location.id, { address: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-moss/30 bg-cream
                                 focus:border-jade focus:outline-none transition-colors"
                      placeholder="e.g. 123 Main Street, Toronto, ON"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-moss mb-2">
                      Brief Description
                    </label>
                    <textarea
                      value={location.description || ''}
                      onChange={(e) => updateLocation(location.id, { description: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-moss/30 bg-cream
                                 focus:border-jade focus:outline-none transition-colors resize-none"
                      placeholder="A brief description of this location..."
                      rows={3}
                    />
                  </div>

                  {/* Upcoming Location Checkbox */}
                  <div className="flex items-center gap-3 p-4 bg-cream/50 rounded-lg">
                    <input
                      type="checkbox"
                      id={`upcoming-${location.id}`}
                      checked={location.is_upcoming || false}
                      onChange={(e) => updateLocation(location.id, { is_upcoming: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-moss/30 text-jade focus:ring-jade"
                    />
                    <label htmlFor={`upcoming-${location.id}`} className="text-sm font-semibold text-moss cursor-pointer">
                      Upcoming Location
                    </label>
                    <span className="text-seaweed/60 text-sm">
                      (Check this to show in the &quot;Upcoming Locations&quot; section)
                    </span>
                  </div>

                  {/* Characteristics */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-moss">
                        Characteristics
                      </label>
                      <button
                        onClick={() => addCharacteristic(location.id)}
                        className="text-jade hover:text-moss transition-colors text-sm font-semibold"
                      >
                        + Add Field
                      </button>
                    </div>

                    {location.characteristics && location.characteristics.length > 0 ? (
                      <div className="space-y-3">
                        {location.characteristics.map((char) => (
                          <div key={char.id} className="flex items-center gap-3">
                            <input
                              type="text"
                              value={char.label}
                              onChange={(e) => updateCharacteristic(location.id, char.id, 'label', e.target.value)}
                              onBlur={() => saveCharacteristics(location.id)}
                              className="w-1/3 px-3 py-2 rounded-lg border-2 border-moss/30 bg-cream
                                         focus:border-jade focus:outline-none transition-colors text-sm"
                              placeholder="Label..."
                            />
                            <input
                              type="text"
                              value={char.value}
                              onChange={(e) => updateCharacteristic(location.id, char.id, 'value', e.target.value)}
                              onBlur={() => saveCharacteristics(location.id)}
                              className="flex-1 px-3 py-2 rounded-lg border-2 border-moss/30 bg-cream
                                         focus:border-jade focus:outline-none transition-colors text-sm"
                              placeholder="Value..."
                            />
                            <button
                              onClick={() => removeCharacteristic(location.id, char.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-2"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-seaweed/40 text-sm italic">
                        No characteristics added yet
                      </p>
                    )}
                  </div>
                </div>
                )}
              </div>
            ))
          )}

          {/* Supabase Notice */}
          {!supabase && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
              <h3 className="text-yellow-800 font-bold mb-2">Supabase Not Configured</h3>
              <p className="text-yellow-700 text-sm">
                To manage locations, you need to configure Supabase and create a locations table.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
