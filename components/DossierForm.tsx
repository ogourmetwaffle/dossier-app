"use client"

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import Button from '@/components/Button'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DossierForm() {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', whatsapp: '', adresse: '', pays_permis: '' })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newErrors: Record<string,string> = {}
      if (!form.nom) newErrors.nom = 'Nom requis'
      if (!form.prenom) newErrors.prenom = 'Prénom requis'
      if (!form.email) newErrors.email = 'Email requis'
      if (uploadedFiles.length === 0) newErrors.files = 'Ajoutez au moins un document'

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
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
        setErrors({ form: 'Erreur lors de la création du dossier' })
        setLoading(false)
        return
      }

      const dossierId = dossierData.id

      // upload files to Supabase Storage
      for (const f of uploadedFiles) {
        try {
          // sanitize and encode filename to avoid issues with spaces/special chars
          const baseName = f.name.replace(/[^a-z0-9.\-_.]/gi, '_')
          const path = `${numeroDossier}/${Date.now()}_${baseName}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(path, f, { contentType: f.type, upsert: false })

          console.log('Supabase upload response', { uploadData, uploadError })

          if (uploadError) {
            console.error('Upload error', uploadError)
            alert(`Erreur lors de l'upload du fichier ${f.name} : ${uploadError.message}`)
            continue
          }

          // metadata storage removed — no DB insert for file metadata
          } catch (err) {
            console.error('Unexpected upload error', err)
            const message = err instanceof Error ? err.message : String(err)
            alert(`Erreur inattendue lors de l'upload du fichier ${f.name} : ${message}`)
          }
      }
      // attempt to send confirmation emails (non-blocking for business flow)
      try {
        await fetch('/api/send-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            nom: form.nom,
            prenom: form.prenom,
            telephone: form.telephone,
            numeroDossier
          })
        })
      } catch (err) {
        console.error('Failed to call send-emails API', err)
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
        setErrors({ form: 'Impossible de démarrer le paiement' })
        router.push(`/merci?numero=${encodeURIComponent(numeroDossier)}`)
      }
    } catch (err) {
      console.error(err)
      setErrors({ form: 'Erreur lors de la création du dossier' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium mb-1">Nom</label>
          <input id="nom" name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} className="border p-2 w-full" aria-invalid={!!errors.nom} aria-describedby={errors.nom ? 'err-nom' : undefined} />
          {errors.nom && <div id="err-nom" className="text-sm text-red-600 mt-1">{errors.nom}</div>}
        </div>

        <div>
          <label htmlFor="prenom" className="block text-sm font-medium mb-1">Prénom</label>
          <input id="prenom" name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} className="border p-2 w-full" aria-invalid={!!errors.prenom} aria-describedby={errors.prenom ? 'err-prenom' : undefined} />
          {errors.prenom && <div id="err-prenom" className="text-sm text-red-600 mt-1">{errors.prenom}</div>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2 w-full" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'err-email' : undefined} />
          {errors.email && <div id="err-email" className="text-sm text-red-600 mt-1">{errors.email}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <input name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp</label>
          <input name="whatsapp" placeholder="WhatsApp" value={form.whatsapp} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Adresse</label>
          <input name="adresse" placeholder="Adresse" value={form.adresse} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Pays du permis</label>
          <select name="pays_permis" value={form.pays_permis} onChange={handleChange} className="border p-2 w-full">
            <option value="">Pays du permis</option>
            <option>Maroc</option>
            <option>Algérie</option>
            <option>Tunisie</option>
            <option>Autre</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block font-semibold mb-2">Documents (PDF, JPG, PNG) — max 20MB chacun</label>
        <FileUpload onFilesChange={(f) => setUploadedFiles(f)} />
      </div>

      {errors.form && <div className="text-sm text-red-600 mt-4">{errors.form}</div>}

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">Montant: <span className="font-bold">49€</span></div>
        <Button loading={loading} className="w-full sm:w-auto">{loading ? 'Envoi...' : 'Payer et déposer'}</Button>
      </div>
    </form>
  )
}
