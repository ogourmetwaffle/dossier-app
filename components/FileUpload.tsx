"use client"

import { useState, useRef } from 'react'

type Props = {
  onFilesChange?: (files: File[]) => void
}

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

export default function FileUpload({ onFilesChange }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const shortName = (name: string, max = 60) => {
    if (name.length <= max) return name
    const prefix = name.slice(0, Math.max(8, max - 12))
    const suffix = name.slice(-8)
    return `${prefix}....${suffix}`
  }

  const fileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || ''
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼'
    if (ext === 'pdf') return '📄'
    return '📁'
  }

  const validateAndSet = (arr: File[]) => {
    const newFiles: File[] = []
    const newErrors: string[] = []
    for (const f of arr) {
      const okType = ['application/pdf', 'image/pdf', 'image/jpeg', 'image/png'].includes(f.type) || /\.(pdf|jpe?g|png)$/i.test(f.name)
      const okSize = f.size <= MAX_SIZE
      if (!okType) newErrors.push(`${f.name}: type de fichier non supporté`)
      else if (!okSize) newErrors.push(`${f.name}: fichier trop volumineux (>50MB)`)
      else newFiles.push(f)
    }
    const updated = [...files, ...newFiles]
    setFiles(updated)
    setErrors(newErrors)
    onFilesChange?.(updated)
  }

  const handleFiles = (fList: FileList | null) => {
    if (!fList) return
    validateAndSet(Array.from(fList))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeFile = (name: string) => {
    const updated = files.filter((f) => f.name !== name)
    setFiles(updated)
    onFilesChange?.(updated)
  }

  return (
    <div className="bg-white rounded-lg border p-4 h-[380px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-gray-600 rounded p-1">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M16 16v-6"/><path d="M12 12l4-4-4-4-4 4 4 4z" transform="rotate(180 12 8)"/><path d="M20 16a4 4 0 00-3.46-3.97A5 5 0 0012 6a5 5 0 00-4.54 6.03A4 4 0 004 16"/></svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Documents</div>
          <div className="text-xs text-gray-500">Formats : PDF, JPG, PNG — max 50 MB</div>
        </div>
      </div>

      {/* Dropzone (compact 120-160px) */}
      <div className="mb-3">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`w-full rounded-lg transition cursor-pointer ${dragOver ? 'border-2 border-blue-200 bg-white shadow-sm' : 'border-2 border-dashed border-gray-200 bg-gray-50'}`}
        >
          <div className="flex flex-col items-center justify-center h-[140px] px-3">
            <div className="text-3xl mb-1">☁️</div>
            <div className="mb-1 text-sm text-gray-700">Déposer vos documents</div>
            <div className="text-sm text-blue-600"><button type="button" onClick={() => inputRef.current?.click()} className="underline cursor-pointer">ou cliquez pour sélectionner</button></div>
            <input ref={inputRef} type="file" accept=".pdf,image/jpeg,image/png" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-2 text-sm text-red-600" role="status" aria-live="polite">
          {errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}

      {/* Selected files (inside card) */}
      <div className="mt-2">
        <div className="text-sm font-medium text-gray-900 mb-2">Fichiers sélectionnés ({files.length})</div>
        <div className="space-y-2 overflow-auto pr-2" style={{ maxHeight: '176px' }}>
          {files.length === 0 && (
            <div className="text-sm text-gray-500">Ajoutez vos documents pour continuer.</div>
          )}

          {files.map((f, idx) => (
            <div key={`${f.name}-${idx}`} className="flex items-center justify-between bg-gray-50 border rounded-md px-3" style={{ minHeight: '48px', maxHeight: '56px' }}>
              <div className="flex items-center gap-3 min-w-0 py-2">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center border text-sm">{fileIcon(f.name)}</div>
                <div className="min-w-0">
                  <div className="text-sm text-gray-800 truncate max-w-[60%] sm:max-w-[280px]">{shortName(f.name, 40)}</div>
                </div>
                <div className="text-xs text-gray-500 ml-3">{(f.size/1024/1024).toFixed(2)} MB</div>
              </div>
              <button type="button" onClick={() => removeFile(f.name)} className="ml-3 bg-red-50 text-red-600 rounded-full p-2 cursor-pointer" aria-label={`Supprimer ${f.name}`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
