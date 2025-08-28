import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Navigation, Compass, MapPin, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Conditionally import MapView to avoid web compatibility issues
let MapView, Marker, Polyline, PROVIDER_GOOGLE;
if (Platform.OS !== 'web') {
  // Only import on native platforms
  const MapsModule = require('react-native-maps');
  MapView = MapsModule.default;
  Marker = MapsModule.Marker;
  Polyline = MapsModule.Polyline;
  PROVIDER_GOOGLE = MapsModule.PROVIDER_GOOGLE;
}

// Custom map style for dark mode
const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

export default function DriveScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [destination, setDestination] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    title: 'Destination',
  });
  const [distance, setDistance] = useState(0);
  const [eta, setEta] = useState('');
  const [heading, setHeading] = useState(0);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        // On web, set a mock location and show a message
        const mockLocation = {
          latitude: 37.7749,
          longitude: -122.4194,
        };
        setLocation(mockLocation);
        setRouteCoordinates([mockLocation]);
        
        // Set a simulated destination
        const simulatedDestination = {
          latitude: mockLocation.latitude + 0.01,
          longitude: mockLocation.longitude + 0.01,
          title: 'Charging Station',
        };
        setDestination(simulatedDestination);
        
        // Calculate initial distance and ETA
        calculateDistanceAndETA(mockLocation, simulatedDestination);
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get initial location
      let initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      
      const initialCoordinate = {
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
      };
      
      setLocation(initialCoordinate);
      setRouteCoordinates([initialCoordinate]);
      setHeading(initialLocation.coords.heading || 0);
      
      // Set a simulated destination
      const simulatedDestination = {
        latitude: initialLocation.coords.latitude + 0.01,
        longitude: initialLocation.coords.longitude + 0.01,
        title: 'Charging Station',
      };
      setDestination(simulatedDestination);
      
      // Calculate initial distance and ETA
      calculateDistanceAndETA(initialCoordinate, simulatedDestination);

      // Subscribe to location updates
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 10, // minimum change (in meters) to trigger update
          timeInterval: 5000,   // minimum time between updates
        },
        (newLocation) => {
          const newCoordinate = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          
          setLocation(newCoordinate);
          setHeading(newLocation.coords.heading || heading);
          setRouteCoordinates(prevCoordinates => [...prevCoordinates, newCoordinate]);
          
          // Update distance and ETA
          calculateDistanceAndETA(newCoordinate, simulatedDestination);
        }
      );

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    })();
  }, []);

  // Simulate location changes for web platform
  useEffect(() => {
    if (Platform.OS === 'web' && location) {
      const interval = setInterval(() => {
        const latOffset = (Math.random() - 0.5) * 0.0005;
        const lngOffset = (Math.random() - 0.5) * 0.0005;
        
        const newLocation = {
          latitude: location.latitude + latOffset,
          longitude: location.longitude + lngOffset,
        };
        
        setLocation(newLocation);
        setRouteCoordinates(prevCoordinates => [...prevCoordinates, newLocation]);
        
        // Update heading (direction)
        const newHeading = (heading + (Math.random() - 0.5) * 10) % 360;
        setHeading(newHeading);
        
        // Update distance and ETA
        calculateDistanceAndETA(newLocation, destination);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [location, heading, destination]);

  const calculateDistanceAndETA = (start, end) => {
    // Haversine formula to calculate distance
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(end.latitude - start.latitude);
    const dLon = deg2rad(end.longitude - start.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(start.latitude)) * Math.cos(deg2rad(end.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    
    setDistance(distance.toFixed(1));
    
    // Calculate ETA (assuming average speed of 20 km/h)
    const timeInHours = distance / 20;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    if (timeInMinutes < 60) {
      setEta(`${timeInMinutes} min`);
    } else {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes % 60;
      setEta(`${hours}h ${minutes}m`);
    }
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const centerOnUser = () => {
    if (location && mapRef.current && Platform.OS !== 'web') {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 1000);
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color="#e74c3c" />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Text style={styles.errorSubtext}>
          Location access is required for navigation features.
        </Text>
      </View>
    );
  }

  // Web fallback view
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {location ? (
          <>
            <View style={styles.webMapFallback}>
              <Text style={styles.webMapText}>
                Interactive map is available only on mobile devices
              </Text>
              <View style={styles.webMapCoordinates}>
                <Text style={styles.webCoordinateText}>
                  Current Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
                <Text style={styles.webCoordinateText}>
                  Destination: {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
            
            {/* Navigation info panel */}
            <View style={styles.navigationPanel}>
              <View style={styles.navigationHeader}>
                <Navigation size={24} color="#ffffff" />
                <Text style={styles.navigationTitle}>Navigation</Text>
              </View>
              
              <View style={styles.navigationInfo}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Distance</Text>
                  <Text style={styles.infoValue}>{distance} km</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>ETA</Text>
                  <Text style={styles.infoValue}>{eta}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Heading</Text>
                  <Text style={styles.infoValue}>{Math.round(heading)}°</Text>
                </View>
              </View>
              
              <View style={styles.destinationInfo}>
                <MapPin size={16} color="#e74c3c" />
                <Text style={styles.destinationText}>{destination.title}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading navigation data...</Text>
          </View>
        )}
      </View>
    );
  }

  // Native platforms view with map
  return (
    <View style={styles.container}>
      {location && MapView ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            customMapStyle={mapStyle}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass={false}
            rotateEnabled
            loadingEnabled
          >
            {/* User's route */}
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor="#3498db"
            />
            
            {/* Destination marker */}
            <Marker
              coordinate={destination}
              title={destination.title}
            >
              <View style={styles.markerContainer}>
                <MapPin size={24} color="#e74c3c" />
              </View>
            </Marker>
          </MapView>
          
          {/* Navigation info panel */}
          <View style={styles.navigationPanel}>
            <View style={styles.navigationHeader}>
              <Navigation size={24} color="#ffffff" />
              <Text style={styles.navigationTitle}>Navigation</Text>
            </View>
            
            <View style={styles.navigationInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Distance</Text>
                <Text style={styles.infoValue}>{distance} km</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>ETA</Text>
                <Text style={styles.infoValue}>{eta}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Heading</Text>
                <Text style={styles.infoValue}>{Math.round(heading)}°</Text>
              </View>
            </View>
            
            <View style={styles.destinationInfo}>
              <MapPin size={16} color="#e74c3c" />
              <Text style={styles.destinationText}>{destination.title}</Text>
            </View>
          </View>
          
          {/* Map controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
              <Compass size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  webMapFallback: {
    flex: 1,
    backgroundColor: '#1e272e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    marginTop: 100,
    marginBottom: 200,
  },
  webMapText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  webMapCoordinates: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  webCoordinateText: {
    color: '#bdc3c7',
    fontSize: 14,
    marginBottom: 8,
  },
  navigationPanel: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30, 39, 46, 0.9)',
    borderRadius: 12,
    padding: 16,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  navigationTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  navigationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: '#bdc3c7',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  destinationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.8)',
    padding: 8,
    borderRadius: 8,
  },
  destinationText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 8,
  },
  mapControls: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(30, 39, 46, 0.9)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#bdc3c7',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  markerContainer: {
    alignItems: 'center',
  },
});