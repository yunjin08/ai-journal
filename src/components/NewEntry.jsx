import { useState } from 'react'
import { supabase } from '../lib/supabase'
import TagsInput from './TagsInput'

export default function NewEntry({ onCreated }) {
  const [task, setTask] = useState('')
  const [myApproach, setMyApproach] = useState('')
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleCommit(e) {
    e.preventDefault()
    if (!task.trim() || !myApproach.trim()) return

    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('entries')
      .insert({
        task: task.trim(),
        my_approach: myApproach.trim(),
        tags,
        approach_committed_at: new Date().toISOString(),
      })
      .select()
      .single()

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      onCreated(data)
    }
  }

  return (
    <div>
      <h1 className="page-title">New Entry</h1>

      {error && <div className="msg msg-error">{error}</div>}

      <form onSubmit={handleCommit}>
        <div className="stage-panel">
          <div className="stage-header">
            <span className="stage-label">Stage 1 — My Approach</span>
          </div>

          <div className="field">
            <label htmlFor="task">Problem / Task</label>
            <textarea
              id="task"
              rows={3}
              value={task}
              onChange={e => setTask(e.target.value)}
              placeholder="What is the problem you are solving?"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="my_approach">My Approach</label>
            <textarea
              id="my_approach"
              rows={8}
              value={myApproach}
              onChange={e => setMyApproach(e.target.value)}
              placeholder="How would you solve this? Write your own thinking before looking anything up."
              required
            />
          </div>

          <div className="field">
            <label>Tags</label>
            <TagsInput tags={tags} onChange={setTags} disabled={false} />
          </div>
        </div>

        <div className="stage-panel locked">
          <div className="stage-header">
            <span className="lock-icon">🔒</span>
            <span className="stage-label">Stage 2 — AI Discussion &amp; Lesson</span>
          </div>

          <div className="field">
            <label>AI / Reference Approach</label>
            <textarea rows={5} disabled placeholder="Unlocks after Stage 1 is committed." />
          </div>

          <div className="field">
            <label>Lesson</label>
            <textarea rows={4} disabled placeholder="Unlocks after Stage 1 is committed." />
          </div>
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading || !task.trim() || !myApproach.trim()}
        >
          {loading ? 'Committing…' : 'Commit my approach →'}
        </button>
      </form>
    </div>
  )
}
