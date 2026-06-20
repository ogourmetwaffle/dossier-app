const steps = [
  { title: '1. Déposer les documents', desc: 'Téléchargez permis, pièce d\'identité, justificatif, photo.' },
  { title: '2. Paiement sécurisé', desc: 'Paiement simple via Stripe Checkout.' },
  { title: '3. Traitement du dossier', desc: 'Nos équipes vérifient et traitent votre dossier.' },
  { title: '4. Réception du permis', desc: 'Réception et envoi du permis français.' }
]

export default function Process() {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {steps.map((s) => (
        <div key={s.title} className="p-6 bg-white rounded shadow">
          <div className="text-red-600 font-bold mb-2">{s.title}</div>
          <div className="text-gray-600">{s.desc}</div>
        </div>
      ))}
    </div>
  )
}
