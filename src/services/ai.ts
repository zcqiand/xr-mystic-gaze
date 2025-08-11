/**
 * AI服务模块
 * 处理与AI大模型的交互，包括解卦、分析等功能
 * 采用服务器端调用方式，确保API密钥安全
 */

import { HexagramData, interpretHexagram, getHexagramName } from './hexagram';

// AI解卦请求接口
export interface AIInterpretationRequest {
  hexagram: HexagramData;
  question: string;
}

// AI解卦响应接口
export interface AIInterpretationResponse {
  interpretation: string;
  advice: string;
  analysis: string;
}

// AI服务错误类型
export class AIServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AIServiceError';
  }
}

/**
 * 生成AI解卦解读（服务器端调用）
 */
export const generateAIInterpretation = async (
  request: AIInterpretationRequest
): Promise<AIInterpretationResponse> => {
  console.log('🤖 [AI] 开始生成AI解卦解读');
  console.log('🤖 [AI] 用户问题:', request.question);
  console.log('🤖 [AI] 本卦:', getHexagramName(request.hexagram));

  try {
    // 构建AI提示词
    const prompt = buildInterpretationPrompt(request);

    console.log('🤖 [AI] 发送请求到AI模型...');

    // 调用服务器端API路由
    const response = await fetch('/api/ai-interpretation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: request.question,
        prompt: prompt,
        hexagram: {
          primary: request.hexagram.primary,
          changing: request.hexagram.changing,
          changingPositions: request.hexagram.changingPositions
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AIServiceError(errorData.message || 'AI服务调用失败', 'API_ERROR');
    }

    const data = await response.json();
    console.log('🤖 [AI] AI模型响应成功');

    // 验证响应格式
    if (!data.interpretation || !data.advice || !data.analysis) {
      throw new AIServiceError('AI响应格式不正确');
    }

    console.log('🤖 [AI] AI解卦解读生成完成');

    return {
      interpretation: data.interpretation,
      advice: data.advice,
      analysis: data.analysis
    };

  } catch (error) {
    console.error('🤖 [AI] AI调用失败:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new AIServiceError('API密钥配置错误，请检查环境变量', 'INVALID_API_KEY');
      } else if (error.message.includes('rate limit')) {
        throw new AIServiceError('API调用频率超限，请稍后重试', 'RATE_LIMIT');
      } else if (error.message.includes('connection')) {
        throw new AIServiceError('网络连接失败，请检查网络设置', 'NETWORK_ERROR');
      }
    }

    throw new AIServiceError('AI服务暂时不可用，请稍后重试', 'AI_SERVICE_ERROR');
  }
};

/**
 * 构建AI解卦提示词
 */
function buildInterpretationPrompt(request: AIInterpretationRequest): string {
  const { hexagram, question } = request;
  const interpretation = interpretHexagram(hexagram);

  // 获取卦象信息
  const primaryName = interpretation.primary.name;
  const changingName = interpretation.changing.name;
  const primaryBinary = hexagram.primary.join('');
  const changingBinary = hexagram.changing.join('');
  const changingPositions = hexagram.changingPositions.map(pos => pos + 1);

  // 构建详细的卦象描述
  let hexagramDescription = `本卦：${primaryName}（${primaryBinary}）
卦辞：${interpretation.primary.judgment}
象辞：${interpretation.primary.image}`;

  if (changingPositions.length > 0) {
    hexagramDescription += `

变卦：${changingName}（${changingBinary}）
卦辞：${interpretation.changing.judgment}
象辞：${interpretation.changing.image}

变爻位置：第${changingPositions.join('、')}爻`;
  }

  return `请为用户解卦：

用户问题：${question}

${hexagramDescription}

请基于以上信息，为用户提供专业的周易解卦解读。`;
}

/**
 * 测试AI服务连接
 */
export const testAIService = async (): Promise<boolean> => {
  try {
    console.log('🤖 [AI] 测试AI服务连接...');

    const response = await fetch('/api/ai-test', {
      method: 'GET',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    console.log('🤖 [AI] 测试响应:', data.message);

    return data.success || false;
  } catch (error) {
    console.error('🤖 [AI] 测试连接失败:', error);
    return false;
  }
};