import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function EntryDetail({ id, onBack }) {
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [msg, setMsg] = useState(null)

  // Stage 2 editable fields
  const [aiApproach, setAiApproach] = useState('')
  const [lesson, setLesson] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setEntry(data)
        setAiApproach(data.ai_approach ?? '')
        setLesson(data.lesson ?? '')
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSaveStage2(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMsg(null)

    const { error } = await supabase
      .from('entries')
      .update({
        ai_approach: aiApproach.trim() || null,
        lesson: lesson.trim() || null,
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      setError(error.message)
    } else {
      setMsg('Saved.')
      setTimeout(() => setMsg(null), 2500)
    }
  }

  if (loading) return <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading…</p>
  if (!entry) return <p style={{ color: 'var(--muted)', fontSize: 14 }}>Entry not found.</p>

  return (
    <div>
      <button className="back-link" onClick={onBack}>← Back to timeline</button>

      <div className="detail-meta">
        {formatDate(entry.created_at)}
        {entry.tags?.length > 0 && (
          <span style={{ marginLeft: 16 }}>
            {entry.tags.map(t => (
              <span key={t} className="tag" style={{ marginRight: 4 }}>{t}</span>
            ))}
          </span>
        )}
      </div>

      {/* Stage 1 — read-only always */}
      <div className="stage-panel">
        <div className="stage-header">
          <span className="stage-label">Stage 1 — My Approach</span>
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>
            committed {formatDate(entry.approach_committed_at)}
          </span>
        </div>

        <div className="detail-section">
          <div className="detail-section-label">Problem / Task</div>
          <div className="detail-text">{entry.task}</div>
        </div>

        <div className="detail-section">
          <div className="detail-section-label">My Approach</div>
          <div className="detail-text">{entry.my_approach}</div>
        </div>
      </div>

      <hr className="divider" />

      {/* Stage 2 — editable */}
      <div className="stage-panel">
        <div className="stage-header">
          <span className="stage-label">Stage 2 — AI Discussion &amp; Lesson</span>
        </div>

        {error && <div className="msg msg-error">{error}</div>}
        {msg && <div className="msg msg-success">{msg}</div>}

        <form className="stage2-form" onSubmit={handleSaveStage2}>
          <div className="field">
            <label htmlFor="ai_approach">AI / Reference Approach</label>
            <textarea
              id="ai_approach"
              rows={8}
              value={aiApproach}
              onChange={e => setAiApproach(e.target.value)}
              placeholder="What did the AI or reference say? How did it differ?"
            />
          </div>

          <div className="field">
            <label htmlFor="lesson">Lesson</label>
            <textarea
              id="lesson"
              rows={4}
              value={lesson}
              onChange={e => setLesson(e.target.value)}
              placeholder="What's the one thing you're taking away?"
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Stage 2'}
          </button>
        </form>
      </div>
    </div>
  )
}
