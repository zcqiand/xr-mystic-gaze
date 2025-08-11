# 周易AI占卜应用

一个基于Next.js开发的现代化周易占卜应用，结合传统铜钱摇卦与AI智能解卦，为用户提供沉浸式的易经占卜体验。

## 🌟 项目特色

- **传统与现代结合**：采用传统铜钱摇卦方式，结合AI智能解卦
- **国风设计**：精美的国风UI设计，宣纸纹理、毛笔字体、卷轴效果
- **3D交互**：逼真的3D铜钱动画效果，支持设备摇晃感应
- **响应式设计**：完美适配桌面端和移动端设备
- **64卦完整支持**：完整的周易64卦象数据库和解读

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm、yarn、pnpm 或 bun 包管理器

### 安装和运行

1. **克隆项目**
```bash
git clone <repository-url>
cd xr-mystic-gaze
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

4. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📱 使用说明

### 占卜流程

1. **输入问题**
   - 在问题输入框中诚心默念想要占卜的问题
   - 问题长度限制在100字以内
   - 可点击示例问题快速填充

2. **摇卦过程**
   - 在支持陀螺仪的设备上：摇晃手机进行摇卦
   - 在不支持陀螺仪的设备上：点击"摇卦"按钮手动摇卦
   - 需要完成6次摇卦，每次生成3枚铜钱的结果

3. **查看结果**
   - 系统自动生成本卦和变卦
   - AI智能解读提供个性化建议

## 🎨 技术栈

- **前端框架**：Next.js 14+ (App Router)
- **开发语言**：TypeScript
- **样式方案**：Tailwind CSS
- **字体**：Ma Shan Zheng（毛笔字体）
- **动画**：CSS3 3D变换、动画效果
- **设备API**：DeviceMotionEvent（陀螺仪感应）

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React组件
│   ├── divination/        # 占卜相关组件
│   │   ├── Coin.tsx       # 铜钱组件
│   │   ├── HexagramDisplay.tsx # 卦象显示
│   │   ├── QuestionForm.tsx    # 问题表单
│   │   └── ShakeSensor.tsx     # 摇卦传感器
│   └── result/            # 结果展示组件
│       └── Interpretation.tsx  # 解卦结果
├── services/              # 业务逻辑服务
│   ├── hexagram.ts        # 卦象生成逻辑
│   └── hexagram.test.ts   # 测试文件
└── public/                # 静态资源
```

## 🔧 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 运行测试
npm test
```

## 📖 功能特性

### 核心功能

- **铜钱摇卦**：3D铜钱动画，支持设备摇晃感应
- **卦象生成**：基于传统周易算法生成64卦
- **AI解卦**：智能解读卦象含义，提供个性化建议
- **历史记录**：保存占卜历史，便于回顾分析

### 技术特性

- **响应式设计**：适配各种屏幕尺寸
- **无障碍支持**：支持键盘导航和屏幕阅读器
- **性能优化**：代码分割、懒加载、缓存策略
- **PWA支持**：可安装到桌面，离线访问

## 🎯 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 邮箱：1282301776@qq.com
- 主页：https://home.nanrong.store/
- Github: https://github.com/zcqiand

## 🙏 捐赠支持

如果觉得我们的内容对于你有所帮助，请作者喝杯咖啡吧！ 后续会继续完善更新！一起加油！

![](https://home.nanrong.store/assets/zhifu.png)

---

*© 2025 周易AI占卜. 保留所有权利.*
*本应用仅供娱乐参考，请理性对待占卜结果。*
