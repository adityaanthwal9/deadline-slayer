import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0f 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
        >
          {/* Sword blade - diagonal slash */}
          <line x1="4" y1="20" x2="20" y2="4" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Sword tip */}
          <line x1="18" y1="2" x2="22" y2="6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          {/* Crossguard */}
          <line x1="14" y1="10" x2="10" y2="6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          {/* Handle */}
          <line x1="2" y1="22" x2="5" y2="19" stroke="#888" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Slash effect lines */}
          <line x1="17" y1="9" x2="20" y2="7" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6"/>
          <line x1="15" y1="11" x2="19" y2="8" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.3"/>
        </svg>
      </div>
    ),
    { ...size }
  )
}
