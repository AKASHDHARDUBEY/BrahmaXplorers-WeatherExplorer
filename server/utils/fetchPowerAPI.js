import axios from 'axios';

/**
 * Fetch weather data from NASA POWER API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} start - Start date in YYYYMMDD format
 * @param {string} end - End date in YYYYMMDD format
 * @param {string} temporal - Temporal resolution (DAILY, MONTHLY, CLIMATOLOGY)
 * @param {string} community - Community (SB for agriculture, RE for renewable energy)
 * @returns {Promise<Object>} Weather data object
 */
async function fetchNASAWeather(lat, lon, start, end, temporal = 'DAILY', community = 'AG') {
  const parameters = 'PRECTOT,T2M,RH2M,WS2M'; // Precipitation, Temperature, Humidity, Wind Speed
  const makeUrl = (c) => `https://power.larc.nasa.gov/api/temporal/${temporal.toLowerCase()}/point?parameters=${parameters}&community=${c}&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON&precision=full`;
  let url = makeUrl(community);
  
  try {
    console.log(`🌍 Fetching NASA POWER data from: ${url}`);
    let response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'BrahmaXplorers-WeatherApp/1.0'
      }
    });
    
    let data = response.data?.properties?.parameter || {};

    // If empty, retry with a different community that often returns meteo vars
    if (!data || Object.keys(data).length === 0) {
      console.warn('NASA POWER returned empty parameter set for community', community, '- retrying with RE');
      url = makeUrl('RE');
      response = await axios.get(url, { timeout: 10000, headers: { 'User-Agent': 'BrahmaXplorers-WeatherApp/1.0' } });
      data = response.data?.properties?.parameter || {};
    }
    
    // Convert NASA data to our format
    const result = {
      source: 'NASA POWER',
      location: { lat, lon },
      data: []
    };
    
    // Get all available dates
    const dates = Object.keys(data.PRECTOT || {});
    
    for (let date of dates) {
      const dateObj = new Date(date);
      result.data.push({
        date: date,
        dateFormatted: dateObj.toISOString().split('T')[0],
        precipitation: data.PRECTOT[date] || 0,
        temperature: data.T2M[date] || null,
        humidity: data.RH2M[date] || null,
        // POWER WS2M is m/s; convert to km/h
        windSpeed: data.WS2M[date] != null ? Number(data.WS2M[date]) * 3.6 : null
      });
    }
    
    // Sort by date
    result.data.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    console.log(`✅ NASA POWER data fetched: ${result.data.length} records`);
    return result;
    
  } catch (error) {
    console.error('❌ NASA POWER API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error(`NASA POWER API failed: ${error.message}`);
  }
}

/**
 * Get current weather data from NASA POWER (last 7 days)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Current weather data
 */
async function getCurrentNASAWeather(lat, lon) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7); // Last 7 days
  
  const start = startDate.toISOString().slice(0, 10).replace(/-/g, '');
  const end = endDate.toISOString().slice(0, 10).replace(/-/g, '');
  
  try {
    const nasaData = await fetchNASAWeather(lat, lon, start, end);
    
    if (nasaData.data.length === 0) {
      throw new Error('No NASA data available');
    }
    
    // Get the most recent data point
    const latestData = nasaData.data[nasaData.data.length - 1];
    
    return {
      source: 'NASA POWER',
      location: { lat, lon },
      temperature: latestData.temperature,
      humidity: latestData.humidity,
      windSpeed: latestData.windSpeed,
      precipitation: latestData.precipitation,
      date: latestData.dateFormatted,
      rainChance: calculateRainChance(nasaData.data) // Calculate based on recent precipitation
    };
    
  } catch (error) {
    console.error('Error getting current NASA weather:', error);
    throw error;
  }
}

/**
 * Calculate rain chance based on recent precipitation data
 * @param {Array} data - Array of weather data points
 * @returns {number} Rain chance percentage
 */
function calculateRainChance(data) {
  if (data.length === 0) return 0;
  
  // Look at last 3 days of precipitation
  const recentDays = data.slice(-3);
  const avgPrecipitation = recentDays.reduce((sum, day) => sum + (day.precipitation || 0), 0) / recentDays.length;
  
  // Convert precipitation to rain chance (rough estimation)
  if (avgPrecipitation > 5) return 80;
  if (avgPrecipitation > 2) return 60;
  if (avgPrecipitation > 0.5) return 40;
  if (avgPrecipitation > 0.1) return 20;
  return 10;
}

/**
 * Get historical weather data for a specific date range
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Historical weather data
 */
async function getHistoricalNASAWeather(lat, lon, startDate, endDate) {
  const start = startDate.replace(/-/g, '');
  const end = endDate.replace(/-/g, '');
  
  return await fetchNASAWeather(lat, lon, start, end);
}

export { fetchNASAWeather, getCurrentNASAWeather, getHistoricalNASAWeather };
