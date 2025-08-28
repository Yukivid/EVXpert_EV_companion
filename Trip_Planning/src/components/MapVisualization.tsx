import React, { useEffect, useRef, useState } from 'react';
import { SimulationData } from '../types';

interface MapVisualizationProps {
  simulationData: SimulationData | null;
  isAnimating: boolean;
  onAnimationComplete: () => void;
  followMotorcycle: boolean;
  animationSpeed: number;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({
  simulationData,
  isAnimating,
  onAnimationComplete,
  followMotorcycle,
  animationSpeed = 1.5, // Increased default animation speed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  
  // Draw the map
  useEffect(() => {
    if (!simulationData || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { currentLocation, destination, chargingStations, decision } = simulationData;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate bounds for the map
    const points = [currentLocation, destination, ...chargingStations.map(s => s.location)];
    const minLat = Math.min(...points.map(p => p[0])) - 0.1;
    const maxLat = Math.max(...points.map(p => p[0])) + 0.1;
    const minLon = Math.min(...points.map(p => p[1])) - 0.1;
    const maxLon = Math.max(...points.map(p => p[1])) + 0.1;
    
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
    
    // Draw charging stations
    chargingStations.forEach((station, index) => {
      const [x, y] = toCanvasCoords(station.location[0], station.location[1]);
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#FBBF24'; // Yellow
      ctx.fill();
      
      // Add station number
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), x, y);
    });
    
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
    
    // Draw start point
    ctx.beginPath();
    ctx.arc(startX, startY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#10B981'; // Green
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', startX, startY);
    
    // Draw end point
    ctx.beginPath();
    ctx.arc(endX, endY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#EF4444'; // Red
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('D', endX, endY);
    
    // If animating, draw the motorcycle at current position
    if (isAnimating && progress > 0) {
      let currentX, currentY;
      
      // If we can't reach destination and need to go to charging station
      if (!decision.canReachDestination && decision.canReachNearestStation) {
        const [nearestX, nearestY] = toCanvasCoords(
          simulationData.nearestStation.location[0], 
          simulationData.nearestStation.location[1]
        );
        
        // Calculate position along the path to nearest station
        const normalizedProgress = Math.min(progress * 2, 1); // Double speed to nearest station
        currentX = startX + (nearestX - startX) * normalizedProgress;
        currentY = startY + (nearestY - startY) * normalizedProgress;
      } else {
        // Calculate position along the direct path
        currentX = startX + (endX - startX) * progress;
        currentY = startY + (endY - startY) * progress;
      }
      
      // Draw motorcycle
      ctx.beginPath();
      ctx.arc(currentX, currentY, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#8B5CF6'; // Purple
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw motorcycle icon
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏍️', currentX, currentY);
    }
    
    // Add legend
    const legendY = 20;
    let legendX = 20;
    
    // Start point
    ctx.beginPath();
    ctx.arc(legendX, legendY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#10B981';
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', legendX, legendY);
    
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Start', legendX + 15, legendY);
    
    // Destination point
    legendX += 80;
    ctx.beginPath();
    ctx.arc(legendX, legendY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#EF4444';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('D', legendX, legendY);
    
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Destination', legendX + 15, legendY);
    
    // Charging station
    legendX += 100;
    ctx.beginPath();
    ctx.arc(legendX, legendY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24';
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1', legendX, legendY);
    
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Charging Station', legendX + 15, legendY);
    
    // Motorcycle
    if (isAnimating) {
      legendX += 130;
      ctx.beginPath();
      ctx.arc(legendX, legendY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#8B5CF6';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏍️', legendX, legendY);
      
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Motorcycle', legendX + 15, legendY);
    }
  }, [simulationData, progress]);
  
  // Handle animation
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
  
  // Center the map on the motorcycle if followMotorcycle is true
  useEffect(() => {
    if (!canvasRef.current || !simulationData || !isAnimating || !followMotorcycle) return;
    
    const canvas = canvasRef.current;
    canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [progress, followMotorcycle, isAnimating, simulationData]);
  
  if (!simulationData) {
    return (
      <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
        <p className="text-gray-500">Run a simulation to see the map visualization</p>
      </div>
    );
  }
  
  return (
    <div className="relative border border-gray-300 rounded-lg overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={500} 
        className="w-full h-auto bg-gray-50"
      />
      {isAnimating && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full shadow-md">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium">
              {Math.round(progress * 100)}% Complete
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapVisualization;