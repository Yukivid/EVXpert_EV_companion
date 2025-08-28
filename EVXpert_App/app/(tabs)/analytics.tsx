import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { VictoryPie, VictoryLine, VictoryChart, VictoryAxis, VictoryTheme, VictoryBar } from 'victory-native';
import { Battery, Zap, Calendar, Clock, ChartBar as BarChart3, TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Sample data
const weeklyRideData = [
  { day: 'Mon', distance: 12.4 },
  { day: 'Tue', distance: 8.7 },
  { day: 'Wed', distance: 15.2 },
  { day: 'Thu', distance: 6.8 },
  { day: 'Fri', distance: 10.5 },
  { day: 'Sat', distance: 18.3 },
  { day: 'Sun', distance: 14.1 },
];

const batteryUsageData = [
  { x: '8am', y: 100 },
  { x: '10am', y: 92 },
  { x: '12pm', y: 78 },
  { x: '2pm', y: 65 },
  { x: '4pm', y: 51 },
  { x: '6pm', y: 38 },
  { x: '8pm', y: 22 },
];

const speedDistributionData = [
  { x: '0-10', y: 15 },
  { x: '10-20', y: 35 },
  { x: '20-30', y: 30 },
  { x: '30-40', y: 15 },
  { x: '40+', y: 5 },
];

const energyUsageData = [
  { name: 'Motor', value: 68, color: '#3498db' },
  { name: 'Lights', value: 12, color: '#f39c12' },
  { name: 'Display', value: 8, color: '#2ecc71' },
  { name: 'Other', value: 12, color: '#9b59b6' },
];

export default function AnalyticsScreen() {
  const [timeRange, setTimeRange] = useState('week');
  
  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeSelector}>
      <TouchableOpacity
        style={[styles.timeRangeButton, timeRange === 'day' && styles.timeRangeButtonActive]}
        onPress={() => setTimeRange('day')}
      >
        <Text style={[styles.timeRangeText, timeRange === 'day' && styles.timeRangeTextActive]}>Day</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.timeRangeButton, timeRange === 'week' && styles.timeRangeButtonActive]}
        onPress={() => setTimeRange('week')}
      >
        <Text style={[styles.timeRangeText, timeRange === 'week' && styles.timeRangeTextActive]}>Week</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.timeRangeButton, timeRange === 'month' && styles.timeRangeButtonActive]}
        onPress={() => setTimeRange('month')}
      >
        <Text style={[styles.timeRangeText, timeRange === 'month' && styles.timeRangeTextActive]}>Month</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header with time range selector */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <BarChart3 size={24} color="#ffffff" />
          <Text style={styles.headerText}>Ride Analytics</Text>
        </View>
        {renderTimeRangeSelector()}
      </View>
      
      {/* Ride Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Distance</Text>
          <Text style={styles.summaryValue}>86.0 km</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Avg. Speed</Text>
          <Text style={styles.summaryValue}>22.4 km/h</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Rides</Text>
          <Text style={styles.summaryValue}>12</Text>
        </View>
      </View>
      
      {/* Weekly Distance Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <TrendingUp size={20} color="#ffffff" />
          <Text style={styles.chartTitle}>Weekly Distance</Text>
        </View>
        <VictoryChart
          width={width - 40}
          height={220}
          theme={VictoryTheme.material}
          domainPadding={{ x: 20 }}
          padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
        >
          <VictoryAxis
            tickFormat={(t) => t}
            style={{
              axis: { stroke: '#95a5a7' },
              tickLabels: { fill: '#95a5a7', fontSize: 10 },
              grid: { stroke: 'transparent' },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t}km`}
            style={{
              axis: { stroke: '#95a5a7' },
              tickLabels: { fill: '#95a5a7', fontSize: 10 },
              grid: { stroke: 'rgba(149, 165, 166, 0.2)' },
            }}
          />
          <VictoryBar
            data={weeklyRideData}
            x="day"
            y="distance"
            style={{
              data: {
                fill: ({ datum }) => (datum.day === 'Sat' ? '#3498db' : '#2980b9'),
                width: 20,
              },
            }}
            animate={{
              duration: 500,
              onLoad: { duration: 500 },
            }}
          />
        </VictoryChart>
      </View>
      
      {/* Battery Usage Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Battery size={20} color="#ffffff" />
          <Text style={styles.chartTitle}>Battery Discharge</Text>
        </View>
        <VictoryChart
          width={width - 40}
          height={220}
          theme={VictoryTheme.material}
          padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
        >
          <VictoryAxis
            tickFormat={(t) => t}
            style={{
              axis: { stroke: '#95a5a7' },
              tickLabels: { fill: '#95a5a7', fontSize: 10 },
              grid: { stroke: 'transparent' },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t}%`}
            style={{
              axis: { stroke: '#95a5a7' },
              tickLabels: { fill: '#95a5a7', fontSize: 10 },
              grid: { stroke: 'rgba(149, 165, 166, 0.2)' },
            }}
          />
          <VictoryLine
            data={batteryUsageData}
            style={{
              data: { stroke: '#2ecc71', strokeWidth: 3 },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 1000 },
            }}
          />
        </VictoryChart>
      </View>
      
      {/* Energy Usage Breakdown */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Zap size={20} color="#ffffff" />
          <Text style={styles.chartTitle}>Energy Usage</Text>
        </View>
        <View style={styles.pieChartContainer}>
          <VictoryPie
            data={energyUsageData}
            x="name"
            y="value"
            width={width - 40}
            height={220}
            colorScale={energyUsageData.map(d => d.color)}
            innerRadius={70}
            labelRadius={({ innerRadius }) => innerRadius + 30}
            style={{
              labels: { fill: 'white', fontSize: 12, fontWeight: 'bold' },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 1000 },
            }}
          />
          <View style={styles.pieChartCenter}>
            <Text style={styles.pieChartCenterValue}>1.8 kWh</Text>
            <Text style={styles.pieChartCenterLabel}>Total</Text>
          </View>
        </View>
        <View style={styles.legendContainer}>
          {energyUsageData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.name} ({item.value}%)</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Speed Distribution */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Clock size={20} color="#ffffff" />
          <Text style={styles.chartTitle}>Speed Distribution (km/h)</Text>
        </View>
        <VictoryChart
          width={width - 40}
          height={220}
          theme={VictoryTheme.material}
          domainPadding={{ x: 20 }}
          padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
        >
          <VictoryAxis
            tickFormat={(t) => t}
            style={{
              axis: { stroke: '#95a5a7' },
              tickLabels: { fill: '#95a5a7', fontSize: 10 },
              grid: { stroke: 'transparent' },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t}%`}
            style={{
              axis: { stroke: '#95a5a7' },
              tickLabels: { fill: '#95a5a7', fontSize: 10 },
              grid: { stroke: 'rgba(149, 165, 166, 0.2)' },
            }}
          />
          <VictoryBar
            data={speedDistributionData}
            style={{
              data: {
                fill: '#e74c3c',
                width: 25,
              },
            }}
            animate={{
              duration: 500,
              onLoad: { duration: 500 },
            }}
          />
        </VictoryChart>
      </View>
      
      {/* Ride History */}
      <View style={styles.historyCard}>
        <View style={styles.chartHeader}>
          <Calendar size={20} color="#ffffff" />
          <Text style={styles.chartTitle}>Recent Rides</Text>
        </View>
        <View style={styles.historyList}>
          {[
            { date: 'Today, 5:30 PM', distance: '8.4 km', duration: '32 min', batteryUsed: '22%' },
            { date: 'Yesterday, 8:15 AM', distance: '12.7 km', duration: '45 min', batteryUsed: '31%' },
            { date: 'Jun 12, 6:20 PM', distance: '5.2 km', duration: '18 min', batteryUsed: '14%' },
            { date: 'Jun 10, 7:45 AM', distance: '15.8 km', duration: '58 min', batteryUsed: '42%' },
          ].map((ride, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyItemHeader}>
                <Text style={styles.historyItemDate}>{ride.date}</Text>
                <Text style={styles.historyItemDistance}>{ride.distance}</Text>
              </View>
              <View style={styles.historyItemDetails}>
                <Text style={styles.historyItemDetail}>Duration: {ride.duration}</Text>
                <Text style={styles.historyItemDetail}>Battery: {ride.batteryUsed}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      
      {/* Bottom padding */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1e272e',
    borderRadius: 8,
    overflow: 'hidden',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#3498db',
  },
  timeRangeText: {
    color: '#95a5a7',
    fontSize: 14,
  },
  timeRangeTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#1e272e',
    borderRadius: 8,
    padding: 12,
    width: '31%',
    alignItems: 'center',
  },
  summaryTitle: {
    color: '#95a5a7',
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartCard: {
    backgroundColor: '#1e272e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  pieChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartCenterValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pieChartCenterLabel: {
    color: '#95a5a7',
    fontSize: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#ffffff',
    fontSize: 12,
  },
  historyCard: {
    backgroundColor: '#1e272e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  historyList: {
    marginTop: 8,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(149, 165, 166, 0.2)',
    paddingVertical: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyItemDate: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  historyItemDistance: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyItemDetail: {
    color: '#95a5a7',
    fontSize: 12,
  },
});