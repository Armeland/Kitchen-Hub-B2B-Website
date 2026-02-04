'use client'

import Link from 'next/link'
import { ButtonConfig } from '@/lib/types'

interface ActionButtonsProps {
  buttons: ButtonConfig[]
  contactFormUrl?: string
}

export default function ActionButtons({ buttons, contactFormUrl }: ActionButtonsProps) {
  const buttonStyle = `
    w-44 h-44 rounded-full font-semibold text-2xl uppercase
    transition-all duration-300 ease-in-out
    flex items-center justify-center text-center
    backdrop-blur-lg bg-mint/50 text-white
    border border-mint/30
    hover:bg-mint/70 hover:scale-105
  `

  return (
    <div className="absolute top-44 right-44 z-20 flex flex-col gap-6">
      {buttons.map((button, index) => (
        <Link
          key={index}
          href={button.link}
          className={buttonStyle}
        >
          <span className="px-4 leading-tight drop-shadow-md">{button.text}</span>
        </Link>
      ))}
      {contactFormUrl && (
        <a
          href={contactFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyle}
        >
          <span className="px-4 leading-tight drop-shadow-md">Contact Us</span>
        </a>
      )}
    </div>
  )
}
