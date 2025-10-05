import React from "react";

export default function ProbabilityChart({ probabilityData }) {
  if (!probabilityData) return null;

  const getBarColor = (probability) => {
    if (probability >= 70) return "bg-red-500";
    if (probability >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getRiskLevel = (probability) => {
    if (probability >= 70) return "High Risk";
    if (probability >= 40) return "Moderate Risk";
    return "Low Risk";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">📈 Probability Visualization</h2>
      
      <div className="space-y-4">
        {Object.entries(probabilityData).map(([variable, data]) => (
          <div key={variable} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{data.config.name}</h3>
              <span className="text-sm text-gray-500">
                {data.exceedanceProbability.toFixed(1)}% probability
              </span>
            </div>
            
            {/* Probability Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className={`h-4 rounded-full ${getBarColor(data.exceedanceProbability)} transition-all duration-500`}
                style={{ width: `${Math.min(data.exceedanceProbability, 100)}%` }}
              ></div>
            </div>
            
            {/* Risk Level Indicator */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Threshold: {data.threshold} {data.config.unit}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                data.exceedanceProbability >= 70 
                  ? "bg-red-100 text-red-800" 
                  : data.exceedanceProbability >= 40 
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}>
                {getRiskLevel(data.exceedanceProbability)}
              </span>
            </div>
            
            {/* Statistics */}
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Mean:</span>
                <span className="ml-2 font-medium">
                  {data.mean.toFixed(1)} {data.config.unit}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Data Points:</span>
                <span className="ml-2 font-medium">{data.values.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-6 p-3 bg-gray-50 rounded-md">
        <h4 className="font-medium text-sm mb-2">Risk Level Legend:</h4>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Low Risk (0-39%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Moderate Risk (40-69%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>High Risk (70-100%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
