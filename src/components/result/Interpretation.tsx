'use client';

import React, { useState, useEffect } from 'react';
import { HexagramData, interpretHexagram, HexagramInterpretation } from '@/services/hexagram';
import { generateAIInterpretation, AIInterpretationRequest } from '@/services/ai';

interface InterpretationProps {
  hexagram: HexagramData | null;
  question: string;
  isLoading?: boolean;
  className?: string;
}

interface AIInterpretationResponse {
  interpretation: string;
  advice: string;
  analysis: string;
}


// 智能AI解卦算法（本地版本）
const generateLocalAIInterpretation = async (
  hexagram: HexagramData,
  question: string
): Promise<AIInterpretationResponse> => {
  console.log('🔍 [DEBUG] generateLocalAIInterpretation 被调用');
  console.log('🔍 [DEBUG] 卦象数据:', hexagram);
  console.log('🔍 [DEBUG] 用户问题:', question);

  // 模拟API调用延迟
  console.log('🔍 [DEBUG] 开始模拟AI调用延迟...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('🔍 [DEBUG] AI调用延迟完成');

  const interpretation = interpretHexagram(hexagram);
  console.log('🔍 [DEBUG] 卦象解读完成:', interpretation);
  const changingPositions = hexagram.changingPositions.map(pos => pos + 1);

  // 分析问题类型
  const questionType = analyzeQuestionType(question);

  // 分析卦象特征
  const hexagramFeatures = analyzeHexagramFeatures(hexagram);

  // 生成个性化解读
  const personalizedInterpretation = generatePersonalizedInterpretation(
    interpretation,
    question,
    questionType,
    hexagramFeatures
  );

  // 生成针对性建议
  const targetedAdvice = generateTargetedAdvice(
    interpretation,
    questionType,
    hexagramFeatures,
    changingPositions
  );

  // 生成深度分析
  const deepAnalysis = generateDeepAnalysis(
    interpretation,
    hexagramFeatures,
    changingPositions,
    questionType
  );

  console.log('🔍 [LOCAL] 本地AI解读生成完成');
  console.log('🔍 [LOCAL] 解读类型:', '本地模拟');
  console.log('🔍 [LOCAL] 是否使用真实AI:', false);

  return {
    interpretation: personalizedInterpretation,
    advice: targetedAdvice,
    analysis: deepAnalysis
  };
};

// 分析问题类型
function analyzeQuestionType(question: string): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('事业') || lowerQuestion.includes('工作') || lowerQuestion.includes('职业')) {
    return 'career';
  } else if (lowerQuestion.includes('感情') || lowerQuestion.includes('爱情') || lowerQuestion.includes('婚姻')) {
    return 'relationship';
  } else if (lowerQuestion.includes('健康') || lowerQuestion.includes('身体')) {
    return 'health';
  } else if (lowerQuestion.includes('财运') || lowerQuestion.includes('金钱') || lowerQuestion.includes('投资')) {
    return 'finance';
  } else if (lowerQuestion.includes('学业') || lowerQuestion.includes('考试') || lowerQuestion.includes('学习')) {
    return 'education';
  } else {
    return 'general';
  }
}

// 分析卦象特征
function analyzeHexagramFeatures(hexagram: HexagramData): {
  yangCount: number;
  yinCount: number;
  changingCount: number;
  isStable: boolean;
  isChanging: boolean;
  element: string;
} {
  const yangCount = hexagram.primary.filter(yao => yao === 1).length;
  const yinCount = hexagram.primary.filter(yao => yao === 0).length;
  const changingCount = hexagram.changingPositions.length;

  return {
    yangCount,
    yinCount,
    changingCount,
    isStable: changingCount === 0,
    isChanging: changingCount >= 3,
    element: yangCount > yinCount ? '阳' : yinCount > yangCount ? '阴' : '阴阳平衡'
  };
}

