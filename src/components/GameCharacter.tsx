
import React from 'react';

interface GameCharacterProps {
  character: 'trump' | 'elon';
  level: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const GameCharacter: React.FC<GameCharacterProps> = ({ character, level, x, y, width, height }) => {
  const getCharacterStyles = () => {
    const baseStyles = "absolute transition-all duration-300 rounded-lg border-2 shadow-lg";
    
    if (character === 'trump') {
      switch (level) {
        case 0:
          return `${baseStyles} bg-gradient-to-b from-orange-400 to-orange-600 border-orange-300 shadow-orange-500/50`;
        case 1:
          return `${baseStyles} bg-gradient-to-b from-yellow-300 to-yellow-500 border-yellow-200 shadow-yellow-400/70 animate-pulse`;
        case 2:
          return `${baseStyles} bg-gradient-to-b from-yellow-200 to-yellow-400 border-yellow-100 shadow-yellow-300/80 animate-pulse`;
        case 3:
          return `${baseStyles} bg-gradient-to-b from-pink-300 to-pink-500 border-pink-200 shadow-pink-400/90 animate-bounce`;
        case 4:
          return `${baseStyles} bg-gradient-to-b from-white to-silver-300 border-white shadow-white/100 animate-spin`;
        default:
          return `${baseStyles} bg-gradient-to-b from-orange-400 to-orange-600 border-orange-300`;
      }
    } else {
      switch (level) {
        case 0:
          return `${baseStyles} bg-gradient-to-b from-gray-600 to-gray-800 border-gray-500 shadow-gray-600/50`;
        case 1:
          return `${baseStyles} bg-gradient-to-b from-blue-400 to-blue-600 border-blue-300 shadow-blue-500/70 animate-pulse`;
        case 2:
          return `${baseStyles} bg-gradient-to-b from-blue-300 to-blue-500 border-blue-200 shadow-blue-400/80 animate-pulse`;
        case 3:
          return `${baseStyles} bg-gradient-to-b from-purple-400 to-purple-600 border-purple-300 shadow-purple-500/90 animate-bounce`;
        case 4:
          return `${baseStyles} bg-gradient-to-b from-cyan-200 to-cyan-400 border-cyan-100 shadow-cyan-300/100 animate-spin`;
        default:
          return `${baseStyles} bg-gradient-to-b from-gray-600 to-gray-800 border-gray-500`;
      }
    }
  };

  const getAura = () => {
    if (level === 0) return null;
    
    const auraSize = 20 + (level * 10);
    const auraStyles = `absolute rounded-full animate-pulse pointer-events-none`;
    
    if (character === 'trump') {
      switch (level) {
        case 1:
          return (
            <div 
              className={`${auraStyles} bg-yellow-400/30 border border-yellow-300/50`}
              style={{
                width: width + auraSize,
                height: height + auraSize,
                left: -auraSize / 2,
                top: -auraSize / 2,
              }}
            />
          );
        case 2:
          return (
            <div 
              className={`${auraStyles} bg-yellow-300/40 border border-yellow-200/60`}
              style={{
                width: width + auraSize,
                height: height + auraSize,
                left: -auraSize / 2,
                top: -auraSize / 2,
              }}
            />
          );
        case 3:
          return (
            <div 
              className={`${auraStyles} bg-pink-400/50 border border-pink-300/70 animate-bounce`}
              style={{
                width: width + auraSize,
                height: height + auraSize,
                left: -auraSize / 2,
                top: -auraSize / 2,
              }}
            />
          );
        case 4:
          return (
            <div 
              className={`${auraStyles} bg-white/60 border border-white/80 animate-spin`}
              style={{
                width: width + auraSize,
                height: height + auraSize,
                left: -auraSize / 2,
                top: -auraSize / 2,
              }}
            />
          );
      }
    } else {
      switch (level) {
        case 1:
          return (
            <div 
              className={`${auraStyles} bg-blue-400/30 border border-blue-300/50`}
              style={{
                width: width + auraSize,
                height: height + auraSize,
                left: -auraSize / 2,
                top: -auraSize / 2,
              }}
            />
          );
        case 2:
          return (
            <div 
              className={`${auraStyles} bg-blue-300/40 border border-blue-200/60`}
              style={{
                width: width + auraSize,
                height: height + auraSize,
                left: -auraSize / 2,
                top: -auraSize / 2,
              }}
            />
          );
        case 3:
          return (
            <div 
              className={`${auraStyles} bg-purple-400/50 border border-purple-300/70 animate-bounce`}
              style={{
                width: width + auraSize,
                height: height + auraSize,
                left: -auraSize / 2,
                top: -auraSize / 2,
              }}
            />
          );
        case 4:
          return (
            <div 
              className={`${auraStyles} bg-cyan-300/60 border border-cyan-200/80 animate-spin`}
              style={{
                width: width + auraSize,
                height: height + auraSize,
                left: -auraSize / 2,
                top: -auraSize / 2,
              }}
            />
          );
      }
    }
    return null;
  };

  const getLevelText = () => {
    const levels = ['Base', 'SSJ', 'SSJ2', 'SSJ3', 'Ultra'];
    return levels[level] || 'Base';
  };

  return (
    <div 
      className="absolute"
      style={{ left: x, top: y, width, height }}
    >
      {getAura()}
      <div 
        className={getCharacterStyles()}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Character face/avatar representation */}
        <div className="absolute inset-1 rounded bg-white/20 flex items-center justify-center">
          <div className={`text-xs font-bold ${character === 'trump' ? 'text-orange-900' : 'text-blue-900'}`}>
            {character === 'trump' ? '🍊' : '🚀'}
          </div>
        </div>
        
        {/* Level indicator */}
        {level > 0 && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/70 px-2 py-1 rounded">
            {getLevelText()}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCharacter;
