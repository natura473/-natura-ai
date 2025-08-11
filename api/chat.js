import { OpenAI } from 'openai';
import weather from './commands/weather';
import translate from './commands/translate';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  const latestMessage = messages[messages.length - 1].content;
  
  // Kiểm tra các lệnh đặc biệt
  if (latestMessage.startsWith('/weather')) {
    return weather(req, res);
  }
  
  if (latestMessage.startsWith('/translate')) {
    return translate(req, res);
  }

  // Xử lý chat thông thường
  const openai = new OpenAI(process.env.OPENAI_API_KEY);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Bạn là Natura - trợ lý AI thông minh với:
          - Khả năng xử lý đa nhiệm
          - Hỗ trợ tiếng Việt tự nhiên
          - Giọng điệu thân thiện, hữu ích
          - Biết dùng các lệnh: /weather, /translate`
        },
        ...messages
      ],
      temperature: 0.7,
    });

    return res.status(200).json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}