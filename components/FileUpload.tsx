"use client"

import { useState, useRef } from 'react'

type Props = {
  onFilesChange?: (files: File[]) => void
}

export default function FileUpload({ onFilesChange }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const validateAndSet = (arr: File[]) => {
    const newFiles: File[] = []
    const newErrors: string[] = []
    for (const f of arr) {
      const okType = ['application/pdf', 'image/jpeg', 'image/png'].includes(f.type)
      const okSize = f.size <= 20 * 1024 * 1024
      if (!okType) newErrors.push(`${f.name}: type de fichier non supporté`)
      else if (!okSize) newErrors.push(`${f.name}: fichier trop volumineux (>20MB)`)
      else newFiles.push(f)
    }
    setFiles((prev) => [...prev, ...newFiles])
    setErrors(newErrors)
    onFilesChange?.([...files, ...newFiles])
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

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-dashed'} rounded p-4 mb-3 text-center`}
      >
        <div className="mb-2">Glissez-déposez vos fichiers ici ou</div>
        <button type="button" onClick={() => inputRef.current?.click()} className="underline text-blue-700">sélectionner des fichiers</button>
        <input ref={inputRef} type="file" accept=".pdf,image/jpeg,image/png" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
      </div>

      {errors.length > 0 && (
        <div className="mb-2 text-sm text-red-600" role="status" aria-live="polite">
          {errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}

      <div className="space-y-2">
        {files.map((f) => (
          <div key={f.name} className="flex items-center justify-between text-sm text-gray-700">
            <div className="truncate">{f.name}</div>
            <div className="ml-4">{(f.size/1024/1024).toFixed(2)} MB</div>
          </div>
        ))}
      </div>
    </div>
  )
}
