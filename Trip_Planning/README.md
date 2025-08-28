# EV Motorcycle Range Simulator - Technical Documentation

## Architecture Overview

The EV Motorcycle Range Simulator is built using React and TypeScript with a component-based architecture. The application simulates electric motorcycle journeys by generating random routes, calculating battery consumption, and visualizing the journey on an HTML Canvas.

## Core Components

### 1. App Component (`src/App.tsx`)

The main component that orchestrates the simulation logic and UI rendering. It manages the application state including:

```typescript
// Key state variables
const [simulationOutput, setSimulationOutput] = useState<string>('');
const [isLoading, setIsLoading] = useState<boolean>(false);
const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
const [isAnimating, setIsAnimating] = useState<boolean>(false);
const [followMotorcycle, setFollowMotorcycle] = useState<boolean>(true);
const [animationSpeed, setAnimationSpeed] = useState<number>(1.5);
```

### 2. MapVisualization Component (`src/components/MapVisualization.tsx`)

Handles the rendering of the route, charging stations, and motorcycle animation using HTML Canvas:

```typescript
interface MapVisualizationProps {
  simulationData: SimulationData | null;
  isAnimating: boolean;
  onAnimationComplete: () => void;
  followMotorcycle: boolean;
  animationSpeed: number;
}
```

### 3. Data Types (`src/types.ts`)

Defines the core data structures used throughout the application:

```typescript
export interface ChargingStation {
  location: [number, number];
  distance: number;
}

export interface SimulationData {
  currentSpeed: number;
  weeklyAvgSpeed: number;
  batteryPercentage: number;
  currentLocation: [number, number];
  destination: [number, number];
  directDistance: number;
  estimatedRange: number;
  chargingStations: ChargingStation[];
  nearestStation: ChargingStation;
  decision: {
    canReachDestination: boolean;
    canReachNearestStation: boolean;
    recommendedSpeed?: number;
    message: string;
  };
}
```

## Core Algorithms

### 1. Random Data Generation

The simulator generates random data for each simulation run using the `generateRandomSimulationData` function:

```typescript
const generateRandomSimulationData = (): SimulationData => {
  // Generate random coordinates in the US
  const baseLat = 37 + Math.random() * 5;
  const baseLon = -122 + Math.random() * 7;
  
  // Random parameters
  const currentSpeed = 30 + Math.random() * 50;
  const weeklyAvgSpeed = 40 + Math.random() * 20;
  const batteryPercentage = 20 + Math.random() * 70;
  
  // Current location and destination
  const currentLocation: [number, number] = [baseLat, baseLon];
  const latChange = (Math.random() * 2 - 1) * 2;
  const lonChange = (Math.random() * 2 - 1) * 2;
  const destination: [number, number] = [baseLat + latChange, baseLon + lonChange];
  
  // Calculate direct distance (simplified)
  const directDistance = calculateDistance(currentLocation, destination);
  
  // Generate charging stations
  const numStations = 3 + Math.floor(Math.random() * 5);
  const chargingStations = [];
  
  for (let i = 0; i < numStations; i++) {
    const progress = 0.1 + Math.random() * 0.8;
    const stationLat = currentLocation[0] + latChange * progress + (Math.random() * 0.2 - 0.1);
    const stationLon = currentLocation[1] + lonChange * progress + (Math.random() * 0.2 - 0.1);
    const stationLocation: [number, number] = [stationLat, stationLon];
    const distance = calculateDistance(currentLocation, stationLocation);
    
    chargingStations.push({
      location: stationLocation,
      distance
    });
  }
  
  // Sort stations by distance
  chargingStations.sort((a, b) => a.distance - b.distance);
  
  // Calculate estimated range
  const estimatedRange = calculateRange(batteryPercentage, currentSpeed, weeklyAvgSpeed);
  
  // Find nearest station
  const nearestStation = chargingStations[0];
  
  // Decision logic
  const canReachDestination = estimatedRange >= directDistance;
  const canReachNearestStation = estimatedRange >= nearestStation.distance;
  let recommendedSpeed;
  let message;
  
  // Generate decision message based on conditions
  if (canReachDestination) {
    message = `🏁 You have enough battery to reach your destination (${directDistance.toFixed(2)} km) safely.`;
  } else if (canReachNearestStation) {
    message = `✅ You can reach the nearest charging station (${nearestStation.distance.toFixed(2)} km) at your current speed.`;
  } else {
    // Calculate recommended speed
    recommendedSpeed = calculateOptimalSpeed(batteryPercentage, nearestStation.distance);
    message = `⚠️ Warning! You need to reduce speed to ${recommendedSpeed.toFixed(2)} km/h to reach the charging station safely.`;
  }
  
  return {
    currentSpeed,
    weeklyAvgSpeed,
    batteryPercentage,
    currentLocation,
    destination,
    directDistance,
    estimatedRange,
    chargingStations,
    nearestStation,
    decision: {
      canReachDestination,
      canReachNearestStation,
      recommendedSpeed,
      message
    }
  };
};
```

### 2. Distance Calculation

The simulator uses a simplified distance calculation for determining distances between coordinates:

```typescript
function calculateDistance(point1: [number, number], point2: [number, number]): number {
  // Simple distance calculation (not accurate for long distances on Earth)
  const latDiff = point2[0] - point1[0];
  const lonDiff = point2[1] - point1[1];
  // Convert to km (very rough approximation)
  return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111;
}
```