// 生成个性化解读
function generatePersonalizedInterpretation(
  interpretation: HexagramInterpretation,
  question: string,
  questionType: string,
  features: {
    yangCount: number;
    yinCount: number;
    changingCount: number;
    isStable: boolean;
    isChanging: boolean;
    element: string;
  }
): string {
  const { primary } = interpretation;
  const baseInterpretation = `${primary.judgment}\n\n${primary.image}`;

  // 根据问题类型添加个性化内容
  let contextualAdvice = '';
  switch (questionType) {
    case 'career':
      contextualAdvice = '在事业发展方面，此卦提醒您要注重策略和耐心，稳步前进。';
      break;
    case 'relationship':
      contextualAdvice = '在感情关系中，此卦暗示需要更多的理解和包容，真诚沟通是关键。';
      break;
    case 'health':
      contextualAdvice = '对于健康状况，此卦建议您保持规律的生活作息，注重身心平衡。';
      break;
    case 'finance':
      contextualAdvice = '在财务方面，此卦提醒您要谨慎决策，避免冲动投资。';
      break;
    case 'education':
      contextualAdvice = '在学习道路上，此卦鼓励您持之以恒，循序渐进。';
      break;
    default:
      contextualAdvice = '在当前情况下，此卦为您提供了一面镜子，帮助您更好地认识自己。';
  }

  // 根据卦象特征添加分析
  let featureAnalysis = '';
  if (features.isStable) {
    featureAnalysis = '此卦象显示当前状态相对稳定，适合做长远规划。';
  } else if (features.isChanging) {
    featureAnalysis = '此卦象变化较多，提示您当前正处于转型期，需要灵活应对。';
  } else {
    featureAnalysis = '此卦象显示有适度变化，提醒您在稳定中寻求突破。';
  }

  return `根据您的问题"${question}"，占得${primary.name}。\n\n${baseInterpretation}\n\n${contextualAdvice}\n\n${featureAnalysis}`;
}

// 生成针对性建议
function generateTargetedAdvice(
  interpretation: HexagramInterpretation,
  questionType: string,
  features: {
    yangCount: number;
    yinCount: number;
    changingCount: number;
    isStable: boolean;
    isChanging: boolean;
    element: string;
  },
  changingPositions: number[]
): string {
  const { primary, changing } = interpretation;
  let advice = `基于${primary.name}的启示，为您提供建议：\n\n`;

  // 基础建议
  advice += `• ${getGeneralAdvice(primary.name, features)}\n`;

  // 根据问题类型的具体建议
  advice += getQuestionSpecificAdvice(questionType, features);

  // 根据变爻情况提供建议
  if (changingPositions.length > 0) {
    advice += getChangingLineAdvice(changingPositions.length, changing.name);
  } else {
    advice += '• 当前卦象稳定，适合按计划稳步推进，不宜做重大变动。\n';
  }

  // 总结性建议
  advice += `\n总的来说，${primary.name}提醒您要顺应时势，把握机遇，同时保持内心的平静与智慧。`;

  return advice;
}

// 获取基础建议
function getGeneralAdvice(hexagramName: string, features: {
  yangCount: number;
  yinCount: number;
  changingCount: number;
  isStable: boolean;
  isChanging: boolean;
  element: string;
}): string {
  if (features.element === '阳') {
    return '当前阳气较盛，适合积极主动，勇于开拓新局面。';
  } else if (features.element === '阴') {
    return '当前阴气较重，适合内省沉淀，积蓄力量等待时机。';
  } else {
    return '当前阴阳平衡，适合寻求和谐稳定的发展道路。';
  }
}

// 获取问题类型相关建议
function getQuestionSpecificAdvice(questionType: string, features: {
  yangCount: number;
  yinCount: number;
  changingCount: number;
  isStable: boolean;
  isChanging: boolean;
  element: string;
}): string {
  switch (questionType) {
    case 'career':
      return `• 在事业发展中，${features.element === '阳' ? '适合主动出击' : '适合稳健经营'}，避免急功近利。\n`;
    case 'relationship':
      return '• 在感情关系中，多换位思考，以诚相待，避免固执己见。\n';
    case 'health':
      return '• 注重身心健康，保持良好的生活习惯，适当运动调节身心。\n';
    case 'finance':
      return '• 理财投资要谨慎，避免风险过高的项目，稳健为上。\n';
    case 'education':
      return '• 学习过程中要循序渐进，打好基础，持之以恒。\n';
    default:
      return '• 在日常生活中，保持开放心态，接纳不同观点。\n';
  }
}

// 获取变爻建议
function getChangingLineAdvice(changingCount: number, changingName: string): string {
  if (changingCount === 1) {
    return '• 有一个变爻，提示您需要在某个方面做出适当调整。\n';
  } else if (changingCount <= 3) {
    return `• 有${changingCount}个变爻，显示您正处于变化之中，需要灵活应对各种情况。\n`;
  } else {
    return `• 有${changingCount}个变爻，${changingName}提示您当前变化较大，需要做好充分准备，适应新的环境。\n`;
  }
}

