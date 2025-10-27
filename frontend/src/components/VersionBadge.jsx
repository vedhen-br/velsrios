import React from 'react'

export default function VersionBadge() {
  if (typeof window === 'undefined') return null
  const info = typeof __APP_BUILD_INFO__ !== 'undefined' ? __APP_BUILD_INFO__ : null
  const isProd = typeof import.meta !== 'undefined' ? import.meta.env?.PROD : false
  if (!isProd || !info) return null

  const short = info.commit ? info.commit.slice(0, 7) : 'n/a'

  return (
    <div style={{
      position: 'fixed', bottom: 10, right: 10, zIndex: 9998,
      background: 'rgba(17,24,39,0.75)', color: '#fff', padding: '4px 8px', borderRadius: 6,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: 11
    }} title={`commit: ${info.commit || 'n/a'}\nbuiltAt: ${info.date || 'n/a'}`}>
      v {short}
    </div>
  )
}
