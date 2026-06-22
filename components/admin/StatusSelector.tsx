"use client"

import React, { useState } from 'react'

export default function StatusSelector({ currentStatus, dossierId }: { currentStatus?: string; dossierId: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const updateStatus = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/admin/update-statut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dossierId, statut: status })
      })
      const json = await resp.json()
      if (!resp.ok) {
        console.error('update statut api', json)
        setMessage('Erreur lors de la mise à jour')
      } else {
        setMessage('Statut mis à jour')
      }
    } catch (err) {
      console.error(err)
      setMessage('Erreur réseau')
    }
    setLoading(false)
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="space-y-3">
      <div className="text-sm">Statut actuel: <strong className="ml-2">{status}</strong></div>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-2 py-1 w-full">
        <option value="NOUVEAU">Nouveau</option>
        <option value="EN_COURS">En cours</option>
        <option value="COMPLET">Terminé</option>
        <option value="REFUSE">Refusé</option>
      </select>
      <button type="button" onClick={updateStatus} disabled={loading} className="w-full bg-[#173B8C] text-white py-2 rounded cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Mise à jour...' : 'Mettre à jour'}</button>
      {message && <div className="text-sm text-gray-600">{message}</div>}
    </div>
  )
}