// 生成深度分析
function generateDeepAnalysis(
  interpretation: HexagramInterpretation,
  features: {
    yangCount: number;
    yinCount: number;
    changingCount: number;
    isStable: boolean;
    isChanging: boolean;
    element: string;
  },
  changingPositions: number[],
  questionType: string
): string {
  const { primary, changing } = interpretation;

  let analysis = `深度卦象分析：\n\n`;

  // 本卦分析
  analysis += `• 本卦：${primary.name}（${primary.binary}）\n`;
  analysis += `  ${primary.description}\n`;

  // 变卦分析
  analysis += `• 变卦：${changing.name}（${changing.binary}）\n`;
  analysis += `  ${changing.description}\n`;

  // 卦象特征分析
  analysis += `\n卦象特征：\n`;
  analysis += `• 阳爻：${features.yangCount}个，阴爻：${features.yinCount}个\n`;
  analysis += `• 卦象性质：${features.element}\n`;
  analysis += `• 变化程度：${features.changingCount}个变爻\n`;

  // 变爻位置分析
  if (changingPositions.length > 0) {
    analysis += `• 变爻位置：第${changingPositions.join('、')}爻\n`;

    // 根据变爻位置提供分析
    const lineAnalysis = analyzeChangingLines(changingPositions);
    analysis += `• 变爻含义：${lineAnalysis}\n`;
  }

  // 综合分析
  analysis += `\n综合解读：\n`;
  analysis += getComprehensiveAnalysis(primary.name, changing.name, features, questionType);

  return analysis;
}

// 分析变爻含义
function analyzeChangingLines(positions: number[]): string {
  const meanings = [
    '初爻：基础变化，暗示事情的开端将有转变',
    '二爻：稳定变化，表示发展过程中的调整',
    '三爻：关键变化，提示转折点的重要性',
    '四爻：深化变化，象征深入阶段的转变',
    '五爻：核心变化，代表主要方向的调整',
    '上爻：完成变化，意味着事情即将进入新阶段'
  ];

  return positions.map(pos => meanings[pos - 1]).join('；');
}

// 获取综合分析
function getComprehensiveAnalysis(
  primaryName: string,
  changingName: string,
  features: {
    yangCount: number;
    yinCount: number;
    changingCount: number;
    isStable: boolean;
    isChanging: boolean;
    element: string;
  },
  questionType: string
): string {
  let analysis = '';

  if (features.isStable) {
    analysis = `${primaryName}显示当前状态相对稳定，适合做长远规划。`;
  } else if (features.isChanging) {
    analysis = `${primaryName}与${changingName}的变化较多，提示您当前正处于重要的转型期。`;
  } else {
    analysis = `${primaryName}显示有适度变化，提醒您在稳定中寻求突破。`;
  }

  // 根据问题类型添加具体分析
  switch (questionType) {
    case 'career':
      analysis += ' 在事业发展中，建议您既要保持战略定力，又要灵活应对市场变化。';
      break;
    case 'relationship':
      analysis += ' 在感情关系中，建议您在保持自我的同时，也要学会为对方着想。';
      break;
    case 'health':
      analysis += ' 在健康方面，建议您既要积极调理，也要保持平和的心态。';
      break;
    case 'finance':
      analysis += ' 在财务规划中，建议您既要稳健投资，也要适当把握机会。';
      break;
    case 'education':
      analysis += ' 在学习过程中，建议您既要打好基础，也要勇于探索新领域。';
      break;
    default:
      analysis += ' 在人生道路上，建议您既要脚踏实地，也要仰望星空。';
  }

  return analysis;
}


