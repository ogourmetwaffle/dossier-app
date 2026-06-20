"use client"

import { useState } from 'react'

type Props = {
  onFilesChange?: (files: File[]) => void
}

export default function FileUpload({ onFilesChange }: Props) {
  const [files, setFiles] = useState<File[]>([])

  const handleFiles = (fList: FileList | null) => {
    if (!fList) return
    const arr = Array.from(fList)
    const valid = arr.filter((f) => {
      const okType = ['application/pdf', 'image/jpeg', 'image/png'].includes(f.type)
      const okSize = f.size <= 20 * 1024 * 1024
      return okType && okSize
    })
    setFiles(valid)
    onFilesChange?.(valid)
  }

  return (
    <div>
      <input
        type="file"
        accept=".pdf,image/jpeg,image/png"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="mb-3"
      />

      <div className="space-y-2">
        {files.map((f) => (
          <div key={f.name} className="text-sm text-gray-700">{f.name} • {(f.size/1024/1024).toFixed(2)} MB</div>
        ))}
      </div>
    </div>
  )
}
