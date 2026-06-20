export default function FAQ() {
  const faqs = [
    { q: 'Quel est le prix ?', a: 'À partir de 49€ selon prestation indiquée.' },
    { q: 'Quels documents sont nécessaires ?', a: 'Permis étranger, pièce d\'identité, justificatif de domicile, photo.' },
    { q: 'Combien de temps ?', a: 'Le délai dépend du traitement administratif — nous vous accompagnons.' }
  ]

  return (
    <div id="faq">
      <h2 className="text-2xl font-bold text-blue-900">FAQ</h2>
      <div className="mt-6 space-y-4">
        {faqs.map((f) => (
          <div key={f.q} className="p-4 border rounded">
            <div className="font-semibold">{f.q}</div>
            <div className="text-gray-600 mt-1">{f.a}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
