import React, { useState, useRef, useEffect } from 'react';
import './Games.css';

const PRIZES = ['Caffè Omaggio', 'Sconto 10%', 'Amaro Omaggio', 'Riprova', 'Riprova', 'Sconto 10%', 'Caffè Omaggio'];

export default function ScratchCard({ onWin, onGoToWallet }) {
  const canvasRef = useRef(null);
  const [isScratched, setIsScratched] = useState(false);
  const [prize, setPrize] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [winMessage, setWinMessage] = useState('');

  useEffect(() => {
    const randomPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
    setPrize(randomPrize);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Riempi il canvas di grigio brillante
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#94a3b8');
    gradient.addColorStop(0.5, '#e2e8f0');
    gradient.addColorStop(1, '#64748b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Aggiungi un testo "GRATTA QUI"
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Gratta qui', canvas.width / 2, canvas.height / 2 - 12);
    ctx.fillText('per vincere!', canvas.width / 2, canvas.height / 2 + 16);

    let isDrawing = false;

    const scratch = (x, y) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
      checkCompletion();
    };

    const handleStart = (e) => {
      isDrawing = true;
      e.preventDefault(); // prevent scrolling
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      scratch(clientX - rect.left, clientY - rect.top);
    };

    const handleMove = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      scratch(clientX - rect.left, clientY - rect.top);
    };

    const handleEnd = () => { isDrawing = false; };

    canvas.addEventListener('mousedown', handleStart, {passive: false});
    canvas.addEventListener('mousemove', handleMove, {passive: false});
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);
    
    canvas.addEventListener('touchstart', handleStart, {passive: false});
    canvas.addEventListener('touchmove', handleMove, {passive: false});
    canvas.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('mouseleave', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
    };
  }, []);

  const checkCompletion = () => {
    if (isScratched) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparentPixels = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparentPixels++;
    }
    const percent = (transparentPixels / (canvas.width * canvas.height)) * 100;
    if (percent > 45) {
      setIsScratched(true);
      revealPrize();
    }
  };

  const revealPrize = () => {
    const canvas = canvasRef.current;
    canvas.style.transition = 'opacity 0.6s ease';
    canvas.style.opacity = '0';
    
    setTimeout(() => {
      if (prize === 'Riprova') {
        setWinMessage('Hai comunque guadagnato 10 Punti Fedeltà per aver giocato!');
        if (onWin) onWin(10, null);
      } else {
        setWinMessage(`🎉 Hai vinto: ${prize}! Aggiunto al tuo Wallet! (+10 Punti Fedeltà inclusi)`);
        if (onWin) onWin(10, prize);
      }
      setShowModal(true);
    }, 800);
  };

  return (
    <div className="game-container-wrapper scratch-wrapper center-content">
      <div className="scratch-card-box">
        <div className="scratch-prize-reveal">
          <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fbbf24', textAlign: 'center' }}>
            {prize === 'Riprova' ? 'Mancato!' : `🏆 ${prize}`}
          </span>
        </div>
        <canvas ref={canvasRef} width={300} height={150} className="scratch-canvas" />
      </div>
      <p style={{ marginTop: '1.5rem', color: '#a1a1aa' }}>Strofina l'area grigia per scoprire se hai vinto!</p>

      <div className={`modal-overlay ${showModal ? 'show' : ''}`}>
        <div className="modal-content">
          <div className="modal-title">{prize === 'Riprova' ? 'Peccato!' : 'Vittoria!'}</div>
          <div className="modal-body">{winMessage}</div>
          
          {prize === 'Riprova' ? (
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
