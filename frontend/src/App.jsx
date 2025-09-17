import React, { useEffect, useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [dark, setDark] = useState(localStorage.getItem('dark') === '1')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('dark', dark ? '1' : '0')
  }, [dark])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Dashboard Analytics</h1>
          <div className="flex items-center gap-2">
            <button onClick={()=>setDark(d=>!d)} className="px-3 py-1 rounded border">{dark? 'Light' : 'Dark'}</button>
            {token && <button onClick={() => { localStorage.removeItem('token'); setToken(null); }}>Logout</button>}
          </div>
        </header>

        {!token ? (
          <Login onLogin={(t)=>{ localStorage.setItem('token', t); setToken(t); }} />
        ) : (
          <Dashboard token={token} />
        )}
      </div>
    </div>
  )
}