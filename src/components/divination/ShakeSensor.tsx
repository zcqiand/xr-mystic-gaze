'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CoinResult, generateHexagram, HexagramData } from '@/services/hexagram';
import { Coin } from './Coin';

interface ShakeSensorProps {
  onShakeStart?: () => void;
  onShakeEnd?: (results: CoinResult[]) => void;
  onShakeComplete?: (results: CoinResult[]) => void;
  onHexagramComplete?: (hexagram: HexagramData) => void;
  className?: string;
  isShaking?: boolean;
  onComplete?: (isComplete: boolean) => void;
}

export const ShakeSensor: React.FC<ShakeSensorProps> = ({
  onShakeStart,
  onShakeEnd,
  onShakeComplete,
  onHexagramComplete,
  onComplete,
  className = '',
  isShaking: externalIsShaking = false
}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [currentResults, setCurrentResults] = useState<CoinResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isMotionSupported, setIsMotionSupported] = useState(true);
  const prevExternalIsShaking = useRef(externalIsShaking);
  const lastShakeTime = useRef(0);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 检测设备是否支持陀螺仪
  useEffect(() => {
    if (typeof window === 'undefined' || !window.DeviceMotionEvent) {
      setIsMotionSupported(false);
      return;
    }

    // 检查是否需要权限
    if (typeof (DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: () => Promise<boolean> }).requestPermission === 'function') {
      setIsMotionSupported(true);
    }
  }, []);


  // 处理摇晃事件
  const handleShake = useCallback(() => {
    if (shakeCount >= 6) return; // 最多摇6次

    // 触发震动反馈
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    // 生成三枚铜钱的结果
    const results: CoinResult[] = [];
    for (let i = 0; i < 3; i++) {
      const rand = Math.random();
      if (rand < 0.25) results.push(0);
      else if (rand < 0.75) results.push(1);
      else results.push(2);
    }

    setCurrentResults(results);
    onShakeComplete?.(results);
    onShakeEnd?.(results);

    // 清除之前的定时器
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }

    // 1秒后清除当前结果，准备下一次
    shakeTimeoutRef.current = setTimeout(() => {
      console.log('[ShakeSensor Debug] 定时器触发，清除当前结果');
      setCurrentResults([]);
      setShakeCount(prev => {
        const newCount = prev + 1;
        console.log('[ShakeSensor Debug] 摇卦计数更新:', { prevCount: prev, newCount });

        if (newCount >= 6) {
          // 完成6次摇卦，生成完整卦象
          const hexagram = generateHexagram();
          console.log('[ShakeSensor Debug] 生成卦象:', hexagram);
          onHexagramComplete?.(hexagram);
          setIsComplete(true);
          onComplete?.(true);
        }

        return newCount;
      });
    }, 1000);
  }, [shakeCount, onShakeComplete, onShakeEnd, onHexagramComplete, onComplete]);

  // 手动摇卦按钮
  const handleManualShake = useCallback(() => {
    if (isShaking || isComplete) return;

    setIsShaking(true);
    onShakeStart?.();

    // 模拟摇卦动画
    setTimeout(() => {
      handleShake();
      // 摇卦完成后重置isShaking状态
      setTimeout(() => {
        setIsShaking(false);
      }, 1000);
    }, 500);
  }, [isShaking, isComplete, onShakeStart, handleShake]);

  // 检测设备摇晃
  const setupShakeDetection = useCallback(() => {
    if (!isMotionSupported) {
      console.warn('设备不支持陀螺仪');
      return;
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      console.log('[ShakeSensor Debug] 设备运动事件触发:', { isShaking, isComplete });
      if (!isShaking || isComplete) return;

      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const now = Date.now();
      if (now - lastShakeTime.current < 300) return; // 防抖

      const { x = 0, y = 0, z = 0 } = acceleration;
      // 计算加速度大小（减去重力加速度）
      const accelerationMagnitude = Math.sqrt(
        Math.abs(x || 0) ** 2 +
        Math.abs(y || 0) ** 2 +
        Math.abs(z || 0) ** 2
      ) - 9.8; // 减去重力加速度

      console.log('[ShakeSensor Debug] 加速度计算:', { x, y, z, accelerationMagnitude });

      if (accelerationMagnitude > 15) { // 1.5g = 15 m/s²
        lastShakeTime.current = now;
        console.log('[ShakeSensor Debug] 触发摇卦');
        handleShake();
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isShaking, isComplete, isMotionSupported, handleShake]);

  // 重置摇卦
  const resetShake = useCallback(() => {
    setIsShaking(false);
    setShakeCount(0);
    setCurrentResults([]);
    setIsComplete(false);
    onComplete?.(false);
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
  }, [onComplete]);

  // 监听外部isShaking状态 - 避免循环更新
  useEffect(() => {
    console.log('[ShakeSensor Debug] 外部状态变化检查:', { externalIsShaking, isShaking, prev: prevExternalIsShaking.current });
    // 只有在外部状态真正改变时才更新内部状态
    if (externalIsShaking !== prevExternalIsShaking.current) {
      console.log('[ShakeSensor Debug] 外部状态真正改变，更新内部状态:', externalIsShaking);
      // 使用requestAnimationFrame延迟状态更新，避免在渲染过程中调用setState
      requestAnimationFrame(() => {
        setIsShaking(externalIsShaking);
        prevExternalIsShaking.current = externalIsShaking;
      });
    }
  }, [externalIsShaking, isShaking]);

  // 设置摇晃检测
  useEffect(() => {
    console.log('[ShakeSensor Debug] 摇晃检测设置:', { isShaking, isComplete });
    if (isShaking && !isComplete) {
      const cleanup = setupShakeDetection();
      return cleanup;
    }
  }, [isShaking, isComplete, setupShakeDetection]);

  // 清理定时器和事件监听器
  useEffect(() => {
    return () => {
      console.log('[ShakeSensor Debug] 组件卸载，清理资源');
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`text-center ${className}`}>
      {!isComplete ? (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-amber-900">
              {isComplete ? '摇卦完成' : shakeCount === 0 ? '准备摇卦' : `第 ${shakeCount + 1} 爻`}
            </h3>
            <p className="text-amber-700">
              {isComplete
                ? '卦象已生成，请前往结果页面查看'
                : shakeCount === 0
                  ? '请诚心默念您的问题，然后摇晃手机或点击按钮'
                  : '继续摇晃手机或点击按钮'
              }
            </p>
            {!isMotionSupported && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ 您的设备不支持陀螺仪，请使用手动摇卦
              </p>
            )}
          </div>

          {/* 铜钱显示区域 */}
          <div className="flex justify-center items-center mb-6 min-h-[120px]">
            {isComplete ? (
              <div className="text-green-600 font-semibold">
                ✅ 卦象已生成完成
              </div>
            ) : currentResults.length > 0 ? (
              currentResults.map((result, index) => (
                <div key={index} className="mx-2">
                  {/* 使用Coin组件显示铜钱图像 */}
                  <Coin
                    status={result === 0 ? 'yin' : result === 1 ? 'yang' : 'changing'}
                    isShaking={isShaking}
                  />
                </div>
              ))
            ) : (
              <div className="text-gray-400">
                {shakeCount > 0 ? '等待下一次摇卦...' : '准备摇卦'}
              </div>
            )}
          </div>

          {/* 进度指示器 */}
          <div className="flex justify-center space-x-1 mb-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300
                  ${isComplete ? 'bg-green-500' : index < shakeCount ? 'bg-amber-600' : 'bg-amber-300'}`}
              />
            ))}
          </div>

          {/* 摇卦按钮 */}
          <button
            onClick={handleManualShake}
            disabled={isShaking || isComplete}
            className={`px-8 py-4 rounded-full text-white font-semibold text-lg
              transition-all duration-300 transform hover:scale-105
              ${isShaking
                ? 'bg-amber-400 cursor-not-allowed'
                : isComplete
                  ? 'bg-green-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 shadow-lg hover:shadow-xl'
              }`}
          >
            {isShaking ? '摇卦中...' : isComplete ? '已完成' : '摇卦'}
          </button>

          {/* 提示信息 */}
          <div className="mt-4 text-sm text-amber-600">
            {isComplete
              ? '摇卦完成！请查看结果页面'
              : isShaking
                ? (isMotionSupported ? '正在检测摇晃...' : '正在模拟摇卦...')
                : (isMotionSupported ? '支持陀螺仪感应和手动点击' : '请点击按钮进行摇卦')
            }
          </div>

          {/* 用户引导提示 */}
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-700">
              💡 提示：摇晃手机时请保持平稳，幅度大于1.5g即可触发摇卦
            </p>
          </div>
        </>
      ) : (
        /* 完成状态 */
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-amber-700 mb-2">卦象已生成</h3>
            <p className="text-amber-600">恭喜您完成占卜，请查看结果</p>
          </div>

          <button
            onClick={resetShake}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            重新占卜
          </button>
        </div>
      )}
    </div>
  );
};