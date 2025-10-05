import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { getCurrentNASAWeather, getHistoricalNASAWeather } from "./utils/fetchPowerAPI.js";
import { fetchOpenMeteoHistorical } from "./utils/fetchOpenMeteoHistory.js";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "BrahmaXplorers WeatherApp API is running!" });
});

// Weather API endpoint with NASA POWER integration
app.get("/api/weather", async (req, res) => {
  const { city, lat, lon } = req.query;

  if (!city) {
    return res.status(400).json({ error: "City parameter is required" });
  }

  // Default to Pune if nothing is provided; use given numbers when present
  let latitude = 18.5204;
  let longitude = 73.8567;
  if (lat) {
    latitude = Number(lat);
  }
  if (lon) {
    longitude = Number(lon);
  }

  try {
    let weatherData;
    let dataSource = 'Fallback';

    // NASA first
    try {
      const nasa = await getCurrentNASAWeather(latitude, longitude);
      weatherData = {
        location: city,
        temp: Math.round(nasa.temperature),
        humidity: Math.round(nasa.humidity),
        rainChance: Math.round(nasa.rainChance),
        windSpeed: Math.round(nasa.windSpeed),
        source: 'NASA POWER',
        date: nasa.date
      };
      dataSource = 'NASA POWER';
    } catch (_) {
      // Open‑Meteo fallback
      const { data } = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,precipitation_probability&current_weather=true`
      );
      const temp = data.current_weather?.temperature;
      const humidity = data.hourly?.relativehumidity_2m?.[0] ?? 70;
      const rainChance = data.hourly?.precipitation_probability?.[0] ?? Math.floor(Math.random() * 100);
      weatherData = {
        location: city,
        temp: Math.round(temp),
        humidity: Math.round(humidity),
        rainChance: Math.round(rainChance),
        windSpeed: Math.floor(Math.random() * 20) + 5,
        source: 'Open-Meteo',
        date: new Date().toISOString().split('T')[0]
      };
      dataSource = 'Open-Meteo';
    }

    // Store in database
    await prisma.weatherQuery.create({
      data: { 
        location: city.toLowerCase(), 
        date: new Date(),
        temperature: weatherData.temp, 
        humidity: weatherData.humidity, 
        windSpeed: weatherData.windSpeed || Math.floor(Math.random() * 20) + 5
      },
    });

    res.json(weatherData);

  } catch (error) {
    console.error("❌ All weather APIs failed:", error.message);
    
    // Final fallback data
    const fallbackData = {
      location: city,
      temp: Math.floor(Math.random() * 30) + 10, // 10-40°C
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      rainChance: Math.floor(Math.random() * 100), // 0-100%
      windSpeed: Math.floor(Math.random() * 20) + 5,
      source: 'Fallback',
      date: new Date().toISOString().split('T')[0]
    };

    // Still try to log fallback data
    try {
      await prisma.weatherQuery.create({
        data: { 
          location: city.toLowerCase(), 
          date: new Date(),
          temperature: fallbackData.temp, 
          humidity: fallbackData.humidity, 
          windSpeed: fallbackData.windSpeed
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
    }

    res.json(fallbackData);
  }
});

// Get weather history endpoint
app.get("/api/weather/history", async (req, res) => {
  try {
    const { location, limit = 10 } = req.query;
    
    const whereClause = location ? { location: location.toLowerCase() } : {};
    
    const history = await prisma.weatherQuery.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    res.json(history);
  } catch (error) {
    console.error("Error fetching weather history:", error);
    res.status(500).json({ error: "Failed to fetch weather history" });
  }
});

// NASA POWER historical data endpoint
app.get("/api/weather/nasa/historical", async (req, res) => {
  const { lat, lon, startDate, endDate } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  // Default to last 30 days if no dates provided
  const end = endDate || new Date().toISOString().slice(0, 10);
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  try {
    console.log(`🌍 Fetching NASA historical data for ${lat}, ${lon} from ${start} to ${end}`);
    
    const nasaData = await getHistoricalNASAWeather(
      parseFloat(lat), 
      parseFloat(lon), 
      start, 
      end
    );

    let out = nasaData;
    // Fallback to Open-Meteo archive if NASA returned zero records
    if (!nasaData.data || nasaData.data.length === 0) {
      console.warn('NASA historical returned 0 rows. Falling back to Open-Meteo archive.');
      out = await fetchOpenMeteoHistorical(parseFloat(lat), parseFloat(lon), start, end);
    }

    res.json({
      success: true,
      source: out.source,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      dateRange: { start, end },
      data: out.data,
      totalRecords: out.data.length
    });

  } catch (error) {
    console.error("Error fetching NASA historical data:", error);
    res.status(500).json({ 
      error: "Failed to fetch NASA historical data", 
      message: error.message 
    });
  }
});

// NASA POWER current data endpoint
app.get("/api/weather/nasa/current", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  try {
    console.log(`🌍 Fetching NASA current weather for ${lat}, ${lon}`);
    
    const nasaData = await getCurrentNASAWeather(parseFloat(lat), parseFloat(lon));

    res.json({
      success: true,
      source: 'NASA POWER',
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      data: nasaData
    });

  } catch (error) {
    console.error("Error fetching NASA current data:", error);
    res.status(500).json({ 
      error: "Failed to fetch NASA current data", 
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ BrahmaXplorers WeatherApp server running on port ${PORT}`);
  console.log(`🌐 API available at: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/`);
});
