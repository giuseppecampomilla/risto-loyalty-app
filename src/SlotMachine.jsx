import React, { useState, useEffect, useRef } from 'react';
import './Games.css';

const SYMBOLS = ['🍕', '🍷', '🍺', '🍝', '🍰'];

export default function SlotMachine({ onWin, onGoToWallet }) {
  const [reels, setReels] = useState(['🍷', '🍕', '🍰']);
  const [spinningReels, setSpinningReels] = useState([false, false, false]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [winMessage, setWinMessage] = useState('');
  const [prizeResult, setPrizeResult] = useState('');

  const spinIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  const spin = () => {
    if (isSpinning || isSubmitted) return;
    setIsSpinning(true);
    setShowModal(false);
    
    setSpinningReels([true, true, true]);
    
    spinIntervalRef.current = setInterval(() => {
      setReels(prev => [
        // Update solo se sono veri
        Math.random() > 0.5 ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : prev[0],
        Math.random() > 0.5 ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : prev[1],
        Math.random() > 0.5 ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : prev[2]
      ]);
    }, 100);

    const finalReels = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    ];
    
    const chance = Math.random();
    if (chance > 0.8) {
      // 3 match = Jackpot
      finalReels[1] = finalReels[0];
      finalReels[2] = finalReels[0];
    } else if (chance > 0.45) {
      // 2 match = Premio piccolo
      finalReels[1] = finalReels[0];
      while (finalReels[2] === finalReels[0]) {
         finalReels[2] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      }
    } else {
      // 0 match
      while (finalReels[1] === finalReels[0]) finalReels[1] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      while (finalReels[2] === finalReels[0] || finalReels[2] === finalReels[1]) finalReels[2] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }

    setTimeout(() => {
      setSpinningReels([false, true, true]);
      setReels(prev => [finalReels[0], prev[1], prev[2]]);
    }, 1000);

    setTimeout(() => {
      setSpinningReels([false, false, true]);
      setReels(prev => [finalReels[0], finalReels[1], prev[2]]);
    }, 1600);

    setTimeout(() => {
      setSpinningReels([false, false, false]);
      setReels(finalReels);
      clearInterval(spinIntervalRef.current);
      finalizeSpin(finalReels);
    }, 2300);
  };

  const finalizeSpin = (final) => {
    let matches = 0;
    if (final[0] === final[1] && final[1] === final[2]) matches = 3;
    else if (final[0] === final[1] || final[1] === final[2] || final[0] === final[2]) matches = 2;
    
    let wonPrizeStr = 'Riprova';
    if (matches === 3) wonPrizeStr = 'Sconto 20%';
    else if (matches === 2) wonPrizeStr = 'Caffè Omaggio';
    
    setPrizeResult(wonPrizeStr);
    setIsSubmitted(true);
    setIsSpinning(false);
    
    setTimeout(() => {
      if (wonPrizeStr === 'Riprova') {
        setWinMessage('Nessuna combinazione. Hai guadagnato 10 Punti Fedeltà per la tua giocata!');
        if (onWin) onWin(10, null);
      } else {
        if (window.confetti && matches === 3) {
          window.confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        }
        // Attiva la vibrazione se supportata dal dispositivo
        if (navigator.vibrate) {
          navigator.vibrate(matches === 3 ? [200, 100, 200, 100, 200] : [100, 50, 100]);
        }
        setWinMessage(`🎉 Combinazione vincente! Hai vinto: ${wonPrizeStr}! (+10 Punti inclusi)`);
        if (onWin) onWin(10, wonPrizeStr);
      }
      setShowModal(true);
    }, 800);
  };

  return (
    <div className="game-container-wrapper slot-wrapper center-content">
      {isSubmitted ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
           <h3 style={{ color: '#4ade80', fontSize: '1.5rem', marginBottom: '1rem' }}>Vincita Registrata!</h3>
           <p style={{ color: '#a1a1aa' }}>Hai già effettuato la tua giocata alle Slot. Torna alla Home per scegliere un altro minigioco!</p>
           <button className="btn-spin" style={{marginTop: '2rem'}} onClick={() => { if(onGoToWallet) onGoToWallet(); }}>Torna alla Home</button>
        </div>
      ) : (
        <>
          <div className="slot-machine-box card-glass">
            <div className="reels-container">
              {reels.map((symbol, i) => (
                <div key={i} className={`reel card-glass ${spinningReels[i] ? 'spinning' : 'stopped'}`}>
                  {symbol}
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className={`btn-spin btn-slot mt-4 ${isSpinning ? 'disabled' : ''}`}
            onClick={spin}
            disabled={isSpinning}
            style={{marginTop: '2.5rem', width: '100%', maxWidth: '300px'}}
          >
            {isSpinning ? 'GIRANDO...' : 'TIRA LA LEVA'}
          </button>
        </>
      )}

      <div className={`modal-overlay ${showModal ? 'show' : ''}`}>
        <div className="modal-content">
          <div className="modal-title">{prizeResult === 'Riprova' ? 'Peccato!' : 'JACKPOT!'}</div>
          <div className="modal-body">{winMessage}</div>
          
          {prizeResult === 'Riprova' ? (
            <button className="modal-btn close-only" onClick={() => setShowModal(false)}>Chiudi</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="modal-btn" onClick={() => { setShowModal(false); if(onGoToWallet) onGoToWallet(); }}>Vai al Wallet</button>
              <button className="modal-btn close-only" style={{ background: 'transparent', color: '#888', padding: '8px', boxShadow: 'none', border: 'none' }} onClick={() => setShowModal(false)}>Più tardi</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
