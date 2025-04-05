const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

export async function sendMessageToSiliconFlow(message: string, apiKey: string) {
  try {
    const response = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct', // 可以根据需要更换模型
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
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