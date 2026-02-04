'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SiteSettings, defaultSettings } from '@/lib/types'
import ImageUploader from '@/components/admin/ImageUploader'
import FontSelector from '@/components/admin/FontSelector'
import TextEditor from '@/components/admin/TextEditor'
import Link from 'next/link'

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [loading, setLoading] = useState(true)

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
            contactFormUrl: data.contact_form_url || defaultSettings.contactFormUrl,
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [isAuthenticated])

  const handleSave = async () => {
    if (!supabase) {
      setSaveStatus('error')
      return
    }

    setSaving(true)
    setSaveStatus('idle')

    try {
      // First try to update, if no rows affected, insert
      const { data: existingData } = await supabase
        .from('site_settings')
        .select('id')
        .single()

      const settingsData = {
        font: settings.font,
        hero_type: settings.heroType,
        hero_url: settings.heroUrl,
        logo_url: settings.logoUrl,
        overlay_text: settings.overlayText,
        buttons: settings.buttons,
        contact_form_url: settings.contactFormUrl,
      }

      if (existingData) {
        await supabase
          .from('site_settings')
          .update(settingsData)
          .eq('id', existingData.id)
      } else {
        await supabase
          .from('site_settings')
          .insert([{ id: 1, ...settingsData }])
      }

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const updateButton = (index: number, field: 'text' | 'link', value: string) => {
    const newButtons = [...settings.buttons]
    newButtons[index] = { ...newButtons[index], [field]: value }
    setSettings({ ...settings, buttons: newButtons })
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
        <div className="animate-pulse text-moss text-xl">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-moss text-cream py-4 px-6 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Kitchen Hub Admin</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-cream/80 hover:text-cream transition-colors text-sm"
            >
              View Site →
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
        <div className="space-y-8">
          {/* Save Button - Sticky */}
          <div className="bg-white rounded-xl shadow-lg p-4 sticky top-20 z-40">
            <div className="flex items-center justify-between">
              <div>
                {saveStatus === 'success' && (
                  <span className="text-green-600 font-medium">✓ Changes saved!</span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-red-600 font-medium">Failed to save. Check Supabase config.</span>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-moss text-cream px-6 py-2 rounded-lg font-semibold
                           hover:bg-jade transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Locations Management Link */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-moss">Locations</h2>
                <p className="text-seaweed/60 text-sm mt-1">Manage location cards displayed on the Locations page</p>
              </div>
              <Link
                href="/admin/locations"
                className="bg-jade text-cream px-5 py-2 rounded-lg font-semibold
                           hover:bg-moss transition-colors"
              >
                Manage Locations →
              </Link>
            </div>
          </section>

          {/* Font Settings */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-moss mb-4 border-b border-moss/10 pb-2">
              Typography
            </h2>
            <FontSelector
              currentFont={settings.font}
              onChange={(font) => setSettings({ ...settings, font })}
            />
          </section>

          {/* Logo Upload */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-moss mb-4 border-b border-moss/10 pb-2">
              Logo
            </h2>
            <ImageUploader
              label="Logo Image"
              currentUrl={settings.logoUrl}
              onUpload={(url) => setSettings({ ...settings, logoUrl: url })}
              accept="image"
              storagePath="logos"
            />
          </section>

          {/* Hero Media */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-moss mb-4 border-b border-moss/10 pb-2">
              Hero Media
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-moss mb-2">
                  Media Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="heroType"
                      value="image"
                      checked={settings.heroType === 'image'}
                      onChange={() => setSettings({ ...settings, heroType: 'image' })}
                      className="w-4 h-4 text-moss"
                    />
                    <span className="text-seaweed">Image</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="heroType"
                      value="video"
                      checked={settings.heroType === 'video'}
                      onChange={() => setSettings({ ...settings, heroType: 'video' })}
                      className="w-4 h-4 text-moss"
                    />
                    <span className="text-seaweed">Video</span>
                  </label>
                </div>
              </div>
              <ImageUploader
                label={`Hero ${settings.heroType === 'video' ? 'Video' : 'Image'}`}
                currentUrl={settings.heroUrl}
                onUpload={(url) => setSettings({ ...settings, heroUrl: url })}
                accept={settings.heroType === 'video' ? 'video' : 'image'}
                storagePath="hero"
              />
            </div>
          </section>

          {/* Text Overlay */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-moss mb-4 border-b border-moss/10 pb-2">
              Text Overlay
            </h2>
            <TextEditor
              label="Overlay Text (Bottom Left)"
              value={settings.overlayText}
              onChange={(text) => setSettings({ ...settings, overlayText: text })}
              multiline
              placeholder="Enter your marketing text here..."
            />
          </section>

          {/* Buttons */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-moss mb-4 border-b border-moss/10 pb-2">
              Action Buttons
            </h2>
            <div className="space-y-6">
              {settings.buttons.map((button, index) => (
                <div key={index} className="p-4 bg-cream/50 rounded-lg space-y-4">
                  <h3 className="font-semibold text-moss">Button {index + 1}</h3>
                  <TextEditor
                    label="Button Text"
                    value={button.text}
                    onChange={(text) => updateButton(index, 'text', text)}
                    placeholder="Button label..."
                  />
                  <TextEditor
                    label="Button Link"
                    value={button.link}
                    onChange={(link) => updateButton(index, 'link', link)}
                    placeholder="/page-url"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Contact Form */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-moss mb-4 border-b border-moss/10 pb-2">
              Contact Us Button
            </h2>
            <p className="text-seaweed/60 text-sm mb-4">
              A &quot;Contact Us&quot; button will appear after your other buttons. Paste your Google Form URL below.
            </p>
            <TextEditor
              label="Google Form URL"
              value={settings.contactFormUrl}
              onChange={(url) => setSettings({ ...settings, contactFormUrl: url })}
              placeholder="https://docs.google.com/forms/d/e/..."
            />
          </section>

          {/* Supabase Notice */}
          {!supabase && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
              <h3 className="text-yellow-800 font-bold mb-2">⚠️ Supabase Not Configured</h3>
              <p className="text-yellow-700 text-sm">
                To save settings and upload images, you need to configure Supabase.
                Add your Supabase URL and anon key to{' '}
                <code className="bg-yellow-200 px-1 rounded">.env.local</code>.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
