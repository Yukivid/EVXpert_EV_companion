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