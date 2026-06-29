import { useState } from 'react'

export default function TagsInput({ tags, onChange, disabled }) {
  const [input, setInput] = useState('')

  function addTag(raw) {
    const tag = raw.trim().toLowerCase()
    if (!tag || tags.includes(tag)) return
    onChange([...tags, tag])
    setInput('')
  }

  function removeTag(tag) {
    onChange(tags.filter(t => t !== tag))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className="tags-input-row" style={disabled ? { background: '#f2f1ef', cursor: 'not-allowed' } : {}}>
      {tags.map(tag => (
        <span key={tag} className="tag-pill">
          {tag}
          {!disabled && (
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>×</button>
          )}
        </span>
      ))}
      {!disabled && (
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={tags.length === 0 ? 'Add tags (Enter or comma)' : ''}
        />
      )}
    </div>
  )
}
