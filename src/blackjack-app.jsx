import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BlackjackApp = () => {
  const [balance, setBalance] = useState(475);
  const [bet, setBet] = useState(125);
  const [gameState, setGameState] = useState('betting'); // betting, playing, won, lost, push
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [chips, setChips] = useState([]);
  const [confetti, setConfetti] = useState([]);

  // Card suits and values
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const generateRandomCard = () => {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    return { suit, value };
  };

  const calculateTotal = (cards) => {
    let total = 0;
    let aces = 0;

    cards.forEach(card => {
      if (card.value === 'A') {
        aces++;
        total += 11;
      } else if (['J', 'Q', 'K'].includes(card.value)) {
        total += 10;
      } else {
        total += parseInt(card.value);
      }
    });

    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  };

  const startGame = () => {
    if (bet > balance) return;
    
    const newPlayerCards = [generateRandomCard(), generateRandomCard()];
    const newDealerCards = [generateRandomCard()];
    
    setPlayerCards(newPlayerCards);
    setDealerCards(newDealerCards);
    setGameState('playing');
    setBalance(balance - bet);
  };

  const hit = () => {
    const newCard = generateRandomCard();
    const newPlayerCards = [...playerCards, newCard];
    setPlayerCards(newPlayerCards);
    
    const total = calculateTotal(newPlayerCards);
    if (total > 21) {
      setGameState('lost');
      createFallingChips();
    } else if (total === 21) {
      stand();
    }
  };

  const stand = () => {
    const newDealerCards = [...dealerCards];
    while (calculateTotal(newDealerCards) < 17) {
      newDealerCards.push(generateRandomCard());
    }
    setDealerCards(newDealerCards);

    const playerTotal = calculateTotal(playerCards);
    const dealerTotal = calculateTotal(newDealerCards);

    if (dealerTotal > 21 || playerTotal > dealerTotal) {
      setGameState('won');
      setBalance(balance + bet * 2);
      setShowWinAnimation(true);
      createConfetti();
      setTimeout(() => setShowWinAnimation(false), 2000);
    } else if (playerTotal === dealerTotal) {
      setGameState('push');
      setBalance(balance + bet);
    } else {
      setGameState('lost');
      createFallingChips();
    }
  };

  const createConfetti = () => {
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
      suit: suits[Math.floor(Math.random() * suits.length)]
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 3000);
  };

  const createFallingChips = () => {
    const newChips = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: 50 + (Math.random() - 0.5) * 30,
      delay: Math.random() * 0.3,
      rotation: Math.random() * 360
    }));
    setChips(newChips);
    setTimeout(() => setChips([]), 2000);
  };

  const resetGame = () => {
    setPlayerCards([]);
    setDealerCards([]);
    setGameState('betting');
    setChips([]);
    setConfetti([]);
  };

  const adjustBet = (amount) => {
    const newBet = Math.max(25, Math.min(balance, bet + amount));
    setBet(newBet);
  };

  const playerTotal = calculateTotal(playerCards);
  const dealerTotal = calculateTotal(dealerCards);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 100%)',
      color: '#fff',
      fontFamily: '"Poppins", system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      {/* Animated background pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.03,
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,215,0,0.1) 0%, transparent 50%),
                         radial-gradient(circle at 80% 80%, rgba(255,0,127,0.1) 0%, transparent 50%)`,
        animation: 'pulse 4s ease-in-out infinite'
      }} />

      {/* Confetti */}
      <AnimatePresence>
        {confetti.map(item => (
          <motion.div
            key={item.id}
            initial={{ top: -20, left: `${item.left}%`, opacity: 1, rotate: 0 }}
            animate={{ 
              top: '100%', 
              rotate: 360,
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: item.duration,
              delay: item.delay,
              ease: 'easeIn'
            }}
            style={{
              position: 'absolute',
              fontSize: '24px',
              pointerEvents: 'none',
              zIndex: 100
            }}
          >
            {item.suit}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Falling chips */}
      <AnimatePresence>
        {chips.map(chip => (
          <motion.div
            key={chip.id}
            initial={{ 
              top: '40%', 
              left: `${chip.left}%`, 
              opacity: 1,
              rotate: chip.rotation
            }}
            animate={{ 
              top: '100%',
              rotate: chip.rotation + 180,
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.5,
              delay: chip.delay,
              ease: 'easeIn'
            }}
            style={{
              position: 'absolute',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
              border: '3px solid #fff',
              boxShadow: '0 4px 15px rgba(255,215,0,0.4)',
              pointerEvents: 'none',
              zIndex: 99
            }}
          />
        ))}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            padding: '12px 20px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}
        >
          <span style={{ fontSize: '20px' }}>🏆</span>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Balance</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#ffd700' }}>{balance} BUCKS</div>
          </div>
        </motion.div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            🎯
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            ☰
          </motion.button>
        </div>
      </div>

      {/* Game Area */}
      <div style={{
        padding: '20px',
        maxWidth: '500px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Dealer's Cards */}
        {gameState !== 'betting' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '40px' }}
          >
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.6, 
              marginBottom: '15px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: '600'
            }}>
              Dealer {gameState !== 'playing' && `• ${dealerTotal}`}
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {dealerCards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    width: '80px',
                    height: '110px',
                    background: '#fff',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    fontWeight: '700',
                    color: ['♥', '♦'].includes(card.suit) ? '#ff0066' : '#000',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '14px', position: 'absolute', top: '8px', left: '8px' }}>
                    {card.value}
                  </div>
                  <div>{card.suit}</div>
                  <div style={{ fontSize: '14px', position: 'absolute', bottom: '8px', right: '8px', transform: 'rotate(180deg)' }}>
                    {card.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Win/Lose Message */}
        <AnimatePresence>
          {showWinAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '72px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 60px rgba(255,215,0,0.6)',
                zIndex: 50,
                letterSpacing: '4px',
                textAlign: 'center'
              }}
            >
              WINNER!
              <div style={{
                fontSize: '24px',
                marginTop: '10px',
                WebkitTextFillColor: '#ffd700',
                textShadow: 'none'
              }}>
                Blackjack
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player's Cards */}
        {gameState !== 'betting' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '30px' }}
          >
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.6, 
              marginBottom: '15px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: '600',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '15px'
            }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  color: '#000',
                  fontWeight: '700',
                  fontSize: '16px',
                  boxShadow: '0 4px 15px rgba(255,215,0,0.4)'
                }}
              >
                {playerTotal}
              </motion.div>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {playerCards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    width: '80px',
                    height: '110px',
                    background: '#fff',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    fontWeight: '700',
                    color: ['♥', '♦'].includes(card.suit) ? '#ff0066' : '#000',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '14px', position: 'absolute', top: '8px', left: '8px' }}>
                    {card.value}
                  </div>
                  <div>{card.suit}</div>
                  <div style={{ fontSize: '14px', position: 'absolute', bottom: '8px', right: '8px', transform: 'rotate(180deg)' }}>
                    {card.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Betting Interface */}
        {gameState === 'betting' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center',
              marginTop: '80px'
            }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, 0, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ repeat: Infinity, duration: 3 }}
              style={{
                fontSize: '100px',
                marginBottom: '30px',
                filter: 'drop-shadow(0 10px 30px rgba(255,215,0,0.3))'
              }}
            >
              🃏
            </motion.div>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '900',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '2px'
            }}>
              BLACKJACK
            </h1>
            <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '40px' }}>
              Place your bet to start the game
            </p>

            {/* Bet Amount */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              padding: '30px',
              borderRadius: '24px',
              marginBottom: '20px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Bet Amount
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: '900',
                color: '#ffd700',
                marginBottom: '20px',
                textShadow: '0 0 30px rgba(255,215,0,0.3)'
              }}>
                {bet} <span style={{ fontSize: '24px' }}>BUCKS</span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => adjustBet(-25)}
                  style={{
                    padding: '15px 25px',
                    borderRadius: '50px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  -25
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => adjustBet(25)}
                  style={{
                    padding: '15px 25px',
                    borderRadius: '50px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  +25
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => adjustBet(100)}
                  style={{
                    padding: '15px 25px',
                    borderRadius: '50px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  +100
                </motion.button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startGame}
              disabled={bet > balance}
              style={{
                width: '100%',
                padding: '20px',
                borderRadius: '20px',
                background: bet > balance 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                border: 'none',
                color: bet > balance ? 'rgba(255,255,255,0.3)' : '#000',
                fontSize: '20px',
                fontWeight: '900',
                cursor: bet > balance ? 'not-allowed' : 'pointer',
                boxShadow: bet > balance ? 'none' : '0 10px 40px rgba(255,215,0,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                transition: 'all 0.3s ease'
              }}
            >
              {bet > balance ? 'Insufficient Balance' : 'Deal Cards'}
            </motion.button>
          </motion.div>
        )}

        {/* Game Buttons */}
        {gameState === 'playing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={hit}
              style={{
                flex: 1,
                padding: '18px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
            >
              Hit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stand}
              style={{
                flex: 1,
                padding: '18px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                border: 'none',
                color: '#000',
                fontSize: '18px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(255,215,0,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
            >
              Stand
            </motion.button>
          </motion.div>
        )}

        {/* Result Buttons */}
        {(gameState === 'won' || gameState === 'lost' || gameState === 'push') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              marginTop: '40px'
            }}
          >
            {gameState === 'won' && !showWinAnimation && (
              <div style={{
                fontSize: '32px',
                fontWeight: '900',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                YOU WIN! 🎉
              </div>
            )}
            {gameState === 'lost' && (
              <div style={{
                fontSize: '32px',
                fontWeight: '900',
                marginBottom: '20px',
                color: '#ff0066'
              }}>
                BUST! 💔
              </div>
            )}
            {gameState === 'push' && (
              <div style={{
                fontSize: '32px',
                fontWeight: '900',
                marginBottom: '20px',
                color: '#00ccff'
              }}>
                PUSH! 🤝
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                style={{
                  flex: 1,
                  padding: '18px',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}
              >
                New Bet
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetGame();
                  setTimeout(startGame, 100);
                }}
                style={{
                  flex: 1,
                  padding: '18px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  border: 'none',
                  color: '#000',
                  fontSize: '16px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: '0 10px 40px rgba(255,215,0,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}
              >
                Re-bet {bet} Bucks
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');
        
        @keyframes pulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
};

export default BlackjackApp;