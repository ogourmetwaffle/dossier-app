"use client"

import React from 'react'

const events = [
  { date: '20/06/2026', text: 'Dossier créé' },
  { date: '20/06/2026', text: 'Paiement validé' },
  { date: '21/06/2026', text: 'Statut passé à EN_COURS' },
  { date: '22/06/2026', text: 'Documents vérifiés' }
]

const parseDate = (s: string) => {
  const parts = s.split('/')
  if (parts.length !== 3) return new Date(s)
  const [d, m, y] = parts.map((p) => Number(p))
  return new Date(y, m - 1, d)
}

export default function Timeline({ items }: { items?: { date: string; text: string }[] }) {
  const source = items ?? events
  const sorted = [...source].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())

  return (
    <div className="relative">
      <div className="border-l-2 border-gray-200 pl-6">
        {sorted.map((e, i) => (
          <div key={i} className="mb-6">
            <div className="text-xs text-gray-500">{e.date}</div>
            <div className="text-sm text-gray-700 mt-1 leading-relaxed">{e.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
