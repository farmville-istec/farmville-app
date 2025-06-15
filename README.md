# FarmVille Dashboard

A modern, intelligent agricultural management system with real-time weather monitoring, AI-powered farming suggestions, and interactive terrain management.

## Overview

FarmVille is a React-based web application designed to help farmers and agricultural professionals monitor their terrains, receive weather updates, and get AI-powered recommendations for optimal farming practices. The system provides real-time data visualization and interactive features for efficient agricultural management.

## Features

### Core Functionality
- **User Authentication**: Secure login and registration system
- **Terrain Management**: Add, edit, and delete agricultural terrains with geographic coordinates
- **Real-time Weather Data**: Live weather monitoring for each terrain location
- **AI Agricultural Suggestions**: Intelligent recommendations based on weather conditions and terrain data

### Advanced Features
- **WebSocket Integration**: Real-time updates without page refresh
- **Interactive Map**: Location picker with OpenStreetMap integration
- **Bulk Analysis**: Process multiple terrains simultaneously
- **AI Chat Assistant**: Conversational interface for agricultural advice
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **React Router** for navigation
- **Axios** for HTTP requests
- **Socket.io Client** for real-time communication
- **Leaflet** for interactive maps
- **Lucide React** for icons

### State Management
- **React Context API** for authentication state
- **Custom hooks** for WebSocket and data management
- **Local state management** with useState and useEffect

### Development Tools
- **ESLint** for code quality
- **TypeScript** for type safety
- **Vite** for fast development server

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager
- Backend API server running on port 5001

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/farmville-istec/farmville-app.git
   cd farmville-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   The application expects the backend API to be running on `http://localhost:5001`. If your backend runs on a different port, update the API_BASE_URL in:
   - `src/services/api.ts`
   - `src/hooks/useWebSocket.ts`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to `http://localhost:5173` in your web browser

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AddTerrainForm.tsx       # Form for adding new terrains
│   ├── ChatBot.tsx              # AI chat assistant
│   ├── DashboardHeader.tsx      # Main header component
│   ├── DashboardStats.tsx       # Statistics display
│   ├── LocationPicker.tsx       # Interactive map component
│   ├── QuickStart.tsx           # Onboarding component
│   ├── TerrainGrid.tsx          # Grid layout for terrains
│   ├── TerrainWidget.tsx        # Individual terrain card
│   ├── WebSocketStatus.tsx      # Real-time connection status
│   └── WebSocketTest.tsx        # Development testing tool
├── contexts/            # React Context providers
│   └── AuthContext.tsx          # Authentication state management
├── hooks/               # Custom React hooks
│   └── useWebSocket.ts          # WebSocket connection management
├── pages/               # Main application pages
│   ├── Dashboard.tsx            # Main dashboard page
│   ├── Login.tsx               # User login page
│   └── Register.tsx            # User registration page
├── services/            # API communication
│   └── api.ts                  # HTTP client and API methods
├── types/               # TypeScript type definitions
│   └── agro.ts                 # Agricultural data types
├── App.tsx             # Main application component
├── App.css             # Global styles
└── main.tsx            # Application entry point
```

## API Integration

The application communicates with a backend API that provides:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Terrain Management
- `GET /api/terrains` - Get user terrains
- `POST /api/terrains` - Create new terrain
- `GET /api/terrains/:id` - Get specific terrain
- `PUT /api/terrains/:id` - Update terrain
- `DELETE /api/terrains/:id` - Delete terrain

### Weather and Agricultural Data
- `GET /api/weather/:location` - Get weather data
- `POST /api/agro/analyze` - Get agricultural analysis
- `POST /api/agro/quick-analyze` - Quick weather analysis
- `POST /api/agro/bulk-analyze` - Bulk terrain analysis

### Real-time Communication
- WebSocket connection on port 5001
- Events: weather updates, agricultural suggestions, terrain subscriptions

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## License

This project is developed as part of the Multimedia Systems II course at ISTEC Porto.