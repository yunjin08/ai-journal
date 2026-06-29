import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ExportButton from './ExportButton'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function Timeline({ onSelect, onNewEntry }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState(null)
  const [allTags, setAllTags] = useState([])

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('entries')
        .select('id, created_at, task, lesson, tags')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setEntries(data)
        const tagSet = new Set()
        data.forEach(e => e.tags?.forEach(t => tagSet.add(t)))
        setAllTags([...tagSet].sort())
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = activeTag
    ? entries.filter(e => e.tags?.includes(activeTag))
    : entries

  if (loading) return <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading…</p>

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Timeline</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <ExportButton />
          <button className="btn btn-primary" onClick={onNewEntry}>+ New entry</button>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="tag-filter">
          <span className="tag-filter-label">Filter:</span>
          {allTags.map(tag => (
            <span
              key={tag}
              className={`tag clickable ${activeTag === tag ? 'active' : ''}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
            </span>
          ))}
          {activeTag && (
            <button
              className="btn btn-ghost"
              style={{ padding: '2px 10px', fontSize: 12 }}
              onClick={() => setActiveTag(null)}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          {activeTag ? `No entries tagged "${activeTag}".` : 'No entries yet. Create your first one.'}
        </p>
      ) : (
        <div className="entry-list">
          {filtered.map(entry => (
            <div key={entry.id} className="entry-row" onClick={() => onSelect(entry.id)}>
              <span className="entry-date">{formatDate(entry.created_at)}</span>
              <div>
                <div className="entry-task">{entry.task}</div>
                {entry.lesson && (
                  <div className="entry-lesson-preview">{entry.lesson}</div>
                )}
              </div>
              <div className="entry-tags">
                {entry.tags?.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
