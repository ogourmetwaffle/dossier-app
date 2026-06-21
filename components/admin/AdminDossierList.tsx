"use client"

import React, { useEffect, useState } from 'react'
import AdminDossierRow from './AdminDossierRow'
import { supabase } from '@/lib/supabase'

type Dossier = {
  id: string
  numero_dossier: string
  nom: string
  prenom: string
  email?: string
  statut?: string
}

export default function AdminDossierList({ dossiers: propDossiers, onSelect }: { dossiers?: Dossier[]; onSelect?: (id: string) => void }) {
  const [dossiers, setDossiers] = useState<Dossier[]>(propDossiers || [])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Tous')

  useEffect(() => {
    if (propDossiers) return
    const fetch = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('dossiers').select('*').order('created_at', { ascending: false })
      if (error) console.error('supabase fetch dossiers', error)
      setDossiers(((data) as unknown) as Dossier[] || [])
      setLoading(false)
    }
    fetch()
  }, [propDossiers])

  const filtered = dossiers.filter((d) => {
    if (filter !== 'Tous') {
      if (filter === 'Nouveau' && d.statut !== 'NOUVEAU') return false
      if (filter === 'En cours' && d.statut !== 'EN_COURS') return false
      if (filter === 'Terminé' && d.statut !== 'COMPLET') return false
      if (filter === 'Refusé' && d.statut !== 'REFUSE') return false
    }
    if (!query) return true
    const q = query.toLowerCase()
    return `${d.numero_dossier}`.toLowerCase().includes(q) || `${d.nom}`.toLowerCase().includes(q) || `${d.prenom}`.toLowerCase().includes(q) || `${d.email}`.toLowerCase().includes(q)
  })

  return (
    <div className="bg-white rounded-md shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Liste des dossiers</h2>
          <div className="flex gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="border rounded px-2 py-1 text-sm" placeholder="Rechercher par nom, email, numéro" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
              <option>Tous</option>
              <option>Nouveau</option>
              <option>En cours</option>
              <option>Terminé</option>
              <option>Refusé</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-2">
        <div className="hidden md:grid text-xs text-gray-500 px-3 py-2 border-b" style={{ gridTemplateColumns: '220px 1fr 120px 110px 120px 120px 80px' }}>
          <div className="">Numéro dossier</div>
          <div className="">Client</div>
          <div className="">Pays</div>
          <div className="">Paiement</div>
          <div className="">Statut</div>
          <div className="">Date dépôt</div>
          <div className="">Actions</div>
        </div>

        <div>
          {loading && <div className="p-4 text-sm text-gray-500">Chargement...</div>}
          {!loading && filtered.map((d) => (
            <AdminDossierRow key={d.id} dossier={d} onOpen={onSelect} />
          ))}
          {!loading && filtered.length === 0 && <div className="p-4 text-sm text-gray-500">Aucun dossier trouvé.</div>}
        </div>
      </div>
    </div>
  )
}
