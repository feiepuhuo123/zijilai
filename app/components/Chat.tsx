'use client';

import { useState } from 'react';
import { sendMessageToSiliconFlow, AVAILABLE_MODELS, ModelConfig } from '../services/siliconflow';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  role: 'designer' | 'professor' | 'user';
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(AVAILABLE_MODELS[0]);
  const [currentRole, setCurrentRole] = useState<'designer' | 'professor'>('designer');
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
      role: 'user'
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 先获取设计师的回复
      const designerResponse = await sendMessageToSiliconFlow(inputText, apiKey, selectedModel.id, 'designer');
      
      // 添加设计师回复
      const designerMessage: Message = {
        id: Date.now() + 1,
        text: designerResponse,
        isUser: false,
        role: 'designer'
      };
      setMessages((prev) => [...prev, designerMessage]);

      // 获取教授的点评
      const professorResponse = await sendMessageToSiliconFlow(
        `请点评以下室内设计师的回答：\n${designerResponse}`,
        apiKey,
        selectedModel.id,
        'professor'
      );

      // 添加教授点评
      const professorMessage: Message = {
        id: Date.now() + 2,
        text: professorResponse,
        isUser: false,
        role: 'professor'
      };
      setMessages((prev) => [...prev, professorMessage]);
    } catch (error) {
      console.error('发送消息失败:', error);
      alert('发送消息失败，请检查API Key是否正确');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-1">
            选择模型
          </label>
          <select
            id="model-select"
            value={selectedModel.id}
            onChange={(e) => {
              const model = AVAILABLE_MODELS.find(m => m.id === e.target.value);
              if (model) setSelectedModel(model);
            }}
            className="w-full p-2 border rounded-lg bg-white"
          >
            {AVAILABLE_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.isUser ? 'text-right' : 'text-left'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">
              {message.isUser ? '用户' : message.role === 'designer' ? '室内设计师' : '教授点评'}
            </div>
            <div
              className={`inline-block p-3 rounded-lg ${
                message.isUser
                  ? 'bg-blue-500 text-white'
                  : message.role === 'designer'
                  ? 'bg-green-200 text-gray-800'
                  : 'bg-purple-200 text-gray-800'
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