This is a simplified Euclidean distance calculation that approximates kilometers by multiplying by 111 (the approximate number of kilometers per degree of latitude/longitude near the equator).

### 3. Range Estimation

Battery range is calculated based on battery percentage, current speed, and historical average speed:

```typescript
function calculateRange(batteryPercentage: number, speed: number, baseSpeed: number): number {
  const totalRange = 200; // km at 100% battery
  const remainingRange = (batteryPercentage / 100) * totalRange;
  const speedFactor = 1 + (Math.max(speed - baseSpeed, 0) / 100);
  return remainingRange / speedFactor;
}
```

This algorithm:
- Assumes a maximum range of 200km at 100% battery
- Calculates remaining range based on current battery percentage
- Applies a speed penalty factor when current speed exceeds the historical average

### 4. Optimal Speed Calculation

When the motorcycle cannot reach the nearest charging station at current speed, the simulator calculates an optimal speed:

```typescript
function calculateOptimalSpeed(batteryPercentage: number, distance: number): number {
  // Simple calculation for optimal speed
  const optimalSpeed = (batteryPercentage / distance) * 50;
  return Math.max(10, Math.min(optimalSpeed, 80)); // Between 10 and 80 km/h
}
```

This function:
- Calculates a speed that would allow reaching the charging station
- Constrains the result between 10 and 80 km/h for practicality

## Canvas Rendering

The map visualization uses HTML Canvas for rendering the route, charging stations, and animated motorcycle:

```typescript
// Function to convert lat/lon to canvas coordinates
const toCanvasCoords = (lat: number, lon: number) => {
  const x = ((lon - minLon) / (maxLon - minLon)) * canvas.width;
  const y = canvas.height - ((lat - minLat) / (maxLat - minLat)) * canvas.height;
  return [x, y];
};

// Draw the direct path
const [startX, startY] = toCanvasCoords(currentLocation[0], currentLocation[1]);
const [endX, endY] = toCanvasCoords(destination[0], destination[1]);

ctx.beginPath();
ctx.moveTo(startX, startY);
ctx.lineTo(endX, endY);
ctx.strokeStyle = '#3B82F6'; // Blue
ctx.lineWidth = 2;
ctx.setLineDash([5, 3]);
ctx.stroke();
ctx.setLineDash([]);
```

## Animation System

The animation system uses `requestAnimationFrame` for smooth rendering of the motorcycle journey:

```typescript
useEffect(() => {
  if (!isAnimating || !simulationData) {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    return;
  }
  
  let startTime: number | null = null;
  const duration = 5000 / animationSpeed; // Faster animation with higher animationSpeed
  
  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const newProgress = Math.min(elapsed / duration, 1);
    
    setProgress(newProgress);
    
    if (newProgress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      onAnimationComplete();
    }
  };
  
  setProgress(0);
  animationRef.current = requestAnimationFrame(animate);
  
  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };
}, [isAnimating, simulationData, onAnimationComplete, animationSpeed]);
```

Key features:
- Uses `requestAnimationFrame` for smooth animation
- Calculates progress based on elapsed time and animation speed
- Properly cleans up animation frames when component unmounts or animation stops

## Route Highlighting

When the motorcycle cannot reach the destination directly, the simulator highlights the path to the nearest charging station:

```typescript
// Highlight path to nearest charging station if needed
if (!decision.canReachDestination && decision.canReachNearestStation) {
  const [nearestX, nearestY] = toCanvasCoords(
    simulationData.nearestStation.location[0], 
    simulationData.nearestStation.location[1]
  );
  
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(nearestX, nearestY);
  ctx.strokeStyle = '#10B981'; // Green
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Add "Recommended" label
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 12px Arial';
  const midX = (startX + nearestX) / 2;
  const midY = (startY + nearestY) / 2;
  ctx.fillText('Recommended Route', midX, midY - 10);
}
```

## Animation Speed Control

The animation speed is controlled through a slider input:

```typescript
{/* Animation Speed Control */}
<div className="mb-6">
  <label htmlFor="speed-slider" className="block text-sm font-medium text-gray-700 mb-2">
    Animation Speed: {animationSpeed.toFixed(1)}x
  </label>
  <input
    type="range"
    id="speed-slider"
    min="0.5"
    max="3"
    step="0.1"
    value={animationSpeed}
    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
  />
</div>
```

The animation speed value is then used to adjust the animation duration:

```typescript
const duration = 5000 / animationSpeed; // Faster animation with higher animationSpeed
```

## Performance Considerations

1. **Canvas Rendering**: Using Canvas instead of DOM elements for visualization improves performance when animating multiple elements.

2. **Animation Optimization**: The animation system uses `requestAnimationFrame` for smooth rendering and properly cancels animation frames to prevent memory leaks.

3. **Conditional Rendering**: Components are conditionally rendered based on application state to minimize unnecessary DOM updates.

## Future Enhancements

1. **Real-world Map Integration**: Replace the simplified canvas with a real map library like Leaflet or Google Maps.

2. **More Accurate Distance Calculation**: Implement the Haversine formula for more accurate Earth distance calculations.

3. **Battery Consumption Model**: Develop a more sophisticated battery consumption model that accounts for terrain, wind, and temperature.

4. **User-defined Parameters**: Allow users to input their own motorcycle specifications and starting conditions.

5. **Route Planning**: Add the ability to plan multi-stop journeys with optimized charging stops.

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   └── MapVisualization.tsx
│   ├── types.ts          # TypeScript type definitions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── README.md             # Project documentation
```