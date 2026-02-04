export interface ButtonConfig {
  text: string
  link: string
}

export interface LocationCharacteristic {
  id: string
  label: string
  value: string
}

export interface Location {
  id: string
  name: string
  address: string
  description: string
  photo_url: string
  characteristics: LocationCharacteristic[]
  is_upcoming: boolean
  created_at?: string
}

export interface SiteSettings {
  font: string
  heroType: 'image' | 'video'
  heroUrl: string
  logoUrl: string
  overlayText: string
  buttons: ButtonConfig[]
  contactFormUrl: string
}

export const defaultSettings: SiteSettings = {
  font: 'Jost',
  heroType: 'image',
  heroUrl: 'https://ydphaxugqmdiurgsnsfo.supabase.co/storage/v1/object/public/Photos/Hero.png',
  logoUrl: 'https://ydphaxugqmdiurgsnsfo.supabase.co/storage/v1/object/public/Photos/Logo.png',
  overlayText: "Kitchen Hub is Canada's First Digital Foodhall. Restaurants launch quickly, cheaply and easily. Customers get what they want all together in one order. Everybody wins.",
  buttons: [
    { text: 'How Kitchen Hub Works', link: '/how-it-works' },
    { text: 'Locations', link: '/locations' },
  ],
  contactFormUrl: '',
}

export const availableFonts = [
  'Jost',
  'Inter',
  'Poppins',
  'Montserrat',
  'Open Sans',
  'Roboto',
]
