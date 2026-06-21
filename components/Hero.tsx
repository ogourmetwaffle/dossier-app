import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="bg-linear-to-r from-white to-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-900 leading-tight">Votre permis étranger, notre expertise</h1>
          <p className="mt-4 text-gray-700 text-base sm:text-lg">Conversion de permis étranger vers permis français — simple, rapide et sécurisé.</p>

          <div className="mt-6 flex items-center gap-4">
            <Link href="/deposer-dossier" className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold">Déposer mon dossier</Link>
            <Link href="#" className="text-gray-700">En savoir plus</Link>
            <div className="text-sm text-gray-600 ml-4">À partir de <span className="text-red-600 font-bold">49€</span></div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="rounded-lg overflow-hidden shadow-lg bg-white">
            <Image src="/flyer-mock.png" alt="Permis Express" width={800} height={450} className="w-full h-56 object-cover" priority />
          </div>
        </div>
      </div>
    </section>
  )
}
