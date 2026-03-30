import React, { useState, useEffect } from 'react';
import './App.css';
import Wheel from './Wheel';
import Login from './Login';

const API_BASE_URL = 'https://soundframes.netsons.org/wp-json/loyalty/v1';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    const initApp = async () => {
      const savedUser = localStorage.getItem('ristoLoyaltyUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        await fetchUserData(parsedUser.email);
      } else {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const fetchUserData = async (email) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user-data/?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(prev => ({
            ...prev,
            punti: data.user.punti,
            punti_totali: data.user.punti_totali || prev.punti,
            nome: data.user.nome || prev.nome
          }));
          setRewards(data.rewards || []);
        }
      }
    } catch (e) {
      console.error('Errore sincronizzazione:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (userData) => {
    setIsLoading(true);
    setUser(userData);
    localStorage.setItem('ristoLoyaltyUser', JSON.stringify(userData));
    await fetchUserData(userData.email);
  };

  const handleLogout = () => {
    localStorage.removeItem('ristoLoyaltyUser');
    setUser(null);
    setActiveTab('home');
  };

  const handleWheelWin = async (wonPoints) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/add-points/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-risto-secret': '1234' // N.B. In produzione va usato il vero PIN Cameriere!
        },
        body: JSON.stringify({
          email: user.email,
          points: wonPoints
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(prev => ({ ...prev, punti: data.punti }));
        }
      }
    } catch (err) {
      console.error("Errore salvataggio vincita", err);
    } finally {
      // Re-fetch everything to ensure rewards list is up to date (if the backend adds it to rewards)
      await fetchUserData(user.email);
    }
  };

  if (!user && !isLoading) {
    return <Login onLogin={handleLogin} />;
  }

  if (!user && isLoading) {
    return (
      <div className="loader-screen">
        <div className="spinner-small"></div>
        <p style={{marginTop:'1rem', color:'#fbbf24'}}>Caricamento Club...</p>
      </div>
    );
  }

  const targetPoints = 500;
  const progressPercent = Math.min((user.punti / targetPoints) * 100, 100);

  return (
    <div className="loyalty-app">
      {isLoading && (
        <div className="sync-overlay">
           <div className="spinner-small"></div>
           <span>Sincronizzazione API in corso...</span>
        </div>
      )}

      <div className="loyalty-container">
        <header className="loyalty-header">
          <div className="profile-info">
            <div className="avatar">{user.nome.charAt(0).toUpperCase()}</div>
            <div className="welcome-text">
              <span className="greeting">Bentornato,</span>
              <h1 className="name">{user.nome}</h1>
            </div>
          </div>
          <div className="points-badge">
            <span className="points-value">{user.punti}</span>
            <span className="points-label">pt</span>
          </div>
        </header>

        <div className="level-progress-section card-glass">
          <div className="level-header">
            <span className="current-level">Livello {user.livello || 'Silver'}</span>
            <span className="target-level">Gold 🏆</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <p className="progress-text">
            Mancano <strong>{Math.max(0, targetPoints - user.punti)} punti</strong> al Gold!
          </p>
        </div>

        <main className="loyalty-main">
          {activeTab === 'home' && (
            <>
              <div className="card-glass center-content" style={{marginBottom: '2rem'}}>
                <h2 className="section-title">Premi Sempre Più Vicini</h2>
                <p className="section-subtitle">Continua a guadagnare punti e sblocca ricompense esclusive.</p>
                <button className="btn-spin" onClick={() => setActiveTab('ruota')}>
                  GIRA LA RUOTA
                </button>
              </div>

              <div className="rewards-section">
                <div className="rewards-header">
                  <h3 className="section-title">Premi Da Ritirare</h3>
                  <a href="#" className="see-all">Vedi tutti</a>
                </div>
                
                <div className="rewards-list">
                  {rewards.length === 0 ? (
                    <p style={{color: '#a1a1aa', fontSize: '0.9rem'}}>Nessun premio in sospeso. Gira la ruota per vincere!</p>
                  ) : (
                    rewards.map((reward, idx) => (
                      <div key={reward.codice_univoco || idx} className="reward-item card-glass">
                        <div className="reward-icon">🎁</div>
                        <div className="reward-details">
                          <h4 className="reward-name">{reward.premio}</h4>
                          <span className="reward-date">{reward.data_vincita}</span>
                        </div>
                        <div className="reward-code">
                          <span>{reward.codice_univoco}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'ruota' && (
            <div className="card-glass center-content" style={{ padding: '20px 10px' }}>
               <Wheel onWin={handleWheelWin} />
            </div>
          )}

          {activeTab === 'profilo' && (
            <div className="card-glass center-content">
               <div className="avatar" style={{width:'80px', height:'80px', fontSize:'2.5rem', marginBottom:'1rem'}}>{user.nome.charAt(0).toUpperCase()}</div>
               <h2>{user.nome}</h2>
               <p style={{marginTop: '0.5rem', color: '#a1a1aa'}}>{user.punti} Punti Totali • Livello {user.livello || 'Silver'}</p>
               <p style={{marginTop: '1rem', color: '#555', fontSize: '0.9rem'}}>{user.email}</p>
               
               <button 
                 className="btn-spin" 
                 onClick={handleLogout} 
                 style={{
                   marginTop: '2rem', 
                   padding: '12px 24px', 
                   fontSize: '0.9rem', 
                   background: 'transparent', 
                   border: '1px solid rgba(255,255,255,0.2)', 
                   color: '#fafafa', 
                   boxShadow: 'none'
                 }}
               >
                  LOGOUT
               </button>
            </div>
          )}
        </main>

        <div style={{ height: '90px' }}></div>
      </div>

      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>
        <button 
          className={`nav-item center-nav-action ${activeTab === 'ruota' ? 'active' : ''}`}
          onClick={() => setActiveTab('ruota')}
        >
          <div className="nav-icon-floating">🎡</div>
          <span className="nav-label">Ruota</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'profilo' ? 'active' : ''}`}
          onClick={() => setActiveTab('profilo')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profilo</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
