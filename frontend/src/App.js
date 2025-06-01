import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api'; // Update if backend URL is different

export default function App() {
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch latest logs from backend
  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/logs`);
      const data = await res.json();
      console.log(data);
      
      if(data.logs){
        setLogs(data.logs);      
      }else{
        setMessage('Error: ' + data.error);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  const clearLogs = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/logs', { method: 'DELETE' });
    const data = await res.json();
    fetchLogs(); // Refresh logs
  } catch (err) {
    console.error(err);
  }
};


  // Fetch logs on component mount
  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle button clicks to control cron job
  const handleAction = async (action) => {
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/${action}`, {
        method: 'POST',
      });
      const data = await res.json();
      setMessage(data.message);
      fetchLogs(); // refresh logs after action
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Cron Task</h2>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => handleAction('stop')} style={{ marginRight: 10, padding: '8px 12px' }}>
          Stop Cron
        </button>
        <button onClick={() => handleAction('restore')} style={{ marginRight: 10, padding: '8px 12px' }}>
          Restore Cron
        </button>
        <button onClick={() => handleAction('recreate')} style={{ marginRight: 10,padding: '8px 12px' }}>
          Recreate Cron
        </button>
        <button onClick={clearLogs} style={{ padding: '8px 12px' }}>Clear Logs</button>
      </div>

      {message && (
        <p style={{ color: 'grey', fontWeight: 'bold' }}>
          {message}
        </p>
      )}

      <h3>Latest Cron Logs</h3>
      {logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <ul>
          {logs.map((log) => (
            <li key={log.id}>
              [{new Date(log.timestamp).toLocaleString()}] - {log.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}