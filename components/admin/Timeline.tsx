"use client"

import React from 'react'

const events = [
  { date: '20/06/2026', text: 'Dossier créé' },
  { date: '20/06/2026', text: 'Paiement validé' },
  { date: '21/06/2026', text: 'Statut passé à EN_COURS' },
  { date: '22/06/2026', text: 'Documents vérifiés' }
]

export default function Timeline() {
  return (
    <div className="space-y-4">
      {events.map((e, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-10 text-xs text-gray-500">{e.date}</div>
          <div className="flex-1 text-sm text-gray-700">{e.text}</div>
        </div>
      ))}
    </div>
  )
}
