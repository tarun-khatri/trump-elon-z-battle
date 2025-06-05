
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import GameCharacter from './GameCharacter';
import GameBall from './GameBall';
import { Play, Pause, RotateCcw } from 'lucide-react';

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

  const resetBall = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      ballX: GAME_WIDTH / 2,
      ballY: GAME_HEIGHT / 2,
      ballSpeedX: (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED,
      ballSpeedY: (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED,
    }));
  }, []);

  const updateGame = useCallback(() => {
    if (!gameState.gameRunning || gameState.gamePaused) return;

    setGameState(prev => {
      let newState = { ...prev };

      // Move paddles based on keys
      if (keys.has('ArrowUp') && newState.elonY > 0) {
        newState.elonY -= PADDLE_SPEED;
      }
      if (keys.has('ArrowDown') && newState.elonY < GAME_HEIGHT - PADDLE_HEIGHT) {
        newState.elonY += PADDLE_SPEED;
      }
      if (keys.has('w') && newState.trumpY > 0) {
        newState.trumpY -= PADDLE_SPEED;
      }
      if (keys.has('s') && newState.trumpY < GAME_HEIGHT - PADDLE_HEIGHT) {
        newState.trumpY += PADDLE_SPEED;
      }

      // Move ball
      newState.ballX += newState.ballSpeedX;
      newState.ballY += newState.ballSpeedY;

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
        newState.ballSpeedX = Math.abs(newState.ballSpeedX) * 1.05; // Increase speed slightly
        const relativeIntersectY = (newState.ballY - (newState.trumpY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        newState.ballSpeedY = relativeIntersectY * 5;
      }

      // Ball collision with Elon paddle (right side)
      if (
        newState.ballX >= GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
        newState.ballY >= newState.elonY &&
        newState.ballY <= newState.elonY + PADDLE_HEIGHT
      ) {
        newState.ballSpeedX = -Math.abs(newState.ballSpeedX) * 1.05; // Increase speed slightly
        const relativeIntersectY = (newState.ballY - (newState.elonY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        newState.ballSpeedY = relativeIntersectY * 5;
      }

      // Score points
      if (newState.ballX < 0) {
        newState.elonScore += 10;
        setTimeout(() => resetBall(), 1000);
      }
      if (newState.ballX > GAME_WIDTH) {
        newState.trumpScore += 10;
        setTimeout(() => resetBall(), 1000);
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
    if (score >= 100) return 4; // Ultra Instinct
    if (score >= 60) return 3; // Super Saiyan 3
    if (score >= 30) return 2; // Super Saiyan 2
    if (score >= 10) return 1; // Super Saiyan
    return 0; // Base form
  };

  const getElonLevel = (score: number) => {
    if (score >= 100) return 4; // Ultra Instinct
    if (score >= 60) return 3; // Super Saiyan 3
    if (score >= 30) return 2; // Super Saiyan 2
    if (score >= 10) return 1; // Super Saiyan
    return 0; // Base form
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-600 via-red-700 to-purple-900">
      <div className="text-center mb-6">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500 mb-2 animate-pulse">
          TRUMP ELON PONG
        </h1>
        <p className="text-xl text-white opacity-80">Epic Battle of the Titans!</p>
      </div>

      <div className="flex items-center gap-8 mb-6">
        <Card className="p-4 bg-red-600/20 border-red-400">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold">TRUMP</h3>
            <div className="text-4xl font-bold text-yellow-400">{gameState.trumpScore}</div>
            <div className="text-sm opacity-75">Level {getTrumpLevel(gameState.trumpScore)}</div>
          </div>
        </Card>

        <div className="flex gap-2">
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

        <Card className="p-4 bg-blue-600/20 border-blue-400">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold">ELON</h3>
            <div className="text-4xl font-bold text-cyan-400">{gameState.elonScore}</div>
            <div className="text-sm opacity-75">Level {getElonLevel(gameState.elonScore)}</div>
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-black/50 border-2 border-yellow-400 shadow-2xl">
        <div 
          ref={gameRef}
          className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-black border-4 border-yellow-400 overflow-hidden"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {/* Game Area Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-blue-500/10 animate-pulse" />
          
          {/* Trump Character */}
          <GameCharacter
            character="trump"
            level={getTrumpLevel(gameState.trumpScore)}
            x={0}
            y={gameState.trumpY}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
          />

          {/* Elon Character */}
          <GameCharacter
            character="elon"
            level={getElonLevel(gameState.elonScore)}
            x={GAME_WIDTH - PADDLE_WIDTH}
            y={gameState.elonY}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
          />

          {/* Game Ball */}
          <GameBall
            x={gameState.ballX}
            y={gameState.ballY}
            size={BALL_SIZE}
          />

          {/* Center Line */}
          <div 
            className="absolute bg-white/30 animate-pulse"
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
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
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
            <strong>Elon:</strong> ↑ (Up) / ↓ (Down)
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrumpElonPong;
