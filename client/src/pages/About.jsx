import React from "react";

export default function About() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-2">About BrahmaXplorers WeatherApp 🌍</h2>
      <p className="text-lg mb-4">
        We use NASA's open Earth data and modern forecasting APIs to help users
        predict rain and weather for outdoor events.
      </p>
      <div className="max-w-2xl mx-auto text-left">
        <h3 className="text-xl font-semibold mb-2">Features:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Real-time weather data from multiple sources</li>
          <li>Temperature, humidity, and rain chance predictions</li>
          <li>Historical weather data logging</li>
          <li>NASA Earth data integration</li>
          <li>Modern, responsive UI design</li>
        </ul>
      </div>
    </div>
  );
}
