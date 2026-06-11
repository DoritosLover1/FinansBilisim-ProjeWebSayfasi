import { useState } from 'react';
import './index.css';

const API_BASE = 'https://untangled-outlast-trousers.ngrok-free.dev';

function ResultGrid({ result }) {
  return (
    <div className="results-grid">
      <div className="result-box actual">
        <span className="label">Gerçek Değer</span>
        <span className="value">
          {result.actual !== undefined ? `$${result.actual.toFixed(5)}` : '—'}
        </span>
      </div>
      <div className="result-box prediction">
        <span className="label">Tahmin (Model)</span>
        <span className="value">
          {result.prediction !== undefined ? `$${result.prediction.toFixed(5)}` : '—'}
        </span>
      </div>
    </div>
  );
}

function DateMode() {
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/predict_by_date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ date })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="dateInput">Tarih</label>
          <input
            type="date"
            id="dateInput"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min="2013-12-27"
            max="2021-07-06"
            required
          />
        </div>
        <button type="submit" className={loading ? 'loading' : ''} disabled={loading}>
          <span>Sorgula</span>
          <div className="loader"></div>
        </button>
      </form>

      {(result || error) && (
        <div className="result-container" style={{ display: 'block' }}>
          {error ? (
            <>
              <h3 style={{ fontSize: '14px', color: '#718096', marginBottom: '12px' }}>Sonuç:</h3>
              <pre style={{ color: '#fc8181' }}>Bir hata oluştu:{'\n'}{error}</pre>
            </>
          ) : (
            <ResultGrid result={result} />
          )}
        </div>
      )}
    </>
  );
}

const OHLCV_FIELDS = [
  { key: 'Open',   label: 'Open',   placeholder: '0.08200' },
  { key: 'High',   label: 'High',   placeholder: '0.09100' },
  { key: 'Low',    label: 'Low',    placeholder: '0.07900' },
  { key: 'Close',  label: 'Close',  placeholder: '0.08800' },
  { key: 'Volume', label: 'Volume', placeholder: '1234567890' },
];

function ManualMode() {
  const [fields, setFields] = useState({ Open: '', High: '', Low: '', Close: '', Volume: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (key, val) => setFields(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const body = Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, parseFloat(v)])
      );
      const res = await fetch(`${API_BASE}/predict_manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className="subtitle" style={{ marginTop: 0, marginBottom: '16px' }}>
        Güncel OHLCV değerlerini girin — model bir sonraki günü tahmin eder.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="ohlcv-grid">
          {OHLCV_FIELDS.map(({ key, label, placeholder }) => (
            <div className="input-group" key={key}>
              <label htmlFor={key}>{label}</label>
              <input
                type="number"
                id={key}
                step="any"
                placeholder={placeholder}
                value={fields[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                required
              />
            </div>
          ))}
        </div>
        <button type="submit" className={loading ? 'loading' : ''} disabled={loading}>
          <span>Tahmin Et</span>
          <div className="loader"></div>
        </button>
      </form>

      {(result || error) && (
        <div className="result-container" style={{ display: 'block' }}>
          {error ? (
            <>
              <h3 style={{ fontSize: '14px', color: '#718096', marginBottom: '12px' }}>Sonuç:</h3>
              <pre style={{ color: '#fc8181' }}>Bir hata oluştu:{'\n'}{error}</pre>
            </>
          ) : (
            <>
              <div className="results-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="result-box prediction">
                  <span className="label">Yarınki Tahmin (Model)</span>
                  <span className="value">
                    {result.prediction !== undefined ? `$${result.prediction.toFixed(5)}` : '—'}
                  </span>
                </div>
              </div>
              {result.note && (
                <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '10px', textAlign: 'center' }}>
                  ℹ️ {result.note}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState('date');

  return (
    <div className="container">
      <div className="card">
        <h1>Dogecoin Tahmin</h1>
        <p className="subtitle">Tarihsel veri sorgula ya da manuel değer girerek tahmin al.</p>

        {/* Tab switcher */}
        <div className="tab-bar">
          <button
            className={`tab-btn${tab === 'date' ? ' active' : ''}`}
            onClick={() => setTab('date')}
            type="button"
          >
            📅 Tarih ile Sorgula
          </button>
          <button
            className={`tab-btn${tab === 'manual' ? ' active' : ''}`}
            onClick={() => setTab('manual')}
            type="button"
          >
            ✏️ Manuel Giriş
          </button>
        </div>

        {tab === 'date' ? <DateMode /> : <ManualMode />}
      </div>
    </div>
  );
}
