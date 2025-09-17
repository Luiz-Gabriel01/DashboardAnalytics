import React, { useEffect, useState } from 'react';
import TimeSeriesChart from '../components/TimeSeriesChart';

export default function Dashboard({ token }) {
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]);

  useEffect(() => {
    const headers = { 'Authorization': 'Bearer ' + token };

    // 🔹 Resumo completo
    fetch('http://localhost:4000/api/dashboard', { headers })
      .then(r => r.json())
      .then(setSummary)
      .catch(() => { });

    // 🔹 Métricas para gráfico
    fetch('http://localhost:4000/api/metrics', { headers })
      .then(r => r.json())
      .then(d => {
        const mapped = d.map(p => ({
          date: new Date(p.ts).toLocaleDateString(),
          value: p.value
        }));
        setSeries(mapped);
      })
      .catch(() => { });
  }, [token]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 p-4 bg-white dark:bg-gray-800 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Métricas (últimos 30 dias)</h3>
        <TimeSeriesChart data={series} />
      </div>

      <aside className="p-4 bg-white dark:bg-gray-800 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Resumo</h3>
        {summary ? (
          <ul className="space-y-2">
            <li>Usuários: <strong>{summary.userCount}</strong></li>
            <li>Média métrica: <strong>{summary.media}</strong></li>
            <li>Máximo: <strong>{summary.max}</strong></li>
            <li>Mínimo: <strong>{summary.min}</strong></li>
            <li>Total: <strong>{summary.total}</strong></li>
          </ul>
        ) : (
          <div>Carregando...</div>
        )}
      </aside>
    </div>
  );
}
