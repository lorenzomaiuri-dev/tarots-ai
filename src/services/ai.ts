import { AIModelConfig } from '../types/ai';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

export const generateInterpretation = async (
  messages: ChatMessage[],
  config: AIModelConfig
): Promise<string> => {
  
  if (!config.apiKey) {
    throw new Error('Missing API key in settings');
  }

  try {
    const response = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'HTTP-Referer': 'https://github.com/lorenzomaiuri-dev/tarots-ai',
        'X-Title': 'Tarots AI',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.modelId,
        messages: messages,
        temperature: 0.7, // Not too creative
        // TODO: FROM CONFIG
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`AI Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // OpenRouter / OpenAI standard response structure
    return data.choices?.[0]?.message?.content || '';
    
  } catch (error) {
    console.error('AI Generation Failed:', error);
    throw error;
  }
};