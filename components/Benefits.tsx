export default function Benefits() {
  const items = [
    { title: 'Traitement rapide', desc: 'Dossiers traités rapidement par nos experts.' },
    { title: 'Accompagnement personnalisé', desc: "Suivi dédié à chaque dossier jusqu'à la délivrance." },
    { title: 'Dépôt 100% en ligne', desc: 'Téléchargez vos documents depuis chez vous.' },
    { title: 'Paiement sécurisé', desc: 'Paiement par Stripe, simple et sûr.' }
  ]

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {items.map((it) => (
        <div key={it.title} className="p-6 border rounded-lg">
          <h3 className="font-semibold text-lg text-blue-900">{it.title}</h3>
          <p className="text-gray-600 mt-2">{it.desc}</p>
        </div>
      ))}
    </div>
  )
}
