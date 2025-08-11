'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CoinProps {
  status: 'yin' | 'yang' | 'changing';
  flipped?: boolean;
  isShaking?: boolean;
  onShakeComplete?: (result: 'yin' | 'yang' | 'changing') => void;
}

export const Coin: React.FC<CoinProps> = ({
  status,
  flipped = false,
  isShaking = false,
  onShakeComplete
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFlipped, setIsFlipped] = useState(flipped);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // 铜钱颜色配置 - 国风青铜色系
  const getCoinColors = (status: 'yin' | 'yang' | 'changing') => {
    switch (status) {
      case 'yin': // 阴爻 - 深青铜色
        return {
          bg: 'bg-amber-900',
          border: 'border-amber-700',
          text: 'text-amber-100',
          glow: ''
        };
      case 'yang': // 阳爻 - 亮青铜色
        return {
          bg: 'bg-amber-600',
          border: 'border-amber-800',
          text: 'text-amber-50',
          glow: ''
        };
      case 'changing': // 变爻 - 金色发光
        return {
          bg: 'bg-yellow-500',
          border: 'border-yellow-600',
          text: 'text-yellow-900',
          glow: 'shadow-lg shadow-yellow-400/50'
        };
      default:
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-600',
          text: 'text-amber-50',
          glow: ''
        };
    }
  };

  // 阳爻图案 - 使用head.webp图片
  const renderYangSymbol = () => (
    <img
      src="/img/head.webp"
      alt="阳爻"
      className="w-20 h-20 object-contain drop-shadow-lg"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );

  // 阴爻图案 - 使用tail.webp图片
  const renderYinSymbol = () => (
    <img
      src="/img/tail.webp"
      alt="阴爻"
      className="w-20 h-20 object-contain drop-shadow-lg"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );

  // 铜钱抛掷动画
  const animateToss = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const duration = 3500; // 增加到3.5秒动画，使变化更平滑

    if (elapsed < duration) {
      // 抛掷轨迹：上升 + 旋转 + 翻转
      const progress = elapsed / duration;
      const height = Math.sin(progress * Math.PI) * -120; // 增加上升高度到120px
      const rotationX = Math.sin(progress * Math.PI * 3) * 540; // 减少X轴旋转速度和角度
      const rotationY = progress * 1080; // 减少Y轴旋转速度（翻转）

      setRotation({ x: rotationX, y: rotationY });
      // 延迟翻转时机，使动画更自然
      setIsFlipped(progress > 0.7); // 70%后才开始翻转

      animationRef.current = requestAnimationFrame(animateToss);
    } else {
      // 动画结束，生成最终结果
      const finalStatus = Math.random() < 0.25 ? 'yin' : (Math.random() < 0.5 ? 'yang' : 'changing');
      setRotation({ x: 0, y: 0 });
      setIsAnimating(false);
      setIsFlipped(finalStatus === 'yang' || finalStatus === 'changing');
      onShakeComplete?.(finalStatus);
    }
  };

  // 开始摇卦动画
  useEffect(() => {
    if (isShaking && !isAnimating) {
      setIsAnimating(true);
      startTimeRef.current = 0;
      setIsFlipped(false); // 重置为正面
      animationRef.current = requestAnimationFrame(animateToss);
    }
  }, [isShaking, isAnimating]);

  // 清理动画
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 变爻脉动发光效果
  const getGlowEffect = () => {
    if (status === 'changing') {
      return 'animate-pulse shadow-lg shadow-yellow-400/30';
    }
    return '';
  };

  const colors = getCoinColors(status);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* 3D铜钱容器 */}
      <div className="relative w-32 h-32 mx-4 perspective-1000">
        <div
          className={`
            relative w-full h-full rounded-full border-2 flex items-center justify-center
            transform-style-3d transition-all duration-700 ease-out
            ${colors.bg} ${colors.border} ${colors.glow} ${getGlowEffect()}
            ${isAnimating ? 'scale-110' : 'scale-100'}
          `}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isAnimating ? 'none' : 'transform 0.8s ease-out, box-shadow 0.4s ease-out'
          }}
        >
          {/* 铜钱正面 - 阳爻 */}
          <div
            className={`
              absolute inset-0 rounded-full border-2 flex flex-col items-center justify-center
              backface-hidden ${colors.bg} ${colors.border}
              ${isFlipped ? 'opacity-0' : 'opacity-100'}
            `}
          >
            <div className="text-xs font-bold mb-1 text-transparent">{colors.text}</div>
            {renderYangSymbol()}
            <div className="text-xs font-bold mt-1 text-transparent">阳</div>
          </div>

          {/* 铜钱背面 - 阴爻 */}
          <div
            className={`
              absolute inset-0 rounded-full border-2 flex flex-col items-center justify-center
              backface-hidden rotate-y-180 ${colors.bg} ${colors.border}
              ${isFlipped ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <div className="text-xs font-bold mb-1 text-transparent">{colors.text}</div>
            {renderYinSymbol()}
            <div className="text-xs font-bold mt-1 text-transparent">阴</div>
          </div>

          {/* 铜钱方孔 - 减小透明度 */}
          <div className="absolute w-3 h-3 bg-gray-900 rounded-full opacity-10" />
        </div>

        {/* 阴影效果 */}
        <div
          className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-3 bg-black opacity-20 rounded-full blur-sm transition-all duration-300"
          style={{
            transform: `translateX(-50%) scale(${1 - Math.abs(rotation.y) / 720})`,
            opacity: Math.max(0.1, 0.3 - Math.abs(rotation.y) / 3600)
          }}
        />
      </div>

      {/* 状态标签 */}
      <div className="text-xs font-medium mt-2 text-amber-800 opacity-80">
        {status === 'yin' && '阴爻'}
        {status === 'yang' && '阳爻'}
        {status === 'changing' && '变爻'}
      </div>
    </div>
  );
};