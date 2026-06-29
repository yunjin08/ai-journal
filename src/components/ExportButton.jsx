import { useState } from 'react'
import { supabase } from '../lib/supabase'

function toMarkdown(entries) {
  return entries.map(e => {
    const lines = []
    lines.push(`# ${e.task}`)
    lines.push(`\n**Date:** ${new Date(e.created_at).toISOString().slice(0, 10)}`)
    if (e.tags?.length) lines.push(`**Tags:** ${e.tags.join(', ')}`)
    lines.push(`\n## Stage 1 — My Approach\n\n${e.my_approach}`)
    if (e.ai_approach) lines.push(`\n## Stage 2 — AI / Reference Approach\n\n${e.ai_approach}`)
    if (e.lesson) lines.push(`\n## Lesson\n\n${e.lesson}`)
    return lines.join('\n')
  }).join('\n\n---\n\n')
}

function download(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportButton() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: true })

    setLoading(false)

    if (error || !data) {
      alert('Export failed: ' + (error?.message ?? 'unknown error'))
      return
    }

    const date = new Date().toISOString().slice(0, 10)
    download(JSON.stringify(data, null, 2), `journal-${date}.json`, 'application/json')
    download(toMarkdown(data), `journal-${date}.md`, 'text/markdown')
  }

  return (
    <button className="btn btn-ghost" onClick={handleExport} disabled={loading}>
      {loading ? 'Exporting…' : 'Export'}
    </button>
  )
}
