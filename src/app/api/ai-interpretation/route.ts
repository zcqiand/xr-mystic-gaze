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
    const { question, prompt, hexagram } = body;

    console.log('🤖 [API] 收到AI解卦请求');
    console.log('🤖 [API] 用户问题:', question);

    // 调用AI模型，添加超时和重试机制
    let completion;
    const maxRetries = 2;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        console.log(`🤖 [API] 尝试调用AI模型 (第${retryCount + 1}次)`);
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
        break; // 成功则跳出重试循环
      } catch (error) {
        retryCount++;
        console.error(`🤖 [API] AI调用失败 (第${retryCount}次尝试):`, error);

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
      throw new Error('AI模型返回了空响应');
    }

    const response = completion.choices[0].message.content;
    console.log('🤖 [API] 解析AI响应:', response);

    // 解析JSON响应
    let aiResponse;
    try {
      aiResponse = JSON.parse(response);
    } catch (parseError) {
      console.error('🤖 [API] JSON解析失败:', parseError);
      throw new Error('AI响应格式不正确，无法解析JSON');
    }

    // 验证响应格式
    if (!aiResponse.interpretation || !aiResponse.advice || !aiResponse.analysis) {
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

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'API密钥配置错误，请检查环境变量' },
          { status: 500 }
        );
      } else if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'API调用频率超限，请稍后重试' },
          { status: 429 }
        );
      } else if (error.message.includes('connection')) {
        return NextResponse.json(
          { error: '网络连接失败，请检查网络设置' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'AI服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}