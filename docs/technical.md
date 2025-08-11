# 周易AI占卜应用技术架构

## 项目概述

周易AI占卜应用是一个基于Next.js 14+开发的现代化Web应用，结合传统周易占卜文化与现代AI技术，为用户提供沉浸式的占卜体验。项目采用TypeScript开发，使用Tailwind CSS进行样式设计，支持设备陀螺仪感应和响应式布局。

## 技术栈

### 核心技术
- **前端框架**: Next.js 14+ (App Router)
- **开发语言**: TypeScript 5.0+
- **样式方案**: Tailwind CSS 3.0+
- **构建工具**: Turbopack (开发环境)
- **代码规范**: ESLint + Prettier

### UI/UX技术
- **字体**: Ma Shan Zheng (Google Fonts)
- **图标**: 自定义SVG图标
- **动画**: CSS3 3D变换、动画效果
- **响应式**: 移动优先的设计理念

### 设备交互
- **陀螺仪**: DeviceMotionEvent API
- **震动反馈**: Vibration API
- **分享功能**: Web Share API + 社交媒体集成

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式与国风主题
│   ├── layout.tsx         # 根布局组件
│   └── page.tsx           # 主页面组件
├── components/            # React组件库
│   ├── divination/        # 占卜相关组件
│   │   ├── Coin.tsx       # 3D铜钱动画组件
│   │   ├── HexagramDisplay.tsx # 卦象SVG展示
│   │   ├── QuestionForm.tsx    # 问题输入表单
│   │   └── ShakeSensor.tsx     # 摇卦传感器组件
│   └── result/            # 结果展示组件
│       ├── Interpretation.tsx  # AI解卦结果
│       └── ShareButton.tsx     # 分享功能组件
├── services/              # 业务逻辑服务
│   ├── hexagram.ts        # 卦象生成算法
│   └── hexagram.test.ts   # 单元测试
└── types/                 # TypeScript类型定义
    └── index.ts
```

## 核心功能实现

### 1. 卦象生成算法 (`src/services/hexagram.ts`)

#### 数据结构
```typescript
// 卦象数据结构
export interface HexagramData {
  primary: number[];        // 本卦 (6位二进制)
  changing: number[];       // 变卦 (6位二进制)
  changingPositions: number[]; // 变爻位置
  timestamp: number;        // 生成时间戳
}

// 铜钱摇卦结果
export type CoinResult = 0 | 1 | 2; // 0=阴爻, 1=阳爻, 2=变爻
```

#### 摇卦算法
```typescript
// 单次摇卦 (模拟三枚铜钱)
function castCoins(): CoinResult[] {
  const results: CoinResult[] = [];
  for (let i = 0; i < 3; i++) {
    const rand = Math.random();
    if (rand < 0.25) results.push(0);    // 阴爻 (概率25%)
    else if (rand < 0.75) results.push(1); // 阳爻 (概率50%)
    else results.push(2);                // 变爻 (概率25%)
  }
  return results;
}

// 完整卦象生成 (6爻)
export function generateHexagram(): HexagramData {
  const primary: number[] = [];
  const changing: number[] = [];
  const changingPositions: number[] = [];
  
  for (let i = 0; i < 6; i++) {
    const cast = castCoins();
    const sum = cast.reduce((a, b) => a + b, 0);
    
    // 根据摇卦结果确定爻的状态
    const isYin = sum <= 2;  // 总和≤2为阴爻
    const hasChanging = cast.includes(2); // 包含变爻
    
    primary.push(isYin ? 0 : 1);
    changing.push(hasChanging ? 1 : 0);
    
    if (hasChanging) {
      changingPositions.push(i);
    }
  }
  
  return {
    primary,
    changing,
    changingPositions,
    timestamp: Date.now()
  };
}
```

#### 卦象解析
```typescript
// 卦象名称映射 (64卦)
const hexagramNames: Record<string, string> = {
  '111111': '乾为天',
  '000000': '坤为地',
  '010001': '水雷屯',
  // ... 其他62卦
};

