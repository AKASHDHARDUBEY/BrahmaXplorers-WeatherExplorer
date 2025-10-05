# 🌦️ BrahmaXplorers WeatherApp

A modern weather application built with React frontend and Express.js backend, featuring NASA Earth data integration and real-time weather forecasting.

## 🚀 Features

- **Real-time Weather Data**: Get current temperature, humidity, and rain predictions
- **NASA Earth Data Integration**: Leverage NASA's open Earth data APIs
- **Historical Weather Logging**: Store and retrieve weather history using Prisma ORM
- **Modern UI**: Clean, responsive design with React and CSS
- **RESTful API**: Express.js backend with proper error handling
- **Database Integration**: MySQL database with Prisma ORM

## 🏗️ Project Structure

```
BrahmaXplorers-WeatherApp/
│
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── WeatherCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── About.jsx
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── api.js
│   │   └── index.js
│   ├── package.json
│
├── server/                     # Express Backend
│   ├── prisma/
│   │   └── schema.prisma
│   ├── server.js
│   ├── .env
│   ├── package.json
│
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with utility classes

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **MySQL** - Database (configurable)
- **CORS** - Cross-origin resource sharing

### APIs
- **Open-Meteo API** - Weather data
- **NASA Earth Data** - Earth observation data (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MySQL database (or use SQLite for development)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd BrahmaXplorers-WeatherExplorer
```

### 2. Backend Setup (API)

```bash
cd server

# Install dependencies
npm install

# Create .env with your values (example)
# DATABASE_URL="mysql://root:password@localhost:3306/weatherapp"
# PORT=3002

# Generate Prisma client
npx prisma generate

# Initialize database
npx prisma migrate dev --name init

# Start the server
node server.js
```

Backend runs on `http://localhost:3002`

Optional: DB viewer
```bash
cd server
npx prisma studio
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start the development server
PORT=3001 npm start
```

Frontend runs on `http://localhost:3001`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/weatherapp"

# Server
PORT=5000

# NASA API (optional)
NASA_API_KEY=your_nasa_api_key_here
```

### Database Setup

1. **MySQL**: Update the `DATABASE_URL` in `.env`
2. **SQLite**: Change provider to `"sqlite"` in `prisma/schema.prisma`
3. **PostgreSQL**: Change provider to `"postgresql"` in `prisma/schema.prisma`

## 📡 API Endpoints

### Weather API
- `GET /api/weather?city=<city_name>` - Get current weather for a city
- `GET /api/weather/history?city=<city_name>&limit=<number>` - Get weather history

### Health Check
- `GET /` - API health check

## 🎨 Frontend Components

### Pages
- **Home** (`/`) - Main weather search interface
- **About** (`/about`) - Project information and features

### Components
- **Navbar** - Navigation header with routing
- **WeatherCard** - Display weather information
- **API Client** - Axios configuration for backend communication

## 🗄️ Database Schema

```prisma
model WeatherLog {
  id          Int      @id @default(autoincrement())
  city        String
  temperature Float
  humidity    Float
  rainChance  Float
  createdAt   DateTime @default(now())
}
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the React app: `npm run build`
2. Deploy the `build/` folder to your hosting service
3. Update API base URL in production

### Backend (Render/Railway)
1. Set environment variables in your hosting platform
2. Deploy the `server/` directory
3. Run database migrations: `npx prisma migrate deploy`

### Database (PlanetScale/Railway)
1. Create a MySQL database
2. Update `DATABASE_URL` in your backend environment
3. Run migrations to create tables

## 🧪 Testing

### Manual Testing
1. Start both frontend and backend servers
2. Open `http://localhost:3000`
3. Enter a city name and click "Get Weather"
4. Verify weather data is displayed and logged

### API Testing
```bash
# Test weather endpoint
curl "http://localhost:5000/api/weather?city=Pune"

# Test health check
curl "http://localhost:5000/"
```

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Weather alerts and notifications
- [ ] Interactive weather maps
- [ ] Historical weather analytics
- [ ] Mobile app (React Native)
- [ ] Real-time weather updates
- [ ] Multiple weather data sources
- [ ] Weather forecasting models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**BrahmaXplorers** - Building innovative solutions with modern technology

## 🙏 Acknowledgments

- NASA for providing open Earth data APIs
- Open-Meteo for reliable weather data
- React and Express.js communities
- Prisma for excellent database tooling

---

**Happy Weather Tracking! 🌤️**
