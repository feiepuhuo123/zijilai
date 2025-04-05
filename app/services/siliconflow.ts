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
  modelId: string = AVAILABLE_MODELS[0].id,
  role: 'designer' | 'professor' = 'designer'
) {
  const selectedModel = AVAILABLE_MODELS.find(m => m.id === modelId) || AVAILABLE_MODELS[0];
  
  const systemPrompts = {
    designer: '你是一位专业的室内设计师，专注于软装配色和空间规划。你擅长：\n1. 提供专业的色彩搭配建议\n2. 分析空间布局和功能分区\n3. 推荐适合的家具和装饰品\n4. 考虑光线、材质和风格的协调性\n5. 根据用户需求提供个性化的设计方案\n\n请用专业但易懂的语言回答用户的问题，必要时可以给出具体的色彩代码和材质建议。',
    professor: '你是一位室内设计领域的教授，擅长点评和分析室内设计师的设计方案。你擅长：\n1. 从学术角度分析设计方案的优缺点\n2. 指出设计中的创新点和不足之处\n3. 提供建设性的改进建议\n4. 结合设计理论和实践进行点评\n5. 帮助设计师提升设计水平\n\n请用专业且严谨的语言进行点评，既要肯定优点，也要指出可以改进的地方。'
  };

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
            role: 'system',
            content: systemPrompts[role]
          },
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