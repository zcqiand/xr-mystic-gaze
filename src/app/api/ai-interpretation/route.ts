import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI客户端配置（服务器端安全使用）
const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "https://novel-writing-assistant.com",
    "X-Title": process.env.SITE_NAME || "Novel Writing Assistant",
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, prompt } = body;

    console.log('🤖 [API] 收到AI解卦请求');
    console.log('🔍 [DEBUG] API请求详情:', {
      timestamp: new Date().toISOString(),
      questionLength: question?.length,
      hasPrompt: !!prompt,
      promptLength: prompt?.length,
      environment: {
        openaiBaseUrl: process.env.OPENAI_BASE_URL ? '已配置' : '未配置',
        openaiApiKey: process.env.OPENAI_API_KEY ? '已配置' : '未配置',
        openaiModel: process.env.OPENAI_MODEL || '默认'
      }
    });
    console.log('🤖 [API] 用户问题:', question);

    // 调用AI模型，添加超时和重试机制
    let completion;
    const maxRetries = 2;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        console.log(`🤖 [API] 尝试调用AI模型 (第${retryCount + 1}次)`);
        console.log('🔍 [DEBUG] AI调用参数:', {
          model: process.env.OPENAI_MODEL || "openai/gpt-oss-20b:free",
          temperature: 0.7,
          maxTokens: 1500,
          hasSystemPrompt: true,
          promptLength: prompt?.length
        });

        const startTime = Date.now();
        completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "openai/gpt-oss-20b:free",
          messages: [
            {
              role: "system",
              content: `你是一位专业的周易解卦大师，精通64卦的解读和人生指导。请根据用户提供的卦象和问题，给出专业、准确、有深度的解读。

解读要求：
1. 语言要专业但不晦涩，让普通人也能理解
2. 要结合具体的卦象含义和变爻情况
3. 要针对用户的具体问题给出建议
4. 解读要有深度，包含哲学思考
5. 态度要中正平和，避免绝对化的判断

请严格按照以下JSON格式回复：
{
  "interpretation": "卦象解读（300-500字）",
  "advice": "建议指导（200-300字）",
  "analysis": "深度分析（400-600字）"
}`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          response_format: { type: "json_object" }
        });

        const endTime = Date.now();
        console.log(`🎉 [API] AI调用成功，耗时: ${endTime - startTime}ms`);
        break; // 成功则跳出重试循环
      } catch (error) {
        retryCount++;
        console.error(`🤖 [API] AI调用失败 (第${retryCount}次尝试):`, error);
        console.error('🔍 [DEBUG] 错误详情:', {
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
          retryCount,
          maxRetries
        });

        if (retryCount >= maxRetries) {
          throw new Error('AI服务暂时不可用，请稍后重试');
        }

        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    console.log('🤖 [API] AI模型响应成功');

    // 解析AI响应
    if (!completion || !completion.choices[0]?.message?.content) {
      console.error('🔍 [DEBUG] AI响应为空:', {
        hasCompletion: !!completion,
        hasChoices: completion?.choices?.length,
        hasMessage: completion?.choices[0]?.message,
        hasContent: completion?.choices[0]?.message?.content
      });
      throw new Error('AI模型返回了空响应');
    }

    const response = completion.choices[0].message.content;
    console.log('🤖 [API] 解析AI响应:', response);
    console.log('🔍 [DEBUG] 响应长度:', response.length);

    // 解析JSON响应
    let aiResponse;
    try {
      aiResponse = JSON.parse(response);
      console.log('🎉 [API] JSON解析成功');
      console.log('🔍 [DEBUG] 解析后的响应结构:', {
        hasInterpretation: !!aiResponse.interpretation,
        hasAdvice: !!aiResponse.advice,
        hasAnalysis: !!aiResponse.analysis,
        interpretationLength: aiResponse.interpretation?.length,
        adviceLength: aiResponse.advice?.length,
        analysisLength: aiResponse.analysis?.length
      });
    } catch (parseError) {
      console.error('🤖 [API] JSON解析失败:', parseError);
      console.error('🔍 [DEBUG] 原始响应:', response);
      throw new Error('AI响应格式不正确，无法解析JSON');
    }

    // 验证响应格式
    if (!aiResponse.interpretation || !aiResponse.advice || !aiResponse.analysis) {
      console.error('🔍 [DEBUG] 响应字段验证失败:', aiResponse);
      throw new Error('AI响应格式不正确，缺少必要字段');
    }

    console.log('🤖 [API] AI解卦解读生成完成');

    return NextResponse.json({
      interpretation: aiResponse.interpretation,
      advice: aiResponse.advice,
      analysis: aiResponse.analysis
    });

  } catch (error) {
    console.error('🤖 [API] AI调用失败:', error);
    console.error('🔍 [DEBUG] 错误详细信息:', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.error('🔍 [DEBUG] 检测到API密钥问题');
        return NextResponse.json(
          { error: 'API密钥配置错误，请检查环境变量' },
          { status: 500 }
        );
      } else if (error.message.includes('rate limit')) {
        console.error('🔍 [DEBUG] 检测到频率限制问题');
        return NextResponse.json(
          { error: 'API调用频率超限，请稍后重试' },
          { status: 429 }
        );
      } else if (error.message.includes('connection')) {
        console.error('🔍 [DEBUG] 检测到连接问题');
        return NextResponse.json(
          { error: '网络连接失败，请检查网络设置' },
          { status: 500 }
        );
      }
    }

    console.error('🔍 [DEBUG] 未知错误类型，返回通用错误信息');
    return NextResponse.json(
      { error: 'AI服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}