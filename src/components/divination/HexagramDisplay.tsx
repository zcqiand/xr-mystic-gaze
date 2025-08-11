'use client';

import React, { useState, useEffect } from 'react';
import { getHexagramName } from '@/services/hexagram';

interface HexagramDisplayProps {
  primaryHexagram: number[]; // 主卦数据（数组[6]）
  changingHexagram: number[]; // 变卦数据（数组[6]）
  changingLines: number[]; // 变爻位置（数组[0-5]）
  primaryName?: string; // 主卦名称
  changingName?: string; // 变卦名称
  primaryNumber?: number; // 主卦序号
  changingNumber?: number; // 变卦序号
  className?: string;
}

interface YaoLineProps {
  value: number; // 0=阴爻, 1=阳爻
  index: number; // 0-5，从下到上
  isChanging: boolean; // 是否为变爻
  isPrimary: boolean; // 是否为主卦
}

// SVG爻线组件
const YaoLine: React.FC<YaoLineProps> = ({ value, index, isChanging, isPrimary }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // 渐显动画
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, (5 - index) * 200); // 从下到上依次显示

    return () => clearTimeout(timer);
  }, [index]);

  // 调试日志：验证第2爻是否正常渲染
  console.log(`[YaoLine Debug] 第${index + 1}爻渲染中 - 值: ${value}, 是否变爻: ${isChanging}, 是否主卦: ${isPrimary}`);

  const yaoNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

  // 阴爻：断线（两个短线）
  // 阳爻：实线（一个长线）
  const lineLength = 60;
  const gap = 8;

  const yaoStyle = {
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.5s ease-in-out',
  };

  return (
    <g
      className="yao-line cursor-pointer transition-all duration-200"
      style={yaoStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        console.log(`[YaoLine Debug] 第${index + 1}爻被点击 - 值: ${value}, 是否变爻: ${isChanging}`);
        alert(`第${index + 1}爻 (${yaoNames[index]})\n类型: ${value === 0 ? '阴爻' : '阳爻'}\n${isChanging ? '变爻' : '本爻'}`);
      }}
    >
      {/* 爻位标签 */}
      <text
        x={isPrimary ? -40 : 100}
        y={index * 25 + 15}
        textAnchor="middle"
        className={`text-xs fill-gray-600 transition-colors duration-200 ${isHovered ? 'fill-amber-600 font-bold' : ''}`}
        style={{ fontFamily: 'serif' }}
      >
        {yaoNames[index]}
      </text>

      {/* 爻线 */}
      {value === 0 ? (
        // 阴爻：断线
        <>
          <line
            x1={isPrimary ? 0 : 40}
            y1={index * 25 + 10}
            x2={isPrimary ? (lineLength - gap) / 2 : 40 + (lineLength - gap) / 2}
            y2={index * 25 + 10}
            strokeWidth="3"
            stroke={isChanging ? "#dc2626" : "#1f2937"}
            strokeLinecap="round"
            className={`transition-all duration-200 ${isHovered ? 'stroke-amber-600 stroke-4' : ''}`}
          />
          <line
            x1={isPrimary ? (lineLength + gap) / 2 : 40 + (lineLength + gap) / 2}
            y1={index * 25 + 10}
            x2={isPrimary ? lineLength : 40 + lineLength}
            y2={index * 25 + 10}
            strokeWidth="3"
            stroke={isChanging ? "#dc2626" : "#1f2937"}
            strokeLinecap="round"
            className={`transition-all duration-200 ${isHovered ? 'stroke-amber-600 stroke-4' : ''}`}
          />
        </>
      ) : (
        // 阳爻：实线
        <line
          x1={isPrimary ? 0 : 40}
          y1={index * 25 + 10}
          x2={isPrimary ? lineLength : 40 + lineLength}
          y2={index * 25 + 10}
          strokeWidth="3"
          stroke={isChanging ? "#dc2626" : "#1f2937"}
          strokeLinecap="round"
          className={`transition-all duration-200 ${isHovered ? 'stroke-amber-600 stroke-4' : ''}`}
        />
      )}

      {/* 变爻标记 */}
      {isChanging && (
        <circle
          cx={isPrimary ? lineLength / 2 : 40 + lineLength / 2}
          cy={index * 25 + 10}
          r="4"
          fill="#dc2626"
          className={`animate-pulse transition-all duration-200 ${isHovered ? 'r-6 fill-yellow-500' : ''}`}
        />
      )}
    </g>
  );
};

