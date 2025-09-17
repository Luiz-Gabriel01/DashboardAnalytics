import React, { useState } from 'react'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login falhou');
      onLogin(data.token);
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-xl mb-4">Faça login</h2>
      {error && <div className="mb-2 text-red-500">{error}</div>}

      {/* Campo Usuário */}
      <label className="block mb-2">
        <div className="text-sm">Usuário</div>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Digite seu usuário"
          className="mt-1 w-full p-2 rounded border
                     bg-white dark:bg-gray-700
                     text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500"
        />
      </label>

      {/* Campo Senha */}
      <label className="block mb-4">
        <div className="text-sm">Senha</div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Digite sua senha"
          className="mt-1 w-full p-2 rounded border
                     bg-white dark:bg-gray-700
                     text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500"
        />
      </label>

      <div className="flex gap-2">
        <button
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded">
          Entrar
        </button>

        {/* Quick Register */}
        <button
          type="button"
          onClick={async () => {
            setLoading(true); setError(null);
            try {
              const res = await fetch('http://localhost:4000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: 'user' + Math.floor(Math.random() * 1000),
                  password: 'password'
                })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Falha ao registrar');
              onLogin(data.token);
            } catch (err) { setError(err.message); }
            setLoading(false);
          }}
          className="px-4 py-2 border rounded">
          Quick Register
        </button>
      </div>
    </form>
  )
}
