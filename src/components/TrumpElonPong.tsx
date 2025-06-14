import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import GameBall from './GameBall';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface GameState {
  trumpScore: number;
  elonScore: number;
  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;
  trumpY: number;
  elonY: number;
  gameRunning: boolean;
  gamePaused: boolean;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 15;
const BALL_SIZE = 20;
const PADDLE_SPEED = 8;
const INITIAL_BALL_SPEED = 4;

const TrumpElonPong = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    trumpScore: 0,
    elonScore: 0,
    ballX: GAME_WIDTH / 2,
    ballY: GAME_HEIGHT / 2,
    ballSpeedX: INITIAL_BALL_SPEED,
    ballSpeedY: INITIAL_BALL_SPEED,
    trumpY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    elonY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    gameRunning: false,
    gamePaused: false,
  });

  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [musicMuted, setMusicMuted] = useState(false);

  // Add vibration state for each image
  const [trumpVibrate, setTrumpVibrate] = useState(false);
  const [elonVibrate, setElonVibrate] = useState(false);

  const resetBall = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      ballX: GAME_WIDTH / 2,
      ballY: GAME_HEIGHT / 2,
      ballSpeedX: (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED,
      ballSpeedY: (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED,
    }));
  }, []);

  const triggerVibration = (side: 'trump' | 'elon') => {
    if (side === 'trump') {
      setTrumpVibrate(true);
      setTimeout(() => setTrumpVibrate(false), 250);
    } else {
      setElonVibrate(true);
      setTimeout(() => setElonVibrate(false), 250);
    }
  };

  // Helper to get current speed multiplier based on total score
  const getSpeedMultiplier = (trumpScore: number, elonScore: number) => {
    const totalScore = trumpScore + elonScore;
    // Increase speed every 50 points, up to 2x speed
    return 1 + Math.min(Math.floor(totalScore / 50) * 0.15, 1);
  };

  const updateGame = useCallback(() => {
    if (!gameState.gameRunning || gameState.gamePaused) return;

    setGameState(prev => {
      let newState = { ...prev };
      const speedMultiplier = getSpeedMultiplier(newState.trumpScore, newState.elonScore);

      // Move paddles based on keys - Updated Elon controls to I/K
      if (keys.has('i') && newState.elonY > 0) {
        newState.elonY -= PADDLE_SPEED;
      }
      if (keys.has('k') && newState.elonY < GAME_HEIGHT - PADDLE_HEIGHT) {
        newState.elonY += PADDLE_SPEED;
      }
      if (keys.has('w') && newState.trumpY > 0) {
        newState.trumpY -= PADDLE_SPEED;
      }
      if (keys.has('s') && newState.trumpY < GAME_HEIGHT - PADDLE_HEIGHT) {
        newState.trumpY += PADDLE_SPEED;
      }

      // Move ball
      newState.ballX += newState.ballSpeedX * speedMultiplier;
      newState.ballY += newState.ballSpeedY * speedMultiplier;

      // Ball collision with top and bottom walls
      if (newState.ballY <= 0 || newState.ballY >= GAME_HEIGHT - BALL_SIZE) {
        newState.ballSpeedY = -newState.ballSpeedY;
      }

      // Ball collision with Trump paddle (left side)
      if (
        newState.ballX <= PADDLE_WIDTH &&
        newState.ballY >= newState.trumpY &&
        newState.ballY <= newState.trumpY + PADDLE_HEIGHT
      ) {
        newState.ballSpeedX = Math.abs(newState.ballSpeedX) * 1.05;
        const relativeIntersectY = (newState.ballY - (newState.trumpY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        newState.ballSpeedY = relativeIntersectY * 5;
        triggerVibration('trump'); // Vibrate Trump image
      }

      // Ball collision with Elon paddle (right side)
      if (
        newState.ballX >= GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
        newState.ballY >= newState.elonY &&
        newState.ballY <= newState.elonY + PADDLE_HEIGHT
      ) {
        newState.ballSpeedX = -Math.abs(newState.ballSpeedX) * 1.05;
        const relativeIntersectY = (newState.ballY - (newState.elonY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        newState.ballSpeedY = relativeIntersectY * 5;
        triggerVibration('elon'); // Vibrate Elon image
      }

      // Score points - Random score between 10-50
      if (newState.ballX < 0) {
        newState.elonScore += Math.floor(Math.random() * 41) + 10; // 10-50
        setTimeout(() => resetBall(), 500);
      }
      if (newState.ballX > GAME_WIDTH) {
        newState.trumpScore += Math.floor(Math.random() * 41) + 10; // 10-50
        setTimeout(() => resetBall(), 500);
      }

      return newState;
    });
  }, [gameState.gameRunning, gameState.gamePaused, keys, resetBall]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState.gameRunning && !gameState.gamePaused) {
      animationRef.current = requestAnimationFrame(updateGame);
      const interval = setInterval(updateGame, 16); // ~60 FPS
      return () => {
        clearInterval(interval);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [updateGame, gameState.gameRunning, gameState.gamePaused]);

  // Play/pause music based on game state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (gameState.gameRunning && !gameState.gamePaused && !musicMuted) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [gameState.gameRunning, gameState.gamePaused, musicMuted]);

  // Mute/unmute handler
  const toggleMusic = () => {
    setMusicMuted(m => !m);
  };

  const startGame = () => {
    setGameState(prev => ({ ...prev, gameRunning: true, gamePaused: false }));
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, gamePaused: !prev.gamePaused }));
  };

  const resetGame = () => {
    setGameState({
      trumpScore: 0,
      elonScore: 0,
      ballX: GAME_WIDTH / 2,
      ballY: GAME_HEIGHT / 2,
      ballSpeedX: INITIAL_BALL_SPEED,
      ballSpeedY: INITIAL_BALL_SPEED,
      trumpY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      elonY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      gameRunning: false,
      gamePaused: false,
    });
  };

  const getTrumpLevel = (score: number) => {
    if (score >= 200) return 4;
    if (score >= 150) return 3;
    if (score >= 100) return 2;
    if (score >= 50) return 1;
    return 0;
  };

  const getElonLevel = (score: number) => {
    if (score >= 200) return 4;
    if (score >= 150) return 3;
    if (score >= 100) return 2;
    if (score >= 50) return 1;
    return 0;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-600 via-red-700 to-purple-900">
      {/* Music audio element */}
      <audio ref={audioRef} src="/music.mp3" loop autoPlay={false} muted={musicMuted} />
      {/* Music mute/unmute button in top-right */}
      <button
        onClick={toggleMusic}
        className="absolute top-4 right-4 z-30 bg-black/60 rounded-full p-2 hover:bg-black/80 transition-colors"
        title={musicMuted ? 'Unmute Music' : 'Mute Music'}
      >
        {musicMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
      </button>

      <div className="text-center mb-6">
        <h1 className="text-6xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500 mb-2 animate-pulse drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] font-serif">
          TRUMP V/S ELON
        </h1>
        <p className="text-xl text-white opacity-90 font-medium font-sans drop-shadow">Epic Battle of the Titans!</p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button 
          onClick={startGame} 
          disabled={gameState.gameRunning && !gameState.gamePaused}
          className="bg-green-600 hover:bg-green-700"
        >
          <Play className="w-4 h-4 mr-2" />
          Start
        </Button>
        <Button 
          onClick={pauseGame} 
          disabled={!gameState.gameRunning}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <Pause className="w-4 h-4 mr-2" />
          Pause
        </Button>
        <Button 
          onClick={resetGame}
          className="bg-red-600 hover:bg-red-700"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <Card className="p-4 bg-black/50 border-2 border-yellow-400 shadow-2xl">
        <div 
          ref={gameRef}
          className="relative border-4 border-yellow-400 overflow-hidden"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {/* Split Background */}
          <div className="absolute inset-0 flex">
            <div className="w-1/2 bg-gradient-to-r from-red-600 to-red-500 opacity-80" />
            <div className="w-1/2 bg-gradient-to-l from-blue-600 to-blue-500 opacity-80" />
          </div>
          
          {/* Large Trump Image covering left half */}
          <div className="absolute left-0 bottom-0 w-1/2 h-3/4 flex items-end justify-center pointer-events-none z-10">
            <img 
              src="/lovable-uploads/61aaf673-f181-4a2f-af83-a2b4668e6d60.png" 
              alt="Trump" 
              className={`w-[95%] h-auto max-h-[90%] object-contain drop-shadow-2xl transition-transform duration-150 
                ${trumpVibrate ? 'animate-vibrate' : ''}`}
            />
          </div>

          {/* Large Elon Image covering right half */}
          <div className="absolute right-0 bottom-0 w-1/2 h-3/4 flex items-end justify-center pointer-events-none z-10">
            <img 
              src="/lovable-uploads/1768c633-a05b-4c95-8d92-79edad70f2be.png" 
              alt="Elon" 
              className={`w-[95%] h-auto max-h-[90%] object-contain drop-shadow-2xl transition-transform duration-150 
                ${elonVibrate ? 'animate-vibrate' : ''}`}
            />
          </div>
          
          {/* Score Display Inside Board */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-8 z-10">
            <div className="bg-red-600/80 text-white px-4 py-2 rounded-lg border-2 border-white">
              <div className="text-center">
                <div className="text-sm font-bold">TRUMP</div>
                <div className="text-2xl font-bold text-yellow-400">{gameState.trumpScore}</div>
              </div>
            </div>
            
            <div className="text-4xl font-bold text-white">VS</div>
            
            <div className="bg-blue-600/80 text-white px-4 py-2 rounded-lg border-2 border-white">
              <div className="text-center">
                <div className="text-sm font-bold">ELON</div>
                <div className="text-2xl font-bold text-cyan-400">{gameState.elonScore}</div>
              </div>
            </div>
          </div>
          
          {/* Trump Paddle (Stick) */}
          <div
            className="absolute z-20 bg-yellow-400"
            style={{
              left: 0,
              top: gameState.trumpY,
              width: 6,
              height: PADDLE_HEIGHT,
              borderRadius: 3,
            }}
          />

          {/* Elon Paddle (Stick) */}
          <div
            className="absolute z-20 bg-cyan-400"
            style={{
              left: GAME_WIDTH - PADDLE_WIDTH,
              top: gameState.elonY,
              width: 6,
              height: PADDLE_HEIGHT,
              borderRadius: 3,
            }}
          />

          {/* Game Ball */}
          <GameBall
            x={gameState.ballX}
            y={gameState.ballY}
            size={BALL_SIZE}
          />

          {/* Center Line */}
          <div 
            className="absolute bg-white/50 animate-pulse z-10"
            style={{
              left: GAME_WIDTH / 2 - 2,
              top: 0,
              width: 4,
              height: GAME_HEIGHT,
              background: 'repeating-linear-gradient(to bottom, white 0px, white 20px, transparent 20px, transparent 40px)'
            }}
          />

          {/* Game Paused Overlay */}
          {gameState.gamePaused && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
              <div className="text-6xl font-bold text-white animate-pulse">PAUSED</div>
            </div>
          )}
        </div>
      </Card>

      <div className="mt-4 text-center text-white/80">
        <p className="text-lg mb-2">Controls:</p>
        <div className="flex gap-8 justify-center">
          <div>
            <strong>Trump:</strong> W (Up) / S (Down)
          </div>
          <div>
            <strong>Elon:</strong> I (Up) / K (Down)
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this to your global CSS (e.g., index.css or tailwind.css):
/*
@keyframes vibrate {
  0% { transform: translateX(0) rotate(0deg);}
  20% { transform: translateX(-4px) rotate(-2deg);}
  40% { transform: translateX(4px) rotate(2deg);}
  60% { transform: translateX(-3px) rotate(-1deg);}
  80% { transform: translateX(3px) rotate(1deg);}
  100% { transform: translateX(0) rotate(0deg);}
}
.animate-vibrate {
  animation: vibrate 0.25s linear;
}
*/

export default TrumpElonPong;
