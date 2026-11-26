
# Dhaka-city-bus-roads-finders


# Dhaka Bus Route Finder 🚌

## 1. Project Overview

Dhaka Bus Route Finder is a web-based public transportation route-finding system designed to help people travel easily across different locations in Dhaka, Bangladesh.

The system helps users find suitable bus routes between their starting point and destination. If there is no direct bus service available, the system identifies connected bus services and suggests alternative journeys with transfer points.

The project aims to make public transportation more accessible, convenient, and easier to understand through an interactive map-based interface.

## 2. Project Objectives

- Help users find available buses between two locations in Dhaka.
- Identify direct bus routes whenever available.
- Suggest connected bus services when no direct bus is available.
- Display transfer points where passengers need to change buses.
- Integrate Google Maps to visualize routes and locations.
- Provide clear journey information, including boarding points, dropping points, and bus changes.
- Improve the overall public transportation navigation experience.

## 3. Key Features

### A. Bus Route Search
- Search buses using starting and destination locations.
- Find available direct bus routes.
- Display multiple possible journey options.

### B. Connected Bus Recommendation
- Identify alternative bus combinations when direct transportation is unavailable.
- Suggest suitable transfer points.
- Display the sequence of buses required to complete a journey.
- Show boarding and dropping locations for each bus.

### C. Google Maps Integration
- Display an interactive map of Dhaka.
- Show starting and destination locations.
- Display bus stops and transfer points.
- Visualize different sections of a journey on the map.

### D. Journey Information
- Display bus names and route information.
- Show the number of required bus changes.
- Present journey details in an organized format.

## 4. Technology Stack

The project may use the following technologies:

| Component | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js |
| Programming Language | JavaScript |
| Map Integration | Google Maps Platform |
| Dataset | Bus Routes and Bus Stops Dataset |
| API Communication | REST API |
| Version Control | Git and GitHub |

*The final technology stack will be updated according to the implemented architecture.*

## 5. Project Architecture

The project follows a client-server architecture.

1. **Frontend:** Allows users to enter their starting point and destination and view journey results.
2. **Backend:** Processes requests, searches the bus dataset, and calculates suitable bus connections.
3. **Dataset:** Stores bus service information, routes, stops, and location coordinates.
4. **Google Maps:** Displays geographical locations, bus stops, and journey routes.

## 6. Journey Finding Logic

The system follows these steps:

1. Receive the user's starting point and destination.
2. Search for direct bus routes.
3. If a direct bus is available, display the result.
4. If no direct bus exists, search for connected bus routes.
5. Identify suitable transfer points.
6. Generate possible journey combinations.
7. Return the journey information to the frontend.
8. Display the selected journey on Google Maps.

## 7. Dataset Requirements

The dataset will contain relevant information about Dhaka's public bus transportation system.

Expected dataset information:

- Bus ID
- Bus Name
- Starting Point
- Ending Point
- Bus Stops
- Route Information
- Stop Latitude
- Stop Longitude

The dataset may be updated, expanded, and cleaned during development to improve route accuracy and connectivity.

## 8. Installation and Setup

### Prerequisites

- Node.js
- npm
- Git
- Google Maps API Key

### Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### Navigate to the Project Directory

```bash
cd YOUR_PROJECT_FOLDER
```

### Install Dependencies

The backend currently uses only Node.js built-in modules, so no additional package installation is required.

### Configure Environment Variables

Create an appropriate `.env` file and configure the required API keys and backend settings.

Example:

```env
GOOGLE_MAPS_API_KEY=YOUR_API_KEY
PORT=8000
```

Never commit secret API keys to GitHub.

### Run the Project


From the project root, start the backend with `npm --prefix backend start`. It listens on port `8000` by default. In a second terminal, serve the project root with `python3 -m http.server 3000`, then open `http://localhost:3000/` for the frontend. The frontend calls the backend at `http://localhost:8000/api`; visit `http://localhost:8000/api/health` to check the backend. The backend port can be changed with `PORT`, and the frontend API base can be overridden by setting `window.BUS_API_BASE` before loading `Frontend/api.js`.

## 9. Future Improvements

- More accurate and updated bus datasets.
- Improved connected bus route recommendations.
- Journey distance and estimated travel time.
- Fare estimation.
- More efficient transfer point selection.
- User location detection.
- Mobile-responsive interface.
- Real-time bus tracking, if reliable live data becomes available.

## 10. Project Scope

The primary scope of this project is to provide an intelligent bus route-finding solution for Dhaka city.

The main focus is to help passengers travel between locations even when direct bus services are unavailable by identifying suitable connected bus routes and visualizing the journey through Google Maps.

---

**Project Name:** Dhaka Bus Route Finder

**Project Type:** Web-Based Public Transportation Route Finder

**Development Status:** In Development