'use client';

import React, { useState } from 'react';

interface QuestionFormProps {
  onSubmit: (question: string) => void;
  isSubmitting?: boolean;
  className?: string;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  onSubmit,
  isSubmitting = false,
  className = ''
}) => {
  const [question, setQuestion] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!question.trim()) {
      setError('请输入您想要占卜的问题');
      return;
    }

    if (question.trim().length > 100) {
      setError('问题不能超过100字');
      return;
    }

    onSubmit(question.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setQuestion(value);
      setCharCount(value.length);
      if (error) setError('');
    }
  };

  const examples = [
    '我的事业会有什么发展？',
    '这段感情会有结果吗？',
    '最近财运如何？',
    '我应该换工作吗？',
    '健康方面需要注意什么？'
  ];

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="paper-texture rounded-2xl shadow-2xl p-8 border-2 border-amber-200 relative overflow-hidden">
        {/* 仿古卷轴边框装饰 */}
        <div className="absolute inset-0 border-4 border-amber-300 rounded-2xl opacity-30 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 opacity-60"></div>

        <h2 className="text-3xl font-bold text-center mb-8 text-amber-900 font-serif tracking-wide">
          请您诚心默念想要占卜的问题
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 问题输入框 */}
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              您的问题
            </label>
            <textarea
              id="question"
              value={question}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="请输入您想要占卜的问题..."
              disabled={isSubmitting}
              className={`
                w-full px-4 py-3 border-2 border-amber-300 rounded-lg resize-none transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                ${isFocused
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-amber-300 hover:border-amber-400'
                }
                ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
                bg-white/80 backdrop-blur-sm
              `}
              rows={4}
              maxLength={100}
            />

            {error && (
              <div className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex justify-between items-center mt-2">
              <span className={`text-sm ${charCount > 80 ? 'text-red-500' : 'text-amber-600'}`}>
                {charCount}/100 字
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !question.trim()}
                className={`
                  px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg
                  transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                  ${isSubmitting || !question.trim()
                    ? 'opacity-60 cursor-not-allowed hover:scale-100 hover:shadow-none'
                    : 'hover:from-amber-700 hover:to-amber-800'
                  }
                  font-medium
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    占卜中...
                  </div>
                ) : (
                  '开始占卜'
                )}
              </button>
            </div>
          </div>

          {/* 示例问题 */}
          <div className="border-t border-amber-200 pt-4">
            <p className="text-sm text-amber-700 mb-3 font-medium">参考示例：</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setQuestion(example)}
                  disabled={isSubmitting}
                  className={`
                    px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm
                    transition-all duration-200 hover:bg-amber-200 hover:scale-105
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* 占卜提示 */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  <strong>温馨提示：</strong>请诚心诚意地提出您的问题，保持内心的平静和专注，这样更容易获得准确的指引。
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};