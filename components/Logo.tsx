'use client'

import Image from 'next/image'

interface LogoProps {
  logoUrl: string
}

export default function Logo({ logoUrl }: LogoProps) {
  if (!logoUrl) {
    // Placeholder logo text when no logo is uploaded
    return (
      <div className="absolute top-6 left-6 z-20">
        <div className="bg-cream/90 backdrop-blur-sm px-4 py-2 rounded-lg">
          <span className="text-moss font-bold text-xl">Kitchen Hub</span>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute top-6 left-6 z-20">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-2 shadow-lg">
        <Image
          src={logoUrl}
          alt="Kitchen Hub Logo"
          width={100}
          height={60}
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}
