/**
 * 周易卦象生成服务
 * 实现传统铜钱摇卦算法
 */

// 爻位状态枚举
export type YaoStatus = 0 | 1; // 0=阴爻, 1=阳爻

// 铜钱摇卦结果枚举
export type CoinResult = 0 | 1 | 2; // 0=阴爻, 1=阳爻, 2=变爻

// 卦象数据结构
export interface HexagramData {
  primary: YaoStatus[]; // 本卦（6爻）
  changing: YaoStatus[]; // 变卦（6爻）
  changingPositions: number[]; // 变爻位置数组
  timestamp: number;
}

// 卦象解读结果
export interface HexagramInterpretation {
  primary: {
    name: string;
    number: number;
    binary: string;
    description: string;
    judgment: string; // 卦辞
    image: string; // 象辞
  };
  changing: {
    name: string;
    number: number;
    binary: string;
    description: string;
    judgment: string;
    image: string;
  };
  changingLines: Array<{
    position: number; // 爻位（1-6）
    originalYao: YaoStatus;
    changingYao: YaoStatus;
    judgment: string; // 爻辞
    image: string; // 爻象辞
  }>;
}

// 卦象信息
export interface HexagramInfo {
  name: string;
  number: number;
  binary: string;
  description: string;
  judgment: string;
  image: string;
  lines: Array<{
    position: number;
    yao: YaoStatus;
    judgment: string;
    image: string;
  }>;
}

// 单枚铜钱摇卦结果
function castSingleCoin(): CoinResult {
  const rand = Math.random();
  if (rand < 0.25) return 0; // 阴爻 (25%)
  if (rand < 0.75) return 1; // 阳爻 (50%)
  return 2; // 变爻 (25%)
}

// 三枚铜钱同时摇卦
function castCoins(): CoinResult[] {
  const results: CoinResult[] = [];
  for (let i = 0; i < 3; i++) {
    results.push(castSingleCoin());
  }
  return results;
}

// 根据三枚铜钱结果计算爻位
function calculateYao(cast: CoinResult[]): number {
  const sum = cast.reduce((a: number, b: number) => a + b, 0);
  // 根据传统算法：
  // 0-2: 阴爻
  // 3-5: 阳爻
  // 6: 变爻（阳变阴）
  return sum <= 2 ? 0 : (sum === 6 ? 2 : 1);
}

// 生成完整卦象
export function generateHexagram(): HexagramData {
  const primary: YaoStatus[] = [];
  const changing: YaoStatus[] = [];
  const changingPositions: number[] = [];

  // 摇卦6次，生成6爻（从下往上）
  for (let i = 0; i < 6; i++) {
    const cast = castCoins();
    const yao = calculateYao(cast);

    const yaoStatus = yao === 2 ? 1 : yao as YaoStatus; // 变爻转为阳爻
    primary.push(yaoStatus);

    if (yao === 2) {
      // 变爻：在变卦中变为相反的爻
      const changingYao = yaoStatus === 1 ? 0 : 1;
      changing.push(changingYao);
      changingPositions.push(i); // 记录变爻位置（0-5，对应第1-6爻）
    } else {
      changing.push(yaoStatus);
    }
  }

  return {
    primary,
    changing,
    changingPositions,
    timestamp: Date.now()
  };
}

// 卦象名称映射
export const hexagramNames = [
  '乾为天', '坤为地', '水雷屯', '山水蒙', '水天需', '天水讼',
  '地水师', '水地比', '风天小畜', '天泽履', '地天泰', '天地否',
  '天火同人', '火天大有', '地山谦', '雷地豫', '泽雷随', '山风蛊',
  '地泽临', '风地观', '火雷噬嗑', '山火贲', '山地剥', '地雷复',
  '天雷无妄', '山天大畜', '山雷颐', '泽风大过', '坎为水', '离为火',
  '泽山咸', '雷风恒', '天山遁', '雷天大壮', '火地晋', '地火明夷',
  '风火家人', '火泽睽', '水山蹇', '雷水解', '山泽损', '风雷益',
  '泽天夬', '天风姤', '泽地萃', '地风升', '泽水困', '水风井',
  '泽火革', '火风鼎', '震为雷', '艮为山', '风山渐', '雷泽归妹',
  '雷火丰', '火山旅', '巽为风', '兑为泽', '风水涣', '水泽节',
  '风泽中孚', '雷山小过', '水火既济', '火水未济'
];


