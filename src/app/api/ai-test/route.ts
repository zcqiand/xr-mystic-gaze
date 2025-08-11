import { NextResponse } from 'next/server';
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

export async function GET() {
  try {
    console.log('🤖 [API] 测试AI服务连接...');

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "openai/gpt-oss-20b:free",
      messages: [
        {
          role: "user",
          content: "请回复\"连接成功\"四个字"
        }
      ],
      max_tokens: 10
    });

    const response = completion.choices[0]?.message?.content;
    console.log('🤖 [API] 测试响应:', response);

    if (response?.includes('连接成功')) {
      return NextResponse.json({
        success: true,
        message: 'AI服务连接成功',
        response: response
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'AI服务响应异常',
        response: response
      });
    }
  } catch (error) {
    console.error('🤖 [API] 测试连接失败:', error);
    return NextResponse.json({
      success: false,
      message: 'AI服务连接失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}