export const Interpretation: React.FC<InterpretationProps> = ({
  hexagram,
  question,
  isLoading = false,
  className = ''
}) => {
  const [aiInterpretation, setAIInterpretation] = useState<AIInterpretationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 获取卦象信息

  // 生成AI解读
  const generateInterpretation = async (isRetry = false) => {
    if (!question || !hexagram || isLoading) return;

    console.log(`🚀 [AI] ${isRetry ? '重新生成' : '开始生成'}真实AI解读... (尝试次数: ${retryCount + 1})`);

    setIsRegenerating(isRetry);
    setError(null);

    try {
      // 构建AI请求
      const aiRequest: AIInterpretationRequest = {
        hexagram,
        question
      };

      console.log('🔍 [DEBUG] AI请求参数:', {
        question: question.substring(0, 50) + '...',
        hexagram: {
          primary: hexagram.primary,
          changing: hexagram.changing,
          changingPositions: hexagram.changingPositions
        }
      });

      // 调用真实AI服务
      const response = await generateAIInterpretation(aiRequest);

      console.log('🎉 [AI] 真实AI解读生成成功');
      setAIInterpretation(response);
      setError(null);
      setRetryCount(0);
    } catch (err: unknown) {
      console.error('❌ [AI] 真实AI调用失败:', err);

      const errorMessage = err instanceof Error ? err.message : '未知错误';
      console.error('🔍 [DEBUG] 错误详情:', {
        errorType: err instanceof Error ? err.constructor.name : typeof err,
        errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      });

      // 如果AI服务失败，回退到本地模拟版本
      console.log('🔄 [AI] 回退到本地模拟版本...');
      try {
        if (hexagram) {
          const localResponse = await generateLocalAIInterpretation(hexagram, question);
          console.log('✅ [LOCAL] 本地模拟版本生成成功');
          setAIInterpretation(localResponse);
          setError(`AI服务暂时不可用，已使用本地模拟解读 (${errorMessage})`);
          setRetryCount(0);
        }
      } catch (localErr: unknown) {
        console.error('❌ [LOCAL] 本地模拟版本也失败:', localErr);
        setError('生成AI解读时发生错误，请稍后重试');
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  // 初始生成和重新生成
  useEffect(() => {
    if (question && hexagram && !isLoading) {
      generateInterpretation();
    }
  }, [question, hexagram, isLoading]);

  // 重新生成按钮处理
  const handleRegenerate = () => {
    generateInterpretation(true);
  };


  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* 用户问题 - 国风卷轴样式 */}
      <div className="scroll-border paper-texture-enhanced p-6 ink-appear">
        <div className="flex items-center mb-4">
          <div className="w-3 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded mr-3"></div>
          <h3 className="text-xl font-bold font-brush text-amber-900">您的问题</h3>
        </div>
        <div className="bg-white/80 rounded-lg p-4">
          <p className="text-lg text-gray-800 leading-relaxed">{question}</p>
        </div>
      </div>



      {/* AI智能解卦 - 国风卷轴样式 */}
      {!aiInterpretation && (
        <div className="scroll-border paper-texture-enhanced p-6 ink-appear" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center mb-4">
            <div className="w-3 h-8 bg-gradient-to-b from-green-600 to-green-800 rounded mr-3"></div>
            <h3 className="text-xl font-bold font-brush text-green-900">AI智能解卦</h3>
          </div>
          <div className="bg-white/80 rounded-lg p-6 border border-amber-200">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="text-gray-600">正在生成AI解读...</span>
            </div>
          </div>
        </div>
      )}

      {aiInterpretation && (
        <div className="scroll-border paper-texture-enhanced p-6 ink-appear" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center mb-4">
            <div className="w-3 h-8 bg-gradient-to-b from-green-600 to-green-800 rounded mr-3"></div>
            <h3 className="text-xl font-bold font-brush text-green-900">AI智能解卦</h3>
            {error && (
              <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                本地模拟
              </span>
            )}
          </div>

          <div className="bg-white/80 rounded-lg p-6 border border-amber-200 space-y-4">
            <div>
              <h5 className="font-medium font-brush text-gray-700 mb-2">卦象解读</h5>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {aiInterpretation.interpretation}
              </div>
            </div>

            <div>
              <h5 className="font-medium font-brush text-gray-700 mb-2">建议指导</h5>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {aiInterpretation.advice}
              </div>
            </div>

            <div>
              <h5 className="font-medium font-brush text-gray-700 mb-2">深度分析</h5>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {aiInterpretation.analysis}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 错误提示和重新生成按钮 */}
      {error && (
        <div className="scroll-border paper-texture-enhanced p-6 ink-appear" style={{ animationDelay: '0.8s' }}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">生成失败</h4>
                  <p className="text-sm text-red-700">{error}</p>
                  {retryCount > 0 && (
                    <p className="text-xs text-red-600 mt-1">重试次数: {retryCount}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRegenerating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    重新生成中...
                  </div>
                ) : (
                  '重新生成'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 占卜建议 - 国风卷轴样式 */}
      <div className="scroll-border paper-texture-enhanced p-6 ink-appear" style={{ animationDelay: '1.0s' }}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-lg font-bold font-brush text-amber-900 mb-2">温馨提示</h4>
            <p className="text-gray-700 leading-relaxed">
              占卜结果仅供参考，命运掌握在自己手中。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};