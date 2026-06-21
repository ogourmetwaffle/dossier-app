"use client"

import React from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, Circle } from 'lucide-react'

type Dossier = {
  id: string
  numero_dossier: string
  nom: string
  prenom: string
  paiement_effectue?: boolean
  pays_permis?: string
  statut?: string
  created_at?: string
}

export default function AdminDossierRow({ dossier, onOpen }: { dossier: Dossier; onOpen?: (id: string) => void }) {
  const { id, numero_dossier, nom, prenom, pays_permis, paiement_effectue, statut, created_at } = dossier
  const gridStyle = { gridTemplateColumns: '220px 1fr 120px 110px 120px 120px 80px' }

  const badge = () => {
    if (statut === 'NOUVEAU') return <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center" style={{ background: '#FFF7ED', color: '#B45309' }}><Circle size={12} className="mr-2" />Nouveau</span>
    if (statut === 'EN_COURS') return <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center" style={{ background: '#E8F0FF', color: '#173B8C' }}><Circle size={12} className="mr-2" />En cours</span>
    if (statut === 'COMPLET') return <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center" style={{ background: '#ECFDF5', color: '#16A34A' }}><Circle size={12} className="mr-2" />Terminé</span>
    return <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center" style={{ background: '#FFF1F1', color: '#E30613' }}><Circle size={12} className="mr-2" />Refusé</span>
  }

  return (
    <div className="grid items-center px-3 py-3 hover:bg-gray-50" style={gridStyle}>
      <div className="text-sm text-gray-700">{numero_dossier}</div>
      <div className="text-sm text-gray-800 truncate">{nom} {prenom}</div>
      <div className="text-sm text-gray-700">{pays_permis}</div>
      <div className="text-sm">{paiement_effectue ? <span className="text-[#16A34A]"><CheckCircle size={14} className="inline-block mr-1"/>Payé</span> : <span className="text-gray-500"><XCircle size={14} className="inline-block mr-1"/>Non</span>}</div>
      <div>{badge()}</div>
      <div className="text-sm text-gray-600">{created_at ? new Date(created_at).toLocaleDateString() : ''}</div>
      <div>
        {onOpen ? (
          <button onClick={() => onOpen(id)} className="text-sm text-blue-600 underline">Voir</button>
        ) : (
          <Link href={`/admin/dossiers/${encodeURIComponent(numero_dossier)}`} className="text-sm text-blue-600 underline">Voir</Link>
        )}
      </div>
    </div>
  )
}