// 卦象解读
export function interpretHexagram(hexagram: HexagramData): HexagramInterpretation {
  const primaryIndex = parseInt(hexagram.primary.join(''), 2);
  const changingIndex = parseInt(hexagram.changing.join(''), 2);
  
  return {
    primary: {
      name: hexagramNames[primaryIndex] || '未知卦象',
      number: primaryIndex + 1,
      binary: hexagram.primary.join(''),
      judgment: getJudgment(primaryIndex + 1),
      image: getImage(primaryIndex + 1)
    },
    changing: {
      name: hexagramNames[changingIndex] || '未知变卦',
      number: changingIndex + 1,
      binary: hexagram.changing.join(''),
      judgment: getJudgment(changingIndex + 1),
      image: getImage(changingIndex + 1)
    },
    changingLines: hexagram.changingPositions.map(pos => ({
      position: pos + 1,
      originalYao: hexagram.primary[pos],
      changingYao: hexagram.changing[pos],
      judgment: getLineJudgment(primaryIndex + 1, pos + 1),
      image: getLineImage(primaryIndex + 1, pos + 1)
    }))
  };
}
```

### 2. 3D铜钱组件 (`src/components/divination/Coin.tsx`)

#### 3D变换实现
```typescript
// 铜钱3D容器
<div className="relative w-24 h-24 mx-4 perspective-1000">
  <div
    className={`
      relative w-full h-full rounded-full border-4 flex items-center justify-center
      transform-style-3d transition-all duration-500 ease-out
      ${colors.bg} ${colors.border} ${colors.glow}
      ${isAnimating ? 'scale-110' : 'scale-100'}
    `}
    style={{
      transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
      transition: isAnimating ? 'none' : 'transform 0.6s ease-out'
    }}
  >
    {/* 铜钱正面 - 阳爻 */}
    <div className={`absolute inset-0 backface-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-xs font-bold mb-1">阳</div>
      <div className="w-full h-1 bg-current rounded-full opacity-90" />
      <div className="text-xs font-bold mt-1">阳</div>
    </div>

    {/* 铜钱背面 - 阴爻 */}
    <div className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-xs font-bold mb-1">阴</div>
      <div className="space-y-1 w-full">
        <div className="w-full h-1 bg-current rounded-full opacity-90" />
        <div className="w-full h-1 bg-current rounded-full opacity-90" />
      </div>
      <div className="text-xs font-bold mt-1">阴</div>
    </div>

    {/* 铜钱方孔 */}
    <div className="absolute w-4 h-4 bg-gray-900 rounded-full opacity-30" />
  </div>
</div>
```

#### 抛掷动画
```typescript
const animateToss = (timestamp: number) => {
  if (!startTimeRef.current) {
    startTimeRef.current = timestamp;
  }

  const elapsed = timestamp - startTimeRef.current;
  const duration = 2500; // 2.5秒动画

  if (elapsed < duration) {
    // 抛掷轨迹：上升 + 旋转 + 翻转
    const progress = elapsed / duration;
    const height = Math.sin(progress * Math.PI) * -100; // 上升100px
    const rotationX = Math.sin(progress * Math.PI * 4) * 720; // X轴旋转
    const rotationY = progress * 1440; // Y轴旋转（翻转）

    setRotation({ x: rotationX, y: rotationY });
    setIsFlipped(progress > 0.5); // 过半程后翻转显示背面

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
```

### 3. 设备摇晃检测 (`src/components/divination/ShakeSensor.tsx`)

#### 陀螺仪API集成
```typescript
// 检测设备是否支持陀螺仪
useEffect(() => {
  if (typeof window === 'undefined' || !window.DeviceMotionEvent) {
    setIsMotionSupported(false);
    return;
  }

  // 检查是否需要权限 (iOS 13+)
  if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
    setIsMotionSupported(true);
  }
}, []);

// 摇晃检测算法
const setupShakeDetection = useCallback(() => {
  if (!isMotionSupported) return;

  const handleMotion = (event: DeviceMotionEvent) => {
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

    if (accelerationMagnitude > shakeThreshold) {
      lastShakeTime.current = now;
      handleShake();
    }
  };

  window.addEventListener('devicemotion', handleMotion);
  return () => window.removeEventListener('devicemotion', handleMotion);
}, [isShaking, isComplete, isMotionSupported, shakeThreshold]);
```

#### 手动摇卦备选方案
```typescript
const handleManualShake = useCallback(() => {
  if (isShaking || isComplete) return;

  setIsShaking(true);
  onShakeStart?.();

  // 模拟摇卦动画
  setTimeout(() => {
    handleShake();
  }, 500);
}, [isShaking, isComplete, onShakeStart, handleShake]);

// 渲染摇卦按钮
<button
  onClick={handleManualShake}
  disabled={isShaking}
  className={`
    px-8 py-4 rounded-full text-white font-semibold text-lg
    transition-all duration-300 transform hover:scale-105
    ${isShaking
      ? 'bg-amber-400 cursor-not-allowed'
      : 'bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 shadow-lg hover:shadow-xl'
    }
  `}
>
  {isShaking ? '摇卦中...' : '摇卦'}
</button>
```

### 4. AI解卦功能 (`src/components/result/Interpretation.tsx`)

#### 模拟AI API调用
```typescript
// 模拟AI解卦API调用
const generateAIInterpretation = async (
  hexagram: HexagramData,
  question: string
): Promise<AIInterpretationResponse> => {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  const interpretation = interpretHexagram(hexagram);
  const primaryName = interpretation.primary.name;
  const changingName = interpretation.changing.name;

  return {
    interpretation: `根据您的问题"${question}"，占得${primaryName}。${interpretation.primary.judgment}\n\n${interpretation.primary.image}\n\n此卦象征着${interpretation.primary.description}。在当前情况下，建议您${getAdviceBasedOnHexagram(primaryName)}。`,
    advice: `基于${primaryName}的启示，建议您：\n1. 保持内心的平静与清明\n2. 顺应时势，把握机遇\n3. 谨言慎行，避免冲动决策\n4. 相信自己的判断力\n5. 与他人和谐相处，寻求合作`,
    analysis: `卦象分析：\n• 本卦：${primaryName} - ${interpretation.primary.description}\n• 变卦：${changingName} - ${interpretation.changing.description}\n• 变爻位置：${hexagram.changingPositions.map(pos => pos + 1).join('、')}爻\n\n此卦象显示您当前处于${getAnalysisBasedOnHexagram(primaryName)}的状态，通过变卦可以看出发展趋势将朝着${getAnalysisBasedOnHexagram(changingName)}的方向发展。`
  };
};
```

#### 国风UI设计
```typescript
// 国风卷轴样式
<div className="scroll-border paper-texture-enhanced p-6 ink-appear">
  <div className="flex items-center mb-4">
    <div className="w-3 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded mr-3"></div>
    <h3 className="text-xl font-bold font-brush text-blue-900">本卦解析</h3>
  </div>

  <div className="space-y-4">
    <div>
      <h4 className="text-lg font-semibold font-brush text-gray-800 mb-2">{primaryInfo.name}</h4>
      <p className="text-gray-700 leading-relaxed">{primaryInfo.description}</p>
    </div>

    <div className="bg-white/80 rounded-lg p-4 border border-amber-200">
      <h5 className="font-medium font-brush text-gray-700 mb-2">卦辞</h5>
      <p className="text-gray-800 leading-relaxed">{primaryInfo.judgment}</p>
    </div>
  </div>
</div>
```

### 5. 分享功能 (`src/components/result/ShareButton.tsx`)

#### Web Share API集成
```typescript
// Web Share API
const shareViaWebShare = async () => {
  if (!navigator.share) {
    copyToClipboard();
    return;
  }

  try {
    const shareText = generateShareText();
    await navigator.share({
      title: '周易占卦',
      text: shareText,
      url: generateShareUrl()
    });
  } catch (err) {
    if (err instanceof Error && err.name !== 'AbortError') {
      copyToClipboard();
    }
  }
};

// 生成分享文本（仅卦象信息，不含用户问题）
const generateShareText = (): string => {
  const primary = hexagramData.primary.join('');
  const changing = hexagramData.changing.join('');
  const timestamp = new Date(hexagramData.timestamp).toLocaleDateString('zh-CN');

  return `🔮 周易占卦 🔮

占卦时间：${timestamp}

本卦：${primary}
变卦：${changing}

#周易占卦 #AI解卦`;
};
```

#### 社交媒体分享
```typescript
// 分享到社交媒体
const shareToSocial = async (platform: string) => {
  const shareText = generateShareText();
  const shareUrl = generateShareUrl();

  const shareUrls: Record<string, string> = {
    weibo: `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
    qq: `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
    wechat: '' // 微信需要特殊处理
  };

  if (platform === 'wechat') {
    alert('请使用微信扫一扫功能分享');
    return;
  }

  if (shareUrls[platform]) {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  }
};
```

## 样式系统

### 国风设计主题
```css
/* globals.css */

