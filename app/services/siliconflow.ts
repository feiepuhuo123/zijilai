// 模型配置类型
export interface ModelConfig {
  id: string;
  name: string;
  maxTokens: number;
  temperature: number;
}

// 支持的模型列表
export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'Qwen/Qwen2.5-7B-Instruct',
    name: '通义千问 7B',
    maxTokens: 1000,
    temperature: 0.7
  },
  {
    id: 'Qwen/Qwen2.5-14B-Instruct',
    name: '通义千问 14B',
    maxTokens: 2000,
    temperature: 0.7
  },
  {
    id: 'Qwen/Qwen2.5-32B-Instruct',
    name: '通义千问 32B',
    maxTokens: 4000,
    temperature: 0.7
  }
];

const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

export async function sendMessageToSiliconFlow(
  message: string, 
  apiKey: string,
  modelId: string = AVAILABLE_MODELS[0].id
) {
  const selectedModel = AVAILABLE_MODELS.find(m => m.id === modelId) || AVAILABLE_MODELS[0];
  
  try {
    const response = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        temperature: selectedModel.temperature,
        max_tokens: selectedModel.maxTokens
      }),
    });

    if (!response.ok) {
      throw new Error('API请求失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('调用SiliconFlow API出错:', error);
    throw error;
  }
} 