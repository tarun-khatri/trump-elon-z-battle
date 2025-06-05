
import React from 'react';

interface GameBallProps {
  x: number;
  y: number;
  size: number;
}

const GameBall: React.FC<GameBallProps> = ({ x, y, size }) => {
  return (
    <div
      className="absolute rounded-full bg-gradient-to-br from-white to-yellow-300 border-2 border-yellow-400 shadow-lg animate-pulse"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        boxShadow: '0 0 20px rgba(255, 255, 0, 0.6), 0 0 40px rgba(255, 255, 0, 0.4)',
      }}
    >
      {/* Ball energy effect */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 animate-spin">
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white to-transparent" />
      </div>
    </div>
  );
};

export default GameBall;
