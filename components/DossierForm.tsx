"use client"

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DossierForm() {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', whatsapp: '', adresse: '', pays_permis: '' })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (uploadedFiles.length === 0) {
        alert('Veuillez ajouter au moins un document')
        setLoading(false)
        return
      }

      const numeroDossier = 'PE-' + Date.now()

      // create dossier record
      const { data: dossierData, error: insertError } = await supabase
        .from('dossiers')
        .insert({
          numero_dossier: numeroDossier,
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          telephone: form.telephone,
          whatsapp: form.whatsapp,
          adresse: form.adresse,
          pays_permis: form.pays_permis,
          statut: 'NOUVEAU',
          montant: 49,
          paiement_effectue: false
        })
        .select()
        .single()

      if (insertError || !dossierData) {
        console.error(insertError)
        alert('Erreur lors de la création du dossier')
        setLoading(false)
        return
      }

      const dossierId = dossierData.id

      // upload files to Supabase Storage and save metadata
      for (const f of uploadedFiles) {
        const safeName = f.name.replace(/[^a-z0-9.\-_]/gi, '')
        const path = `${numeroDossier}/${Date.now()}_${safeName}`

        const { error: uploadError } = await supabase.storage.from('documents').upload(path, f)
        if (uploadError) {
          console.error('Upload error', uploadError)
          // continue to next file but notify
          alert('Erreur lors de l\'upload du fichier: ' + f.name)
          continue
        }

        const { error: metaError } = await supabase.from('documents').insert({
          dossier_id: dossierId,
          nom_fichier: f.name,
          chemin_storage: path,
          type_document: f.type
        })

        if (metaError) console.error('Meta insert error', metaError)
      }

      // create Stripe Checkout session
      const resp = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: numeroDossier, dossierId })
      })

      const json = await resp.json()
      if (json?.url) {
        // redirect to Stripe Checkout
        window.location.href = json.url
      } else {
        alert('Impossible de démarrer le paiement')
        router.push(`/merci?numero=${encodeURIComponent(numeroDossier)}`)
      }
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la création du dossier')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <div className="grid md:grid-cols-2 gap-4">
        <input name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} className="border p-2" required />
        <input name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} className="border p-2" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2" required />
        <input name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} className="border p-2" />
        <input name="whatsapp" placeholder="WhatsApp" value={form.whatsapp} onChange={handleChange} className="border p-2" />
        <input name="adresse" placeholder="Adresse" value={form.adresse} onChange={handleChange} className="border p-2" />
        <select name="pays_permis" value={form.pays_permis} onChange={handleChange} className="border p-2">
          <option value="">Pays du permis</option>
          <option>Maroc</option>
          <option>Algérie</option>
          <option>Tunisie</option>
          <option>Autre</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="block font-semibold mb-2">Documents (PDF, JPG, PNG) — max 20MB chacun</label>
        <FileUpload onFilesChange={(f) => setUploadedFiles(f)} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">Montant: <span className="font-bold">49€</span></div>
        <button disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded">{loading ? 'Envoi...' : 'Payer et déposer'}</button>
      </div>
    </form>
  )
}
