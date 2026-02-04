'use client'

interface HotspotModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  imageUrls?: string[]
  contactFormUrl?: string
}

export default function HotspotModal({
  isOpen,
  onClose,
  title,
  description,
  imageUrls = [],
  contactFormUrl,
}: HotspotModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-cream/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-[1400px] w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-14 h-14 rounded-full bg-moss/10 hover:bg-moss/20
                     flex items-center justify-center transition-colors"
        >
          <svg
            className="w-8 h-8 text-moss"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content Container */}
        <div className="flex flex-col md:flex-row min-h-[500px]">
          {/* Image Section */}
          <div className="md:w-1/2 bg-mint/20 p-10">
            {imageUrls.length > 0 ? (
              <div className="space-y-6">
                {imageUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-2xl overflow-hidden bg-moss/10"
                  >
                    <img
                      src={url}
                      alt={`${title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 h-full flex items-center justify-center">
                <div className="aspect-video w-full rounded-2xl bg-moss/20 flex items-center justify-center">
                  <div className="text-center text-moss/60">
                    <svg
                      className="w-24 h-24 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-lg">Image placeholder</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Text Section */}
          <div className="md:w-1/2 p-12 flex flex-col justify-center">
            <h2 className="text-5xl font-bold text-moss mb-6">{title}</h2>
            <p className="text-seaweed/80 text-2xl leading-relaxed mb-8">{description}</p>
            {contactFormUrl && (
              <a
                href={contactFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-mint hover:bg-jade text-moss font-bold
                           px-8 py-4 rounded-full text-xl transition-colors shadow-lg self-start"
              >
                Contact Us
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
