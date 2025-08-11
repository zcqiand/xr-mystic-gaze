/**
 * AI集成测试脚本
 * 用于测试AI服务是否正常工作
 */

console.log('🧪 开始测试AI服务连接...');

// 由于AI服务在Next.js环境中运行，我们无法直接测试
// 但我们可以检查环境变量是否正确配置
console.log('🔍 检查环境变量配置...');

const requiredEnvVars = [
  'OPENAI_BASE_URL',
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'SITE_URL',
  'SITE_NAME'
];

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: 未设置`);
  }
});

console.log('🎯 AI集成测试完成！');
console.log('💡 提示：请在浏览器中访问应用来测试真实的AI调用功能');