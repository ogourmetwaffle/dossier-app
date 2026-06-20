"use client"

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">PE</div>
          <div>
            <div className="text-xl font-bold text-blue-900">Permis <span className="text-red-600">Express</span></div>
            <div className="text-sm text-gray-600">Du permis étranger au permis français</div>
          </div>
        </Link>

        <nav className="space-x-4">
          <Link href="/deposer-dossier" className="px-4 py-2 bg-red-600 text-white rounded">Déposer mon dossier</Link>
          <Link href="#faq" className="text-gray-700">FAQ</Link>
          <Link href="#contact" className="text-gray-700">Contact</Link>
          <Link href="/admin" className="text-gray-700">Admin</Link>
        </nav>
      </div>
    </header>
  )
}
