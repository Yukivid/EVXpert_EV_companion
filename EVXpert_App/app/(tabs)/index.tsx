import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Battery, Zap, Gauge, RotateCw } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const MAX_SPEED = 60; // km/h

export default function DashboardScreen() {
  const [speed, setSpeed] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(78);
  const [range, setRange] = useState(42);
  const [odometer, setOdometer] = useState(1243);
  const [power, setPower] = useState(1.2);
  
  const speedRotation = useSharedValue(0);
  const batteryWidth = useSharedValue(0);

  // Simulate speed changes
  useEffect(() => {
    const interval = setInterval(() => {
      const newSpeed = Math.floor(Math.random() * 15) + 20;
      setSpeed(newSpeed);
      
      // Update power based on speed
      const newPower = (newSpeed / 10) * 0.8 + 0.5;
      setPower(parseFloat(newPower.toFixed(1)));
      
      // Slightly decrease battery
      if (Math.random() > 0.7) {
        setBatteryLevel(prev => Math.max(prev - 1, 0));
        setRange(prev => Math.max(prev - 0.5, 0));
      }
      
      // Increase odometer
      setOdometer(prev => prev + (newSpeed / 3600) * 0.5);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Animate speedometer needle
  useEffect(() => {
    batteryWidth.value = withTiming(batteryLevel, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [speed, batteryLevel]);
  const batteryBarStyle = useAnimatedStyle(() => {
    return {
      width: `${batteryWidth.value}%`,
    };
  });

  const getBatteryColor = () => {
    if (batteryLevel > 50) return '#2ecc71';
    if (batteryLevel > 20) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <LinearGradient
      colors={['#121212', '#1a1a1a', '#121212']}
      style={styles.container}
    >
      {/* Speedometer */}
      <View style={styles.speedometerContainer}>
        <View style={styles.speedometer}>
          <View style={styles.speedDisplay}>
            <Text style={styles.speedValue}>{speed}</Text>
            <Text style={styles.speedUnit}>km/h</Text>
          </View>
        </View>
      </View>

      {/* Battery and Range */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Battery size={24} color="#ffffff" />
            <Text style={styles.infoTitle}>Battery</Text>
          </View>
          <View style={styles.batteryContainer}>
            <View style={styles.batteryOutline}>
              <Animated.View 
                style={[
                  styles.batteryLevel, 
                  batteryBarStyle, 
                  { backgroundColor: getBatteryColor() }
                ]} 
              />
            </View>
            <Text style={styles.batteryText}>{batteryLevel}%</Text>
          </View>
          <View style={styles.rangeInfo}>
            <Text style={styles.rangeLabel}>Range</Text>
            <Text style={styles.rangeValue}>{range} km</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Gauge size={24} color="#ffffff" />
            <Text style={styles.infoTitle}>Odometer</Text>
          </View>
          <Text style={styles.odometerValue}>{odometer.toFixed(1)} km</Text>
          
          <View style={styles.powerInfo}>
            <View style={styles.infoHeader}>
              <Zap size={20} color="#ffffff" />
              <Text style={styles.powerLabel}>Power</Text>
            </View>
            <Text style={styles.powerValue}>{power} kW</Text>
          </View>
        </View>
      </View>

      {/* Trip Info */}
      <View style={styles.tripContainer}>
        <View style={styles.tripHeader}>
          <RotateCw size={20} color="#ffffff" />
          <Text style={styles.tripTitle}>Current Trip</Text>
        </View>
        <View style={styles.tripStats}>
          <View style={styles.tripStat}>
            <Text style={styles.tripStatLabel}>Time</Text>
            <Text style={styles.tripStatValue}>32 min</Text>
          </View>
          <View style={styles.tripStat}>
            <Text style={styles.tripStatLabel}>Distance</Text>
            <Text style={styles.tripStatValue}>8.4 km</Text>
          </View>
          <View style={styles.tripStat}>
            <Text style={styles.tripStatLabel}>Avg Speed</Text>
            <Text style={styles.tripStatValue}>22 km/h</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  speedContainer: {
    alignItems: 'center',
  },
  speedValue: {
    color: '#ffffff',
    fontSize: 48, 
    fontWeight: 'bold',
    textAlign: 'center',
  },
  speedUnit: {
    color: '#bdc3c7',
    fontSize: 18,
    marginTop: -5,
    fontWeight:'bold',
    textAlign: 'center',
    paddingBottom: 35,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#1e272e',
    borderRadius: 12,
    padding: 16,
    width: '48%',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  batteryContainer: {
    marginBottom: 12,
  },
  batteryOutline: {
    height: 14,
    backgroundColor: '#2c3e50',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 4,
  },
  batteryLevel: {
    height: '100%',
  },
  batteryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  rangeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeLabel: {
    color: '#bdc3c7',
    fontSize: 14,
  },
  rangeValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  odometerValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  powerInfo: {
    marginTop: 'auto',
  },
  powerLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  powerValue: {
    color: '#3498db',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  tripContainer: {
    backgroundColor: '#1e272e',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripStat: {
    alignItems: 'center',
  },
  tripStatLabel: {
    color: '#bdc3c7',
    fontSize: 14,
    marginBottom: 4,
  },
  tripStatValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
