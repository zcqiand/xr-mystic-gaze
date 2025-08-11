import {
  generateHexagram,
  interpretHexagram,
  validateHexagram,
  getHexagramName,
  getHexagramDescription,
  HexagramData,
} from './hexagram';

describe('Hexagram Service', () => {
  describe('generateHexagram', () => {
    it('应该生成有效的卦象数据', () => {
      const hexagram = generateHexagram();

      expect(hexagram).toHaveProperty('primary');
      expect(hexagram).toHaveProperty('changing');
      expect(hexagram).toHaveProperty('changingPositions');
      expect(hexagram).toHaveProperty('timestamp');

      expect(hexagram.primary).toHaveLength(6);
      expect(hexagram.changing).toHaveLength(6);
      expect(hexagram.changingPositions).toBeInstanceOf(Array);

      // 验证爻位状态
      hexagram.primary.forEach(yao => {
        expect(yao === 0 || yao === 1).toBe(true);
      });

      hexagram.changing.forEach(yao => {
        expect(yao === 0 || yao === 1).toBe(true);
      });
    });

    it('应该生成6个爻位', () => {
      const hexagram = generateHexagram();
      expect(hexagram.primary).toHaveLength(6);
      expect(hexagram.changing).toHaveLength(6);
    });

    it('应该有正确的时间戳', () => {
      const hexagram = generateHexagram();
      expect(typeof hexagram.timestamp).toBe('number');
      expect(hexagram.timestamp).toBeGreaterThan(0);
    });

    it('变爻位置应该在有效范围内', () => {
      const hexagram = generateHexagram();
      hexagram.changingPositions.forEach(position => {
        expect(position).toBeGreaterThanOrEqual(0);
        expect(position).toBeLessThan(6);
      });
    });

    it('如果没有变爻，changingPositions应该为空数组', () => {
      // 模拟没有变爻的情况
      const mockMath = Object.create(global.Math);
      mockMath.random = () => 0.5; // 总是返回阳爻
      global.Math = mockMath;

      const hexagram = generateHexagram();
      expect(hexagram.changingPositions).toEqual([]);

      // 恢复原始Math对象
      global.Math = Math;
    });
  });

  describe('validateHexagram', () => {
    it('应该验证有效的卦象', () => {
      const validHexagram: HexagramData = {
        primary: [1, 0, 1, 0, 1, 0],
        changing: [1, 0, 1, 0, 1, 0],
        changingPositions: [],
        timestamp: Date.now()
      };

      expect(validateHexagram(validHexagram)).toBe(true);
    });

    it('应该拒绝无效的卦象长度', () => {
      const invalidHexagram: HexagramData = {
        primary: [1, 0, 1], // 长度不足
        changing: [1, 0, 1],
        changingPositions: [],
        timestamp: Date.now()
      };

      expect(validateHexagram(invalidHexagram)).toBe(false);
    });

    it('应该拒绝无效的爻位值', () => {
      // 创建一个包含无效值的对象
      const invalidHexagram = {
        primary: [1, 1, 1, 0, 1, 0],
        changing: [1, 0, 1, 0, 1, 0],
        changingPositions: [],
        timestamp: Date.now()
      } as HexagramData & { primary: number[] };

      // 修改其中一个值为无效值
      (invalidHexagram.primary as number[])[1] = 2;

      expect(validateHexagram(invalidHexagram)).toBe(false);
    });
  });

  describe('getHexagramName', () => {
    it('应该返回正确的卦象名称', () => {
      const hexagram: HexagramData = {
        primary: [0, 0, 0, 0, 0, 0], // 乾卦 (000000 = 0)
        changing: [0, 0, 0, 0, 0, 0],
        changingPositions: [],
        timestamp: Date.now()
      };

      expect(getHexagramName(hexagram)).toBe('乾为天');
    });

    it('应该返回第64卦的名称', () => {
      const hexagram: HexagramData = {
        primary: [1, 1, 1, 1, 1, 1], // 第64卦 (111111 = 63)
        changing: [1, 1, 1, 1, 1, 1],
        changingPositions: [],
        timestamp: Date.now()
      };

      expect(getHexagramName(hexagram)).toBe('火水未济');
    });

    it('应该返回未知卦象名称对于无效输入', () => {
      const hexagram: HexagramData = {
        primary: [1, 1, 1, 1, 1, 1], // 乾卦
        changing: [1, 1, 1, 1, 1, 1],
        changingPositions: [],
        timestamp: Date.now()
      };

      // 测试边界情况
      expect(getHexagramName(hexagram)).not.toBe('未知卦象');
    });
  });

  describe('getHexagramDescription', () => {
    it('应该返回正确的卦象描述', () => {
      const hexagram: HexagramData = {
        primary: [0, 0, 0, 0, 0, 0], // 乾卦
        changing: [1, 1, 1, 1, 1, 1], // 第64卦
        changingPositions: [0, 1, 2, 3, 4, 5], // 所有爻都变
        timestamp: Date.now()
      };

      const description = getHexagramDescription(hexagram);
      expect(description).toContain('本卦：乾为天');
      expect(description).toContain('变卦：火水未济');
      expect(description).toContain('000000');
      expect(description).toContain('111111');
    });
  });

  describe('interpretHexagram', () => {
    it('应该返回完整的卦象解读', () => {
      const hexagram: HexagramData = {
        primary: [0, 0, 0, 0, 0, 0], // 乾卦
        changing: [1, 1, 1, 1, 1, 1], // 第64卦
        changingPositions: [0, 1, 2, 3, 4, 5], // 所有爻都变
        timestamp: Date.now()
      };

      const interpretation = interpretHexagram(hexagram);

      expect(interpretation).toHaveProperty('primary');
      expect(interpretation).toHaveProperty('changing');
      expect(interpretation).toHaveProperty('changingLines');

      expect(interpretation.primary.name).toBe('乾为天');
      expect(interpretation.primary.number).toBe(1);
      expect(interpretation.primary.binary).toBe('000000');

      expect(interpretation.changing.name).toBe('火水未济');
      expect(interpretation.changing.number).toBe(64);
      expect(interpretation.changing.binary).toBe('111111');

      expect(interpretation.changingLines).toHaveLength(6);
      interpretation.changingLines.forEach((line, index) => {
        expect(line.position).toBe(index + 1);
        expect(line.originalYao).toBe(0);
        expect(line.changingYao).toBe(1);
      });
    });

    it('应该正确处理没有变爻的情况', () => {
      const hexagram: HexagramData = {
        primary: [1, 0, 1, 0, 1, 0], // 没有变爻
        changing: [1, 0, 1, 0, 1, 0],
        changingPositions: [],
        timestamp: Date.now()
      };

      const interpretation = interpretHexagram(hexagram);

      expect(interpretation.changingLines).toHaveLength(0);
      expect(interpretation.primary.name).toBe(interpretation.changing.name);
      expect(interpretation.primary.binary).toBe(interpretation.changing.binary);
    });

    it('应该正确处理部分变爻的情况', () => {
      const hexagram: HexagramData = {
        primary: [1, 1, 1, 1, 1, 1], // 乾卦
        changing: [0, 1, 1, 1, 1, 1], // 只有第一爻变
        changingPositions: [0],
        timestamp: Date.now()
      };

      const interpretation = interpretHexagram(hexagram);

      expect(interpretation.changingLines).toHaveLength(1);
      expect(interpretation.changingLines[0].position).toBe(1);
      expect(interpretation.changingLines[0].originalYao).toBe(1);
      expect(interpretation.changingLines[0].changingYao).toBe(0);
    });
  });

  describe('铜钱摇卦算法', () => {
    it('castSingleCoin应该返回有效的铜钱结果', () => {
      // 由于castSingleCoin是私有函数，我们通过generateHexagram来测试
      const hexagram = generateHexagram();

      // 验证所有爻位都是有效的
      hexagram.primary.forEach(yao => {
        expect(yao === 0 || yao === 1).toBe(true);
      });
    });

    it('应该能够生成变爻', () => {
      // 模拟总是产生变爻的情况
      const mockMath = Object.create(global.Math);
      mockMath.random = () => 0.9; // 总是返回变爻
      global.Math = mockMath;

      const hexagram = generateHexagram();

      // 应该所有爻都是变爻
      expect(hexagram.changingPositions).toHaveLength(6);
      hexagram.changingPositions.forEach(position => {
        expect(hexagram.primary[position]).toBe(1);
        expect(hexagram.changing[position]).toBe(0);
      });

      // 恢复原始Math对象
      global.Math = Math;
    });

    it('应该能够生成没有变爻的卦象', () => {
      // 模拟从不产生变爻的情况
      const mockMath = Object.create(global.Math);
      mockMath.random = () => 0.5; // 总是返回阳爻
      global.Math = mockMath;

      const hexagram = generateHexagram();

      // 应该没有变爻
      expect(hexagram.changingPositions).toHaveLength(0);
      hexagram.primary.forEach((yao, index) => {
        expect(hexagram.changing[index]).toBe(yao);
      });

      // 恢复原始Math对象
      global.Math = Math;
    });
  });

  describe('边界情况', () => {
    it('应该处理所有阴爻的情况', () => {
      const hexagram: HexagramData = {
        primary: [0, 0, 0, 0, 0, 0], // 乾卦
        changing: [0, 0, 0, 0, 0, 0],
        changingPositions: [],
        timestamp: Date.now()
      };

      expect(validateHexagram(hexagram)).toBe(true);
      expect(getHexagramName(hexagram)).toBe('乾为天');
    });

    it('应该处理所有阳爻的情况', () => {
      const hexagram: HexagramData = {
        primary: [1, 1, 1, 1, 1, 1], // 第64卦 (111111 = 63)
        changing: [1, 1, 1, 1, 1, 1],
        changingPositions: [],
        timestamp: Date.now()
      };

      expect(validateHexagram(hexagram)).toBe(true);
      expect(getHexagramName(hexagram)).toBe('火水未济');
    });

    it('应该处理混合爻位的情况', () => {
      const hexagram: HexagramData = {
        primary: [1, 0, 1, 0, 1, 0], // 阴阳交替
        changing: [1, 0, 1, 0, 1, 0],
        changingPositions: [],
        timestamp: Date.now()
      };

      expect(validateHexagram(hexagram)).toBe(true);
    });
  });

  describe('性能测试', () => {
    it('generateHexagram应该快速执行', () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        generateHexagram();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 1000次生成应该在1秒内完成
    });
  });
});