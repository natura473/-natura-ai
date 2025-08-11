import { OpenAI } from 'openai';
import axios from 'axios';

// Khởi tạo OpenAI
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Xử lý lệnh thời tiết
async function handleWeatherCommand(location) {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=vi`
    );
    
    const weather = response.data;
    return `🌦 Thời tiết tại ${location}:
• Nhiệt độ: ${weather.main.temp}°C
• Cảm giác như: ${weather.main.feels_like}°C
• Độ ẩm: ${weather.main.humidity}%
• Gió: ${weather.wind.speed} m/s
• Mô tả: ${weather.weather[0].description}`;
  } catch (error) {
    console.error('Weather API Error:', error);
    return `❌ Không thể lấy dữ liệu thời tiết cho "${location}". Vui lòng thử lại với tên địa điểm khác.`;
  }
}

// Xử lý lệnh dịch thuật
async function handleTranslateCommand(text, targetLang = 'vi') {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Dịch đoạn text sau sang ${targetLang} một cách tự nhiên nhất. Chỉ trả về bản dịch, không thêm ghi chú.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Translation Error:', error);
    return "❌ Lỗi dịch thuật. Vui lòng thử lại sau.";
  }
}

// Xử lý chat thông thường
async function handleNormalChat(messages) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Bạn là Natura - trợ lý AI thông minh với:
• Giọng điệu thân thiện, nhiệt tình
• Hỗ trợ tiếng Việt tự nhiên
• Có thể xử lý các lệnh đặc biệt:
  /weather [địa điểm] - Tra thời tiết
  /translate [text] - Dịch sang tiếng Việt`
        },
        ...messages
      ],
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Chat Error:', error);
    return "❌ Hiện tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau ít phút.";
  }
}

// Main handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Chỉ hỗ trợ phương thức POST' });
  }

  try {
    const { messages } = req.body;
    const latestMessage = messages[messages.length - 1]?.content || '';

    // Xử lý lệnh đặc biệt
    if (latestMessage.startsWith('/weather')) {
      const location = latestMessage.replace('/weather', '').trim();
      if (!location) {
        return res.status(400).json({ response: '⚠️ Vui lòng nhập địa điểm (VD: /weather Hà Nội)' });
      }
      const weatherReport = await handleWeatherCommand(location);
      return res.status(200).json({ response: weatherReport });
    }

    if (latestMessage.startsWith('/translate')) {
      const text = latestMessage.replace('/translate', '').trim();
      if (!text) {
        return res.status(400).json({ response: '⚠️ Vui lòng nhập nội dung cần dịch (VD: /translate Hello)' });
      }
      const translation = await handleTranslateCommand(text);
      return res.status(200).json({ response: `🌍 Bản dịch: ${translation}` });
    }

    // Xử lý chat thông thường
    const aiResponse = await handleNormalChat(messages);
    return res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      error: 'Đã xảy ra lỗi hệ thống',
      details: error.message 
    });
  }
}