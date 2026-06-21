"use client"

import React, { useEffect, useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminDossierList from './AdminDossierList'
import AdminDossierDetail from './AdminDossierDetail'
import { supabase } from '@/lib/supabase'

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm min-w-35">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1 text-gray-800">{value}</div>
    </div>
  )
}

export default function AdminPanel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dossiers, setDossiers] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from('dossiers').select('*').order('created_at', { ascending: false })
      if (error) console.error('fetch dossiers', error)
      setDossiers(data || [])
    }
    fetch()
  }, [])

  const counts = {
    nouveaux: dossiers.filter(d => d.statut === 'NOUVEAU').length,
    enCours: dossiers.filter(d => d.statut === 'EN_COURS').length,
    termines: dossiers.filter(d => d.statut === 'COMPLET').length,
    refuses: dossiers.filter(d => d.statut === 'REFUSE').length,
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="flex">
        <AdminSidebar />

        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
            </div>

            <div className="flex gap-4 mb-6 flex-wrap">
              <StatCard label="Nouveaux" value={counts.nouveaux} />
              <StatCard label="En cours" value={counts.enCours} />
              <StatCard label="Terminés" value={counts.termines} />
              <StatCard label="Refusés" value={counts.refuses} />
            </div>

            <div>
              <AdminDossierList dossiers={dossiers} onSelect={(id) => { setSelectedId(id); setShowModal(true); }} />
            </div>

            {showModal && selectedId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
                <div className="relative w-full max-w-4xl mx-4">
                  <div className="bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
                    <div className="flex items-center justify-between p-4 border-b">
                      <div className="text-lg font-semibold text-gray-800">Dossier</div>
                      <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-gray-900">Fermer</button>
                    </div>
                    <div className="p-4">
                      <AdminDossierDetail id={selectedId} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
