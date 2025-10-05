import axios from 'axios';

// Fetch historical daily data from Open-Meteo and shape to NASA-like format
async function fetchOpenMeteoHistorical(lat, lon, startISO, endISO) {
  const url = `https://archive-api.open-meteo.com/v1/era5?latitude=${lat}&longitude=${lon}&start_date=${startISO}&end_date=${endISO}&daily=temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean,windspeed_10m_max&timezone=UTC`;

  const { data } = await axios.get(url, { timeout: 10000 });
  const daily = data?.daily || {};

  const dates = daily.time || [];
  const results = dates.map((dateStr, idx) => {
    const y = dateStr.replace(/-/g, '');
    return {
      date: y,
      dateFormatted: dateStr,
      precipitation: num(daily.precipitation_sum?.[idx]),
      temperature: num(daily.temperature_2m_mean?.[idx]),
      humidity: num(daily.relative_humidity_2m_mean?.[idx]),
      // convert m/s to km/h if returned differently, but API provides km/h already for daily windspeed_10m_max
      windSpeed: num(daily.windspeed_10m_max?.[idx])
    };
  });

  return {
    source: 'Open-Meteo-Archive',
    location: { lat, lon },
    data: results
  };
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export { fetchOpenMeteoHistorical };


