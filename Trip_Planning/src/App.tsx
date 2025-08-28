import React, { useState, useEffect } from 'react';
import { Battery, Map, Navigation, Zap, Play, Pause, Eye, EyeOff } from 'lucide-react';
import MapVisualization from './components/MapVisualization';
import { SimulationData } from './types';

function App() {
  const [simulationOutput, setSimulationOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [followMotorcycle, setFollowMotorcycle] = useState<boolean>(true);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1.5); // Default animation speed

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

  const runSimulation = () => {
    setIsLoading(true);
    setSimulationOutput('Running simulation...');
    
    // Generate random simulation data
    const data = generateRandomSimulationData();
    setSimulationData(data);
    
    // Format the output string
    setTimeout(() => {
      const output = formatSimulationOutput(data);
      setSimulationOutput(output);
      setIsLoading(false);
    }, 1000);
  };

  const startAnimation = () => {
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-5xl">
        <div className="flex items-center mb-6">
          <Battery className="h-8 w-8 text-green-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">EV Motorcycle Range Simulator</h1>
        </div>
        
        <p className="mb-6 text-gray-600">
          This application simulates an electric motorcycle journey with randomly generated routes, 
          charging stations, and battery conditions to help analyze range and charging needs.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              <Map className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="font-semibold text-gray-700">Random Route Generation</h2>
            </div>
            <p className="text-sm text-gray-600">
              Creates random starting points, destinations, and strategically placed charging stations.
            </p>
          </div>
          
          <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              <Zap className="h-5 w-5 text-yellow-500 mr-2" />
              <h2 className="font-semibold text-gray-700">Battery Analysis</h2>
            </div>
            <p className="text-sm text-gray-600">
              Calculates if current battery and speed are sufficient to reach destination or nearest charging station.
            </p>
          </div>
          
          <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              <Navigation className="h-5 w-5 text-purple-500 mr-2" />
              <h2 className="font-semibold text-gray-700">Decision Support</h2>
            </div>
            <p className="text-sm text-gray-600">
              Provides recommendations on speed adjustments to reach charging stations safely.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <button 
            onClick={runSimulation}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-white ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors duration-200 flex items-center justify-center`}
          >
            {isLoading ? 'Simulating...' : 'Run New Simulation'}
          </button>
          
          {simulationData && !isAnimating && (
            <button 
              onClick={startAnimation}
              className="flex-1 py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
            >
              <Play className="h-5 w-5 mr-2" />
              Animate Journey
            </button>
          )}
          
          {isAnimating && (
            <button 
              onClick={() => setIsAnimating(false)}
              className="flex-1 py-3 px-4 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
            >
              <Pause className="h-5 w-5 mr-2" />
              Stop Animation
            </button>
          )}
          
          {simulationData && (
            <button 
              onClick={() => setFollowMotorcycle(!followMotorcycle)}
              className={`flex-none py-3 px-4 rounded-lg font-medium text-white ${
                followMotorcycle ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'
              } transition-colors duration-200 flex items-center justify-center`}
            >
              {followMotorcycle ? (
                <>
                  <Eye className="h-5 w-5 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <EyeOff className="h-5 w-5 mr-2" />
                  Not Following
                </>
              )}
            </button>
          )}
        </div>
        
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
        
        {/* Map Visualization */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Route Visualization</h2>
          <MapVisualization 
            simulationData={simulationData} 
            isAnimating={isAnimating}
            onAnimationComplete={handleAnimationComplete}
            followMotorcycle={followMotorcycle}
            animationSpeed={animationSpeed}
          />
        </div>
        
        {simulationOutput && (
          <div className="p-4 bg-black text-green-400 rounded-lg overflow-x-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {simulationOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function calculateDistance(point1: [number, number], point2: [number, number]): number {
  // Simple distance calculation (not accurate for long distances on Earth)
  const latDiff = point2[0] - point1[0];
  const lonDiff = point2[1] - point1[1];
  // Convert to km (very rough approximation)
  return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111;
}

function calculateRange(batteryPercentage: number, speed: number, baseSpeed: number): number {
  const totalRange = 200; // km at 100% battery
  const remainingRange = (batteryPercentage / 100) * totalRange;
  const speedFactor = 1 + (Math.max(speed - baseSpeed, 0) / 100);
  return remainingRange / speedFactor;
}

function calculateOptimalSpeed(batteryPercentage: number, distance: number): number {
  // Simple calculation for optimal speed
  const optimalSpeed = (batteryPercentage / distance) * 50;
  return Math.max(10, Math.min(optimalSpeed, 80)); // Between 10 and 80 km/h
}

function formatSimulationOutput(data: SimulationData): string {
  return `
============================================================
🏍️  EV MOTORCYCLE JOURNEY SIMULATION
============================================================

📊 SIMULATION PARAMETERS:
Current Speed: ${data.currentSpeed.toFixed(2)} km/h
Weekly Average Speed: ${data.weeklyAvgSpeed.toFixed(2)} km/h
Current Battery Percentage: ${data.batteryPercentage.toFixed(2)}%
Current Location: (${data.currentLocation[0].toFixed(4)}, ${data.currentLocation[1].toFixed(4)})
Destination: (${data.destination[0].toFixed(4)}, ${data.destination[1].toFixed(4)})

🗺️  Direct Distance to Destination: ${data.directDistance.toFixed(2)} km
🔋 Estimated Range at Current Speed: ${data.estimatedRange.toFixed(2)} km

🔋 Charging Stations & Distances:
${data.chargingStations.map((station, i) => 
  `  ${i+1}. Station at (${station.location[0].toFixed(4)}, ${station.location[1].toFixed(4)}) ➝ ${station.distance.toFixed(2)} km`
).join('\n')}

✅ Nearest Charging Station: (${data.nearestStation.location[0].toFixed(4)}, ${data.nearestStation.location[1].toFixed(4)}) (${data.nearestStation.distance.toFixed(2)} km away)

🤔 DECISION ANALYSIS:
${!data.decision.canReachDestination 
  ? `❌ Not enough battery to reach destination (${data.directDistance.toFixed(2)} km) with current settings.` 
  : `🏁 You have enough battery to reach your destination (${data.directDistance.toFixed(2)} km) safely.`}
${!data.decision.canReachDestination 
  ? (data.decision.canReachNearestStation 
    ? `✅ You can reach the nearest charging station (${data.nearestStation.distance.toFixed(2)} km) at your current speed.` 
    : `⚠️ Warning! You need to reduce speed to ${data.decision.recommendedSpeed?.toFixed(2)} km/h to reach the charging station safely.`)
  : ''}

============================================================
  `;
}

export default App;