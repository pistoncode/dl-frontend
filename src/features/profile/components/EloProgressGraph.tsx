import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import Svg, {
  Line,
  Circle,
  Polyline,
  G,
  Text as SvgText,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { theme } from '@core/theme/theme';
import type { EloProgressGraphProps } from '../types';

const { width } = Dimensions.get('window');

export const EloProgressGraph: React.FC<EloProgressGraphProps> = ({ data, onPointPress }) => {
  const graphWidth = width - 80; // Account for padding
  const graphHeight = 150;
  const padding = { top: 20, bottom: 30, left: 30, right: 30 };
  
  // Calculate graph dimensions
  const chartWidth = graphWidth - padding.left - padding.right;
  const chartHeight = graphHeight - padding.top - padding.bottom;
  
  // Find min and max ratings for scaling
  const ratings = data.map(d => d.rating);
  const minRating = Math.min(...ratings) - 50; // Add padding for better visualization
  const maxRating = Math.max(...ratings) + 50;
  
  // Scale functions
  const xScale = (index: number) => (index / (data.length - 1)) * chartWidth + padding.left;
  const yScale = (rating: number) => 
    chartHeight - ((rating - minRating) / (maxRating - minRating)) * chartHeight + padding.top;
  
  // Create points array for polyline
  const points = data
    .map((point, index) => `${xScale(index)},${yScale(point.rating)}`)
    .join(' ');
  
  return (
    <View style={styles.graphContainer}>
      <View style={{ position: 'relative' }}>
      <Svg width={graphWidth} height={graphHeight} style={styles.graph}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => {
          const y = padding.top + (chartHeight / 4) * i;
          const rating = maxRating - ((maxRating - minRating) / 4) * i;
          return (
            <G key={`grid-${i}`}>
              <Line
                x1={padding.left}
                y1={y}
                x2={graphWidth - padding.right}
                y2={y}
                stroke={theme.colors.neutral.gray[200]}
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              <SvgText
                x={padding.left - 5}
                y={y + 4}
                fontSize="10"
                fill={theme.colors.neutral.gray[500]}
                textAnchor="end"
              >
                {Math.round(rating)}
              </SvgText>
            </G>
          );
        })}
        
        {/* Line gradient definition */}
        <Defs>
          <SvgLinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FE9F4D" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#FFA366" stopOpacity="0.8" />
          </SvgLinearGradient>
        </Defs>
        
        {/* The line */}
        <Polyline
          points={points}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((point, index) => (
          <G key={`point-${index}`}>
            <Circle
              cx={xScale(index)}
              cy={yScale(point.rating)}
              r="8"
              fill={point.result === 'W' ? '#34C759' : '#FF3B30'}
              opacity="0.2"
            />
            <Circle
              cx={xScale(index)}
              cy={yScale(point.rating)}
              r="5"
              fill={point.result === 'W' ? '#34C759' : '#FF3B30'}
            />
          </G>
        ))}
        
        {/* Month labels */}
        {data.filter((_, i) => i % 2 === 0).map((point, index) => (
          <SvgText
            key={`label-${index}`}
            x={xScale(index * 2)}
            y={graphHeight - 5}
            fontSize="9"
            fill={theme.colors.neutral.gray[500]}
            textAnchor="middle"
          >
            {point.date.split(' ')[0]}
          </SvgText>
        ))}
      </Svg>
      
      {/* Clickable overlays for data points */}
      {data.map((point, index) => (
        <Pressable
          key={`press-${index}`}
          style={{
            position: 'absolute',
            left: xScale(index) - 15,
            top: yScale(point.rating) - 15,
            width: 30,
            height: 30,
            borderRadius: 15,
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPointPress(point);
          }}
        />
      ))}
      </View>
      
      {/* Legend */}
      <View style={styles.graphLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.legendText}>Win</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.legendText}>Loss</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  graphContainer: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    width: '100%',
  },
  graph: {
    backgroundColor: 'transparent',
  },
  graphLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral.gray[500],
    fontFamily: theme.typography.fontFamily.primary,
  },
});