export const HexagramDisplay: React.FC<HexagramDisplayProps> = ({
  primaryHexagram,
  changingHexagram,
  changingLines,
  primaryName,
  changingName,
  primaryNumber,
  changingNumber,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // 动画完成后重置
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [primaryHexagram, changingHexagram]);

  // 如果没有提供卦名，自动计算
  const resolvedPrimaryName = primaryName || getHexagramName({
    primary: primaryHexagram as any,
    changing: changingHexagram as any,
    changingPositions: changingLines,
    timestamp: Date.now()
  });

  const resolvedChangingName = changingName || getHexagramName({
    primary: changingHexagram as any,
    changing: primaryHexagram as any,
    changingPositions: [],
    timestamp: Date.now()
  });

  return (
    <div className={`bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-xl p-6 border border-amber-200 ${className}`}>
      {/* 卦象标题 */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'serif' }}>
          卦象展示
        </h3>
        <div className="flex justify-center space-x-8 text-sm">
          <div className="text-blue-800">
            <span className="font-medium">本卦：</span>
            <span className="font-bold">{resolvedPrimaryName}</span>
            {primaryNumber && <span className="ml-1">({primaryNumber})</span>}
          </div>
          <div className="text-red-800">
            <span className="font-medium">变卦：</span>
            <span className="font-bold">{resolvedChangingName}</span>
            {changingNumber && <span className="ml-1">({changingNumber})</span>}
          </div>
        </div>
      </div>

      {/* SVG卦象展示 */}
      <div className="grid grid-cols-2 gap-8 items-start">
        {/* 本卦 */}
        <div className="text-center">
          <h4 className="text-lg font-semibold mb-4 text-blue-800" style={{ fontFamily: 'serif' }}>
            本卦
          </h4>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-blue-200 shadow-inner">
            <svg
              width="80"
              height="180"
              viewBox="0 0 80 180"
              className="mx-auto"
            >
              {primaryHexagram.map((value, index) => (
                <YaoLine
                  key={`primary-${index}`}
                  value={value}
                  index={index}
                  isChanging={changingLines.includes(index)}
                  isPrimary={true}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* 变卦 */}
        <div className="text-center">
          <h4 className="text-lg font-semibold mb-4 text-red-800" style={{ fontFamily: 'serif' }}>
            变卦
          </h4>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-red-200 shadow-inner">
            <svg
              width="80"
              height="180"
              viewBox="0 0 80 180"
              className="mx-auto"
            >
              {changingHexagram.map((value, index) => (
                <YaoLine
                  key={`changing-${index}`}
                  value={value}
                  index={index}
                  isChanging={changingLines.includes(index)}
                  isPrimary={false}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// 简化的卦象显示（用于占卜过程中）
export const SimpleHexagramDisplay: React.FC<{
  lines: number[];
  changingLines?: number[];
  className?: string;
}> = ({ lines, changingLines = [], className = '' }) => {
  return (
    <div className={`flex justify-center items-end space-x-1 ${className}`}>
      {lines.map((line, index) => (
        <div key={index} className="relative flex flex-col items-center">
          <div
            className={`w-3 h-12 rounded-sm transition-all duration-300
              ${line === 0 ? 'bg-gray-800' : 'bg-amber-600'}
              ${changingLines.includes(index) ? 'ring-2 ring-red-500' : ''}`}
          />
          {changingLines.includes(index) && (
            <div className="w-2 h-2 bg-red-500 rounded-full -mt-1 animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
};