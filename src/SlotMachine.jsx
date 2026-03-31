import React, { useState } from 'react';
import './Games.css';

const SYMBOLS = ['🍒', '🍋', '🍉', '⭐', '💎'];

export default function SlotMachine({ onWin, onGoToWallet }) {
  const [reels, setReels] = useState(['⭐', '⭐', '⭐']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [winMessage, setWinMessage] = useState('');
  const [prizeResult, setPrizeResult] = useState('');

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setShowModal(false);

    let spinCount = 0;
    const maxSpins = 20;
    
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ]);
      spinCount++;

      if (spinCount >= maxSpins) {
        clearInterval(interval);
        finalizeSpin();
      }
    }, 100);
  };

  const finalizeSpin = () => {
    const chance = Math.random();
    let finalReels = [];
    let wonPrizeStr = '';
    
    // 30% probabilità di vincita
    if (chance > 0.7) {
      const winSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      finalReels = [winSymbol, winSymbol, winSymbol];
      if (winSymbol === '⭐' || winSymbol === '💎') wonPrizeStr = 'Amaro Omaggio';
      else wonPrizeStr = 'Sconto 10%';
    } else {
      finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ];
      if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
        finalReels[2] = SYMBOLS[(SYMBOLS.indexOf(finalReels[2]) + 1) % SYMBOLS.length];
      }
      wonPrizeStr = 'Riprova';
    }

    setReels(finalReels);
    setPrizeResult(wonPrizeStr);
    
    setTimeout(() => {
      setIsSpinning(false);
      if (wonPrizeStr === 'Riprova') {
        setWinMessage('Mancato per un pelo! Hai guadagnato comunque 10 Punti Fedeltà.');
        if (onWin) onWin(10, null);
      } else {
        setWinMessage(`🎉 Jackpot! Hai vinto: ${wonPrizeStr}! (+10 Punti inclusi)`);
        if (onWin) onWin(10, wonPrizeStr);
      }
      setShowModal(true);
    }, 600);
  };

  return (
    <div className="game-container-wrapper slot-wrapper center-content">
      <div className="slot-machine-box card-glass">
        <div className="reels-container">
          {reels.map((symbol, i) => (
            <div key={i} className={`reel card-glass ${isSpinning ? 'spinning' : ''}`}>
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
