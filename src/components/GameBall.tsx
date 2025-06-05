
import React from 'react';

interface GameBallProps {
  x: number;
  y: number;
  size: number;
}

const GameBall: React.FC<GameBallProps> = ({ x, y, size }) => {
  return (
    <div
      className="absolute flex items-center justify-center bg-gradient-to-br from-white to-yellow-100 border-2 border-yellow-600 shadow-lg animate-spin rounded-lg"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.4)',
      }}
    >
      {/* Bill Document Icon */}
      <div className="text-lg font-bold text-center">
        📄
      </div>
      
      {/* Add "BILL" text for clarity */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/50 px-1 rounded">
        BILL
      </div>
    </div>
  );
};

export default GameBall;
