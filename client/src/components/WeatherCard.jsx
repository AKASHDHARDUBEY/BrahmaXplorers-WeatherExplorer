import React from "react";

export default function WeatherCard({ data }) {
  if (!data) return null;

  const getSourceIcon = (source) => {
    switch (source) {
      case 'NASA POWER':
        return '🚀';
      case 'Open-Meteo':
        return '🌤️';
      case 'Fallback':
        return '⚠️';
      default:
        return '🌍';
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'NASA POWER':
        return 'bg-gradient-to-r from-blue-500 to-purple-600';
      case 'Open-Meteo':
        return 'bg-gradient-to-r from-green-500 to-blue-500';
      case 'Fallback':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="border rounded-xl p-6 shadow-lg text-center bg-white max-w-md mx-auto">
      <div className={`${getSourceColor(data.source)} text-white rounded-lg p-2 mb-4`}>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">{getSourceIcon(data.source)}</span>
          <span className="font-semibold">{data.source}</span>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{data.location}</h2>
      
      <div className="grid grid-cols-2 gap-4 text-left">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Temperature</div>
          <div className="text-xl font-bold text-blue-600">{data.temp}°C</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Humidity</div>
          <div className="text-xl font-bold text-green-600">{data.humidity}%</div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Rain Chance</div>
          <div className="text-xl font-bold text-purple-600">{data.rainChance}%</div>
        </div>
        
        {data.windSpeed && (
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Wind Speed</div>
            <div className="text-xl font-bold text-orange-600">{data.windSpeed} km/h</div>
          </div>
        )}
      </div>
      
      {data.date && (
        <div className="mt-4 text-sm text-gray-500">
          Data from: {data.date}
        </div>
      )}
    </div>
  );
}
