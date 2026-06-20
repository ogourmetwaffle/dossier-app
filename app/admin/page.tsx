"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/AdminHeader'
import AdminDossierList from '@/components/AdminDossierList'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/admin/login')
        return
      }
      setChecking(false)
    }
    check()
  }, [router])

  if (checking) return <div className="min-h-screen flex items-center justify-center">Vérification...</div>

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
          <AdminDossierList />
        </div>
      </main>
    </div>
  )
}
