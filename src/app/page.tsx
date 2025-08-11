'use client';

import { Coin } from "@/components/divination/Coin";
import { ShakeSensor } from "@/components/divination/ShakeSensor";
import { HexagramDisplay } from "@/components/divination/HexagramDisplay";
import { QuestionForm } from "@/components/divination/QuestionForm";
import { Interpretation } from "@/components/result/Interpretation";
import { generateHexagram } from "@/services/hexagram";
import { useState, useEffect } from "react";

type Step = 'question' | 'divination' | 'result';

export default function Home() {
  // 状态管理
  const [step, setStep] = useState<Step>('question');
  const [question, setQuestion] = useState<string>('');
  const [hexagramData, setHexagramData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeviceSupported, setIsDeviceSupported] = useState(true);
  const [isDivinationComplete, setIsDivinationComplete] = useState(false);

  // 检查设备是否支持陀螺仪
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.DeviceMotionEvent) {
      setIsDeviceSupported(false);
    }
  }, []);

  // 处理问题提交
  const handleQuestionSubmit = async (submittedQuestion: string) => {
    if (!submittedQuestion.trim()) {
      setError('请输入您想要占卜的问题');
      return;
    }

    if (submittedQuestion.trim().length > 100) {
      setError('问题不能超过100字');
      return;
    }

    setQuestion(submittedQuestion.trim());
    setIsProcessing(true);
    setError(null);

    // 模拟网络请求延迟
    setTimeout(() => {
      setStep('divination');
      setIsProcessing(false);
    }, 1000);
  };

  // 处理摇卦完成
  const handleDivinationComplete = (hexagram: any) => {
    console.log('[Home Debug] 摇卦完成回调:', { hexagram, currentStep: step });
    setHexagramData(hexagram);
    setStep('result');
    setIsDivinationComplete(true);
  };

  // 处理摇卦状态变化
  const handleDivinationStatusChange = (isComplete: boolean) => {
    console.log('[Home Debug] 摇卦状态变化:', { isComplete, currentStep: step });
    setIsDivinationComplete(isComplete);
  };

  // 重新开始占卜
  const handleRestart = () => {
    setStep('question');
    setQuestion('');
    setHexagramData(null);
    setError(null);
    setIsDivinationComplete(false);
  };

  // 渲染当前步骤的组件
  const renderCurrentStep = () => {
    switch (step) {
      case 'question':
        return (
          <QuestionForm
            onSubmit={handleQuestionSubmit}
            isSubmitting={isProcessing}
            className="max-w-2xl mx-auto"
          />
        );

      case 'divination':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-amber-900 mb-4 font-serif">
              诚心摇卦
            </h2>
            <p className="text-amber-700 mb-8">
              请默念您的问题，然后摇晃手机或点击按钮进行摇卦
            </p>

            {!isDeviceSupported && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-yellow-800 text-sm">
                    您的设备不支持陀螺仪，请使用手动摇卦功能
                  </span>
                </div>
              </div>
            )}

            <ShakeSensor
              onHexagramComplete={handleDivinationComplete}
              onComplete={handleDivinationStatusChange}
              className="max-w-md mx-auto"
              isShaking={step === 'divination' && !isDivinationComplete}
            />
          </div>
        );

      case 'result':
        return (
          <div className="space-y-8">
            {/* 卦象展示 */}
            <HexagramDisplay
              primaryHexagram={hexagramData.primary}
              changingHexagram={hexagramData.changing}
              changingLines={hexagramData.changingPositions}
              className="max-w-4xl mx-auto"
            />

            {/* 解卦结果 */}
            <Interpretation
              hexagram={hexagramData}
              question={question}
              className="max-w-4xl mx-auto"
            />

            {/* 分享功能已移除 */}

            {/* 重新占卜按钮 */}
            <div className="flex justify-center pt-8">
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-medium hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                重新占卜
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 md:p-8">
      {/* 宣纸纹理背景 */}
      <div className="fixed inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* 主标题 */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2 font-serif tracking-wide">
            周易铜钱占卜
          </h1>
          <p className="text-amber-700 text-sm md:text-base">
            传承千年的智慧，AI时代的解读
          </p>

          {/* 步骤指示器 */}
          <div className="flex justify-center items-center mt-6 space-x-2 md:space-x-4">
            {(['question', 'divination', 'result'] as Step[]).map((currentStep, index) => (
              <div key={currentStep} className="flex items-center">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${step === currentStep
                    ? 'bg-amber-600 text-white shadow-lg transform scale-110'
                    : 'bg-amber-200 text-amber-700'
                    }`}
                >
                  {index + 1}
                </div>
                <span className={`ml-2 text-xs md:text-sm font-medium ${step === currentStep ? 'text-amber-900' : 'text-amber-600'
                  }`}>
                  {currentStep === 'question' && '问题'}
                  {currentStep === 'divination' && '摇卦'}
                  {currentStep === 'result' && '结果'}
                </span>
                {index < 2 && (
                  <div className={`ml-2 md:ml-4 w-8 h-0.5 ${step === currentStep ? 'bg-amber-600' : 'bg-amber-300'
                    }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 animate-ink-appear">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="paper-texture-enhanced rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-amber-200 relative overflow-hidden">
          {/* 仿古卷轴边框装饰 */}
          <div className="absolute inset-0 border-4 border-amber-300 rounded-2xl opacity-20 pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 opacity-40"></div>

          {/* 当前步骤内容 */}
          <div className="relative z-10">
            {renderCurrentStep()}
          </div>
        </div>

        {/* 页脚 */}
        <div className="text-center mt-8 text-xs text-amber-600">
          <p>© 2025 周易AI占卜 | 仅供娱乐参考</p>
        </div>
      </div>
    </div>
  );
}