// 获取卦象名称
export function getHexagramName(hexagram: HexagramData): string {
  // 将二进制转换为十进制索引（+1因为卦象从1开始）
  const primaryIndex = parseInt(hexagram.primary.join(''), 2);
  return hexagramNames[primaryIndex] || '未知卦象';
}

// 卦象解读
export function interpretHexagram(hexagram: HexagramData): HexagramInterpretation {
  // 获取本卦信息
  const primaryIndex = parseInt(hexagram.primary.join(''), 2);
  const primaryNumber = primaryIndex + 1;
  const primaryName = hexagramNames[primaryIndex] || '未知卦象';

  // 获取变卦信息
  const changingIndex = parseInt(hexagram.changing.join(''), 2);
  const changingNumber = changingIndex + 1;
  const changingName = hexagramNames[changingIndex] || '未知卦象';

  // 简化的卦象内容（AI智能解卦将提供更详细的解读）
  const primaryContent = {
    judgment: `第${primaryNumber}卦${primaryName}的卦辞`,
    image: `第${primaryNumber}卦${primaryName}的象辞`,
    lines: Array.from({ length: 6 }, (_, i) => ({
      position: i + 1,
      judgment: `第${primaryNumber}卦第${i + 1}爻的爻辞`,
      image: `第${primaryNumber}卦第${i + 1}爻的象辞`
    }))
  };

  const changingContent = {
    judgment: `第${changingNumber}卦${changingName}的卦辞`,
    image: `第${changingNumber}卦${changingName}的象辞`,
    lines: Array.from({ length: 6 }, (_, i) => ({
      position: i + 1,
      judgment: `第${changingNumber}卦第${i + 1}爻的爻辞`,
      image: `第${changingNumber}卦第${i + 1}爻的象辞`
    }))
  };

  // 构建变爻信息
  const changingLines = hexagram.changingPositions.map(position => {
    const originalYao = hexagram.primary[position];
    const changingYao = hexagram.changing[position];

    return {
      position: position + 1, // 转换为1-6的爻位
      originalYao,
      changingYao,
      judgment: primaryContent.lines[position]?.judgment || `第${position + 1}爻爻辞`,
      image: primaryContent.lines[position]?.image || `第${position + 1}爻象辞`
    };
  });

  return {
    primary: {
      name: primaryName,
      number: primaryNumber,
      binary: hexagram.primary.join(''),
      description: `第${primaryNumber}卦：${primaryName}`,
      judgment: primaryContent.judgment,
      image: primaryContent.image
    },
    changing: {
      name: changingName,
      number: changingNumber,
      binary: hexagram.changing.join(''),
      description: `第${changingNumber}卦：${changingName}`,
      judgment: changingContent.judgment,
      image: changingContent.image
    },
    changingLines
  };
}

// 验证卦象数据
export function validateHexagram(hexagram: HexagramData): boolean {
  return (
    hexagram.primary.length === 6 &&
    hexagram.changing.length === 6 &&
    hexagram.primary.every(bit => bit === 0 || bit === 1) &&
    hexagram.changing.every(bit => bit === 0 || bit === 1)
  );
}

// 获取卦象描述
export function getHexagramDescription(hexagram: HexagramData): string {
  const name = getHexagramName(hexagram);
  const primary = hexagram.primary.join('');
  const changing = hexagram.changing.join('');
  const changingName = hexagramNames[parseInt(changing, 2)] || '未知';

  return `本卦：${name}（${primary}）\n变卦：${changingName}（${changing}）`;
}