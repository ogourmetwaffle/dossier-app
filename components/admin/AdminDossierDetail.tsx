"use client"

import React, { useEffect, useState } from 'react'
import DocumentList from './DocumentList'
import { CheckCircle, XCircle } from 'lucide-react'
import StatusSelector from './StatusSelector'
import Timeline from './Timeline'
import { supabase } from '@/lib/supabase'

type Dossier = {
  id: string
  numero_dossier: string
  nom: string
  prenom: string
  email?: string
  telephone?: string
  pays_permis?: string
  montant?: number
  paiement_effectue?: boolean
  date_paiement?: string
  stripe_payment_id?: string
  stripe_session_id?: string
  statut?: string
  created_at?: string
}

export default function AdminDossierDetail({ id }: { id: string }) {
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      // Support fetching by numeric id or by numero_dossier (PE-...)
      let query = supabase.from('dossiers').select('*')
      if (typeof id === 'string' && id.startsWith('PE-')) {
        query = query.eq('numero_dossier', id)
      } else {
        query = query.eq('id', id)
      }
      const { data, error } = await query.single()
      if (error) console.error('fetch dossier', error)
      setDossier(data)
      setLoading(false)
    }
    fetch()
  }, [id])

  if (loading) return <div className="p-4">Chargement...</div>
  if (!dossier) return <div className="p-4 text-gray-600">Dossier introuvable.</div>

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-[#173B8C] mb-3">Dossier {dossier.numero_dossier}</h2>

      <div className="space-y-4">
        <div className="bg-white border rounded p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Informations client</h3>
          <div className="text-sm text-gray-800 font-medium">{dossier.nom} {dossier.prenom}</div>
          <div className="text-sm text-gray-600">{dossier.email}</div>
          <div className="text-sm text-gray-600">{dossier.telephone}</div>
          <div className="text-sm text-gray-600">Pays permis: {dossier.pays_permis}</div>
          <div className="text-sm text-gray-500 mt-2">Créé le: {dossier.created_at ? new Date(dossier.created_at).toLocaleString() : '-'}</div>
        </div>

        <div className="bg-white border rounded p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Paiement</h3>
          <div className="text-sm">Montant: <strong>{dossier.montant ?? 49}€</strong></div>
          <div className="text-sm my-2">Statut: {dossier.paiement_effectue ? <span className="text-[#16A34A] font-semibold flex items-center gap-2"><CheckCircle size={16}/>Payé</span> : <span className="text-[#E30613] font-semibold flex items-center gap-2"><XCircle size={16}/>Non payé</span>}</div>
          <div className="text-sm text-gray-600">Date paiement: {dossier.date_paiement || '-'}</div>
          <div className="text-sm text-gray-600">Payment ID: {dossier.stripe_payment_id || '-'}</div>
          <div className="text-sm text-gray-600">Session ID: {dossier.stripe_session_id || '-'}</div>
          {dossier.stripe_payment_id && (
            <div className="mt-3">
              <a href={`https://dashboard.stripe.com/payments/${dossier.stripe_payment_id}`} target="_blank" rel="noreferrer" className="inline-block bg-[#173B8C] text-white px-3 py-2 rounded">Voir sur Stripe</a>
            </div>
          )}
        </div>

        <div className="bg-white border rounded p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Statut dossier</h3>
          <StatusSelector currentStatus={dossier.statut} dossierId={dossier.id} />
        </div>

        <div className="bg-white border rounded p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Documents</h3>
          <DocumentList numero={dossier.numero_dossier} />
        </div>

        <div className="bg-white border rounded p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Historique</h3>
          <Timeline />
        </div>
      </div>
    </div>
  )
}
