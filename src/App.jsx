import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Timeline from './components/Timeline'
import NewEntry from './components/NewEntry'
import EntryDetail from './components/EntryDetail'

// Simple screen-based router — no dependency needed for 3 screens
// screen: 'timeline' | 'new' | 'detail'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [screen, setScreen] = useState('timeline')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null // initial load — avoids flash

  if (!session) return <Auth />

  function handleSelectEntry(id) {
    setSelectedId(id)
    setScreen('detail')
  }

  function handleCreated(entry) {
    // After committing Stage 1, go straight to the entry detail so user can add Stage 2
    setSelectedId(entry.id)
    setScreen('detail')
  }

  return (
    <>
      <nav>
        <div className="layout">
          <span className="brand">SoftEng Journal</span>
          <div className="nav-links">
            <button
              className={screen === 'timeline' || screen === 'detail' ? 'active' : ''}
              onClick={() => setScreen('timeline')}
            >
              Timeline
            </button>
            <button
              className={screen === 'new' ? 'active' : ''}
              onClick={() => setScreen('new')}
            >
              New Entry
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="layout">
        {screen === 'timeline' && (
          <Timeline
            onSelect={handleSelectEntry}
            onNewEntry={() => setScreen('new')}
          />
        )}
        {screen === 'new' && (
          <NewEntry onCreated={handleCreated} />
        )}
        {screen === 'detail' && selectedId && (
          <EntryDetail
            id={selectedId}
            onBack={() => setScreen('timeline')}
          />
        )}
      </div>
    </>
  )
}
