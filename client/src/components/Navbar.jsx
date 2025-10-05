import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">🌦️ BrahmaXplorers WeatherApp</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:text-blue-200">Home</Link>
        <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
        <Link to="/about" className="hover:text-blue-200">About</Link>
      </div>
    </nav>
  );
}
