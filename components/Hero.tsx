'use client'

interface HeroProps {
  heroType: 'image' | 'video'
  heroUrl: string
}

export default function Hero({ heroType, heroUrl }: HeroProps) {
  if (!heroUrl) {
    // Placeholder gradient when no hero is set
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-moss via-jade to-seaweed" />
    )
  }

  if (heroType === 'video') {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={heroUrl} type="video/mp4" />
      </video>
    )
  }

  return (
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroUrl})` }}
    />
  )
}
