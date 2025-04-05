'use client';

import { useState } from 'react';
import { sendMessageToSiliconFlow } from '../services/siliconflow';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_SILICONFLOW_API_KEY;

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;
    if (!apiKey) {
      alert('API Key未配置，请在.env.local文件中设置NEXT_PUBLIC_SILICONFLOW_API_KEY');
      return;
    }

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 调用SiliconFlow API
      const response = await sendMessageToSiliconFlow(inputText, apiKey);
      
      // 添加AI回复
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('发送消息失败:', error);
      alert('发送消息失败，请检查API Key是否正确');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.isUser ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
              正在思考...
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 p-2 border rounded-lg"
          placeholder="输入消息..."
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          disabled={isLoading}
        >
          发送
        </button>
      </div>
    </div>
  );
} 