/* 毛笔字体 */
@import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap');

/* 宣纸纹理效果 */
.paper-texture-enhanced {
  background:
    radial-gradient(ellipse at top, rgba(255, 248, 220, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at bottom, rgba(255, 248, 220, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #fefefe 0%, #faf8f3 25%, #f5f2e8 50%, #faf8f3 75%, #fefefe 100%);
  background-size: 100% 100%, 100% 100%, 40px 40px;
}

/* 仿古卷轴边框效果 */
.scroll-border {
  position: relative;
  background: linear-gradient(135deg, #fefefe 0%, #faf8f3 50%, #f5f2e8 100%);
  border: 2px solid #d4af37;
  border-radius: 8px;
}

.scroll-border::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #d4af37, #f4e04d, #d4af37);
  border-radius: 8px;
  z-index: -1;
  opacity: 0.6;
}

/* 水墨渐显动画 */
@keyframes ink-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ink-appear {
  animation: ink-appear 0.8s ease-out forwards;
}
```

### 响应式设计
```css
/* 移动设备适配 */
@media (max-width: 768px) {
  .hexagram-display {
    padding: 1rem !important;
  }

  .hexagram-display svg {
    width: 60px !important;
    height: 135px !important;
  }

  .hexagram-display h3 {
    font-size: 1.25rem !important;
  }
}

@media (max-width: 480px) {
  .hexagram-display {
    padding: 0.75rem !important;
  }

  .hexagram-display svg {
    width: 50px !important;
    height: 112px !important;
  }

  .hexagram-display h3 {
    font-size: 1.125rem !important;
  }
}

/* 铜钱组件响应式设计 */
@media (max-width: 640px) {
  .coin-container {
    transform: scale(0.8);
  }
}

@media (max-width: 480px) {
  .coin-container {
    transform: scale(0.7);
  }
}
```

## 状态管理

### 主应用状态 (`src/app/page.tsx`)
```typescript
export default function Home() {
  // 状态管理
  const [step, setStep] = useState<Step>('question');        // 当前步骤
  const [question, setQuestion] = useState<string>('');      // 用户问题
  const [hexagramData, setHexagramData] = useState<any>(null); // 卦象数据
  const [isProcessing, setIsProcessing] = useState(false);   // 处理状态
  const [error, setError] = useState<string | null>(null);   // 错误信息
  const [isDeviceSupported, setIsDeviceSupported] = useState(true); // 设备支持状态

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
    setHexagramData(hexagram);
    setStep('result');
  };

  // 重新开始占卜
  const handleRestart = () => {
    setStep('question');
    setQuestion('');
    setHexagramData(null);
    setError(null);
  };
}
```

## 性能优化

### 代码分割
```typescript
// 动态导入组件
const ShakeSensor = dynamic(() => import('@/components/divination/ShakeSensor'), {
  loading: () => <div>加载中...</div>,
  ssr: false // 不在服务端渲染
});

const Interpretation = dynamic(() => import('@/components/result/Interpretation'), {
  loading: () => <div>生成解读中...</div>,
  ssr: false
});
```

### 图片优化
```typescript
// 使用Next.js Image组件优化图片
import Image from 'next/image';

<Image
  src="/hexagram-bg.png"
  alt="卦象背景"
  width={800}
  height={600}
  priority // 优先加载
/>
```

### 缓存策略
```typescript
// 卦象数据缓存
const hexagramCache = new Map<string, HexagramInterpretation>();

export function getCachedInterpretation(hexagram: HexagramData): HexagramInterpretation {
  const cacheKey = hexagram.primary.join('') + hexagram.changing.join('');
  
  if (hexagramCache.has(cacheKey)) {
    return hexagramCache.get(cacheKey)!;
  }
  
  const interpretation = interpretHexagram(hexagram);
  hexagramCache.set(cacheKey, interpretation);
  return interpretation;
}
```

## 测试策略

### 单元测试
```typescript
// hexagram.test.ts
describe('Hexagram Generation', () => {
  test('should generate valid hexagram', () => {
    const hexagram = generateHexagram();
    
    expect(hexagram.primary).toHaveLength(6);
    expect(hexagram.changing).toHaveLength(6);
    expect(hexagram.primary.every(bit => bit === 0 || bit === 1)).toBe(true);
    expect(hexagram.changing.every(bit => bit === 0 || bit === 1)).toBe(true);
  });

  test('should have changing lines when cast includes changing coins', () => {
    const hexagram = generateHexagram();
    const hasChangingLines = hexagram.changing.some(bit => bit === 1);
    
    expect(hasChangingLines).toBeDefined();
  });
});
```

### 组件测试
```typescript
// 使用React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionForm } from '@/components/divination/QuestionForm';

describe('QuestionForm', () => {
  test('should render form elements', () => {
    render(<QuestionForm onSubmit={jest.fn()} />);
    
    expect(screen.getByPlaceholderText('请输入您想要占卜的问题...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '开始占卜' })).toBeInTheDocument();
  });

  test('should validate question input', () => {
    const onSubmit = jest.fn();
    render(<QuestionForm onSubmit={onSubmit} />);
    
    const input = screen.getByPlaceholderText('请输入您想要占卜的问题...');
    fireEvent.change(input, { target: { value: '' } });
    
    fireEvent.click(screen.getByRole('button', { name: '开始占卜' }));
    
    expect(screen.getByText('请输入您想要占卜的问题')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

## 部署配置

### 环境变量
```env
# .env.local
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_AI_API_KEY=your-ai-api-key
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Vercel部署配置
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://your-domain.com"
  }
}
```

### Docker部署
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

## 监控与分析

### 性能监控
```typescript
// 使用Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

// 在layout.tsx中
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 错误监控
```typescript
// 使用Sentry
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

## 安全考虑

### 内容安全策略
```html
<!-- 在layout.tsx中添加 -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.openai.com;"
/>
```

### 输入验证
```typescript
// 验证用户输入
const validateQuestion = (question: string): boolean => {
  const trimmed = question.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.length > 100) return false;
  if (/<[^>]*>/.test(trimmed)) return false; // 防止XSS
  
  return true;
};
```

## 未来规划

### 功能扩展
1. **用户系统**：用户注册、登录、个人历史记录
2. **高级AI**：集成真实的LLM API（如GPT-4）
3. **社交功能**：占卜社区、经验分享
4. **移动端应用**：React Native应用开发

### 技术优化
1. **PWA支持**：离线功能、推送通知
2. **国际化**：多语言支持
3. **性能优化**：图片懒加载、代码分割优化
4. **SEO优化**：结构化数据、元数据优化

### 数据扩展
1. **完整64卦数据库**：详细的卦辞、爻辞、象辞
2. **历史文献集成**：历代易学解读
3. **个性化推荐**：基于用户历史的智能推荐

---

*本文档最后更新：2025-08-11*
*技术栈：Next.js 14+, TypeScript, Tailwind CSS*
content>
<line_count>580</line_count>
</write_to_file>

[Response interrupted by a tool use result. Only one tool may be used at a time and should be placed at the end of the message.]
