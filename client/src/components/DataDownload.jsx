import React from "react";

export default function DataDownload({ data, location, variables }) {
  const downloadCSV = () => {
    if (!data || data.length === 0) return;

    // Create CSV headers
    const headers = ["Date", "Date_Formatted", "Location", ...variables.map(v => v.charAt(0).toUpperCase() + v.slice(1))];
    
    // Create CSV rows
    const rows = data.map(item => [
      item.date,
      item.dateFormatted,
      location,
      item.temperature || "",
      item.humidity || "",
      item.precipitation || "",
      item.windSpeed || "",
      item.airQuality || ""
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    // Add metadata
    const metadata = [
      "# NASA Earth Data Weather Analysis",
      `# Location: ${location}`,
      `# Variables: ${variables.join(", ")}`,
      `# Data Source: NASA POWER API`,
      `# Generated: ${new Date().toISOString()}`,
      `# Units: Temperature (°C), Humidity (%), Precipitation (mm), Wind Speed (km/h)`,
      ""
    ].join("\n");

    const fullCSV = metadata + csvContent;

    // Download file
    const blob = new Blob([fullCSV], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `nasa_weather_data_${location.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    if (!data || data.length === 0) return;

    const jsonData = {
      metadata: {
        title: "NASA Earth Data Weather Analysis",
        location: location,
        variables: variables,
        dataSource: "NASA POWER API",
        generated: new Date().toISOString(),
        units: {
          temperature: "°C",
          humidity: "%",
          precipitation: "mm",
          windSpeed: "km/h",
          airQuality: "AQI"
        },
        totalRecords: data.length
      },
      data: data
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `nasa_weather_data_${location.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">📊 Download Weather Data</h2>
      
      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          Download the analyzed weather data for <strong>{location}</strong>
        </p>
        <p className="text-sm text-gray-500">
          Total records: {data.length} | Variables: {variables.join(", ")}
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={downloadCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
        >
          <span>📄</span>
          <span>Download CSV</span>
        </button>
        
        <button
          onClick={downloadJSON}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>📋</span>
          <span>Download JSON</span>
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h3 className="font-medium text-sm mb-2">File Contents:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Complete weather data with metadata</li>
          <li>• Date range and location information</li>
          <li>• Data source attribution (NASA POWER API)</li>
          <li>• Units and variable descriptions</li>
          <li>• Generation timestamp</li>
        </ul>
      </div>
    </div>
  );
}
