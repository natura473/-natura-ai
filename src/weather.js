import axios from 'axios';

export default async function handler(req, res) {
  const { messages } = req.body;
  const location = messages[messages.length - 1].content.replace('/weather', '').trim();
  
  if (!location) {
    return res.status(400).json({ error: 'Vui lòng nhập địa điểm' });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=vi`
    );
    
    const weatherData = {
      temp: response.data.main.temp,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      wind: response.data.wind.speed
    };
    
    return res.status(200).json({
      response: `Thời tiết tại ${location}: 
      - Nhiệt độ: ${weatherData.temp}°C
      - Tình trạng: ${weatherData.description}
      - Độ ẩm: ${weatherData.humidity}%
      - Gió: ${weatherData.wind} m/s`
    });
  } catch (error) {
    return res.status(500).json({ 
      error: `Không thể lấy dữ liệu thời tiết cho ${location}` 
    });
  }
}