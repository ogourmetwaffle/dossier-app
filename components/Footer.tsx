export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
        <div>
          <div className="font-bold">Permis Express</div>
          <div className="text-sm text-gray-300">Tous droits réservés • 2026</div>
        </div>

        <div className="mt-4 md:mt-0">
          <div>Contact: <a href="tel:+33699142598" className="text-red-400">+33 6 99 14 25 98</a></div>
          <div>Email: <a href="mailto:contact@permiexpress.example" className="text-red-400">contact@permiexpress.example</a></div>
        </div>
      </div>
    </footer>
  )
}
