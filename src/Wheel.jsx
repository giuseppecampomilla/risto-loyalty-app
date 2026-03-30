import React, { useState } from 'react';
import './Wheel.css';

const PRIZES = [
  'Caffè Omaggio',
  'Sconto 10%',
  'Amaro Omaggio',
  'Riprova',
  'Caffè Omaggio',
  'Sconto 10%',
  'Amaro Omaggio',
  'Riprova'
];

export default function Wheel() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [winMessage, setWinMessage] = useState('');
  const [wonPrize, setWonPrize] = useState('');

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setShowModal(false);

    const totalSlices = PRIZES.length;
    const sliceAngle = 360 / totalSlices;
    const baseSpins = 5 * 360; // 5 full rotations

    // Pick random prize
    const prizeIndex = Math.floor(Math.random() * totalSlices);
    
    // Calculate target angle to bring chosen slice to top (0 deg)
    const targetAngle = 360 - (prizeIndex * sliceAngle + sliceAngle / 2);

    // Random realistic offset within the slice
    const maxOffset = (sliceAngle / 2) - 2;
    const randomOffset = (Math.random() * maxOffset * 2) - maxOffset;

    // Add to current rotation (strip modulo to keep rotating forward cleanly)
    const currentBase = rotation - (rotation % 360);
    const finalRotation = currentBase + baseSpins + targetAngle + randomOffset;

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(PRIZES[prizeIndex]);
      if (PRIZES[prizeIndex] === 'Riprova') {
        setWinMessage('Peccato, andrà meglio la prossima volta!');
      } else {
        setWinMessage(`🎉 Hai vinto: ${PRIZES[prizeIndex]}!`);
      }
      setShowModal(true);
    }, 4000);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="wheel-container-wrapper">
        <div className="wheel-frame">
          <div className="wheel-pointer"></div>
          <div className="wheel-center-cap"></div>
          
          <svg className="wheel-svg" viewBox="0 0 400 400" style={{ transform: `rotate(${rotation}deg)` }}>
            <defs>
              <radialGradient id="gold-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#b45309" />
              </radialGradient>
            </defs>
            {PRIZES.map((prize, i) => {
              const angle = 360 / PRIZES.length;
              const rotateAngle = i * angle;
              const isGold = i % 2 !== 0;
              
              return (
                <g key={i} transform={`rotate(${rotateAngle} 200 200)`}>
                  {/* Slice Wedge (45 deg angle exactly) */}
                  <path 
                    d="M 200 200 L 200 0 A 200 200 0 0 1 341.42 58.58 Z" 
                    fill={isGold ? "url(#gold-grad)" : "#18181b"} 
                    stroke="#27272a" 
                    strokeWidth="2" 
                  />
                  {/* Tangential Text Rotation */}
                  <g transform="translate(200, 200) rotate(22.5)">
                    <text 
                      x="0" y="-120" 
                      transform="rotate(90 0 -120)" 
                      textAnchor="middle" 
                      fill={isGold ? "#000" : "#fbbf24"}
                      className="wheel-slice-text"
                      dominantBaseline="middle"
                    >
                      {prize}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        <button 
          className={`btn-spin ${isSpinning ? 'disabled' : ''}`}
          onClick={spinWheel}
          disabled={isSpinning}
          style={{marginTop: '2rem'}}
        >
          {isSpinning ? 'GIRANDO...' : 'GIRA LA RUOTA'}
        </button>
      </div>

      {/* Modern Pop-up Modal */}
      <div className={`modal-overlay ${showModal ? 'show' : ''}`}>
        <div className="modal-content">
          <div className="modal-title">{wonPrize === 'Riprova' ? 'Peccato!' : 'Vittoria!'}</div>
          <div className="modal-body">{winMessage}</div>
          
          {wonPrize === 'Riprova' ? (
            <button className="modal-btn close-only" onClick={closeModal}>Chiudi</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="modal-btn" onClick={closeModal}>Riscatta Ora</button>
              <button className="modal-btn close-only" style={{ background: 'transparent', color: '#888', padding: '8px', boxShadow: 'none', border: 'none' }} onClick={closeModal}>Più tardi</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
