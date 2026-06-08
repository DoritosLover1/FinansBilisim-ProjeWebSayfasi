import { useState } from 'react';
import './index.css';

function App() {
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

    // GitHub Pages'te proxy çalışmayacağı için doğrudan ngrok adresini kullanıyoruz.
    // (Colab'de CORS'u çözdüğümüz için artık proxy'e ihtiyacımız yok!)
    const API_URL = 'https://untangled-outlast-trousers.ngrok-free.dev/predict_by_date';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ date })
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Veri Sorgulama</h1>
        <p className="subtitle">Lütfen sorgulamak istediğiniz tarihi seçin.</p>
        
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
                <pre style={{ color: '#fc8181' }}>Bir hata oluştu:\n{error}</pre>
              </>
            ) : (
              <div className="results-grid">
                <div className="result-box actual">
                  <span className="label">Gerçek Değer</span>
                  <span className="value">
                    {result.actual !== undefined ? `$${result.actual.toFixed(5)}` : 'Yükleniyor'}
                  </span>
                </div>
                <div className="result-box prediction">
                  <span className="label">Tahmin (Model)</span>
                  <span className="value">
                    {result.prediction !== undefined ? `$${result.prediction.toFixed(5)}` : 'Yükleniyor'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
