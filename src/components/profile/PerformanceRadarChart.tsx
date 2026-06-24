import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import {
  RADAR_SUBJECT_COLORS,
  type SubjectPerformance,
} from '../../utils/profileAnalytics';

type PerformanceRadarChartProps = {
  performance: SubjectPerformance[];
};

export default function PerformanceRadarChart({
  performance,
}: PerformanceRadarChartProps) {
  const [chartSize, setChartSize] = useState(0);
  const size = Math.max(chartSize, 0);
  const center = size / 2;
  const radius = size * 0.28;
  const labelRadius = size * 0.38;
  const levels = 4;

  const { polygonPoints, vertexPoints } = useMemo(() => {
    const count = performance.length;
    const angleStep = (Math.PI * 2) / count;

    const dataPoints = performance.map((item, index) => {
      const angle = -Math.PI / 2 + angleStep * index;
      const value = item.hasData ? item.accuracy / 100 : 0;
      const distance = radius * value;

      return {
        x: center + Math.cos(angle) * distance,
        y: center + Math.sin(angle) * distance,
        labelX: center + Math.cos(angle) * labelRadius,
        labelY: center + Math.sin(angle) * labelRadius,
        angle,
        item,
      };
    });

    return {
      polygonPoints: dataPoints.map((point) => `${point.x},${point.y}`).join(' '),
      vertexPoints: dataPoints,
    };
  }, [center, labelRadius, performance, radius]);

  const gridPolygons = useMemo(() => {
    const count = performance.length;
    const angleStep = (Math.PI * 2) / count;

    return Array.from({ length: levels }, (_, levelIndex) => {
      const levelRadius = (radius / levels) * (levelIndex + 1);

      return Array.from({ length: count }, (_, index) => {
        const angle = -Math.PI / 2 + angleStep * index;
        const x = center + Math.cos(angle) * levelRadius;
        const y = center + Math.sin(angle) * levelRadius;
        return `${x},${y}`;
      }).join(' ');
    });
  }, [center, levels, performance.length, radius]);

  return (
    <View style={styles.container}>
      <View
        style={styles.chartWrap}
        onLayout={(event) => {
          const nextSize = Math.floor(event.nativeEvent.layout.width);

          if (nextSize > 0 && nextSize !== chartSize) {
            setChartSize(nextSize);
          }
        }}
      >
        {size > 0 ? (
          <Svg width={size} height={size}>
            {gridPolygons.map((points, index) => (
              <Polygon
                key={`grid-${index}`}
                points={points}
                fill="none"
                stroke={colors.border.default}
                strokeWidth={1}
              />
            ))}

            {vertexPoints.map((point, index) => (
              <Line
                key={`axis-${index}`}
                x1={center}
                y1={center}
                x2={center + Math.cos(point.angle) * radius}
                y2={center + Math.sin(point.angle) * radius}
                stroke={colors.border.subtle}
                strokeWidth={1}
              />
            ))}

            <Polygon
              points={polygonPoints}
              fill="rgba(139, 92, 246, 0.25)"
              stroke={colors.primary}
              strokeWidth={2}
            />

            {vertexPoints.map((point) => {
              const subjectColor =
                RADAR_SUBJECT_COLORS[point.item.subject] ?? colors.primary;

              return (
                <Circle
                  key={`vertex-${point.item.subject}`}
                  cx={point.x}
                  cy={point.y}
                  r={5}
                  fill={subjectColor}
                  stroke={colors.background}
                  strokeWidth={2}
                />
              );
            })}

            {vertexPoints.map((point) => (
              <SvgText
                key={`label-${point.item.subject}`}
                x={point.labelX}
                y={point.labelY}
                fill={colors.text.secondary}
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
              >
                {point.item.subject}
              </SvgText>
            ))}
          </Svg>
        ) : null}
      </View>

      <View style={styles.legend}>
        {performance.map((item) => {
          const subjectColor =
            RADAR_SUBJECT_COLORS[item.subject] ?? colors.primary;

          return (
            <View key={item.subject} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <View
                  style={[styles.legendDot, { backgroundColor: subjectColor }]}
                />
                <Text style={styles.legendSubject}>{item.subject}</Text>
              </View>
              <Text style={styles.legendValue}>
                {item.hasData ? `${item.accuracy}%` : 'Sem dados'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },

  chartWrap: {
    width: '100%',
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  legend: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },

  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },

  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    paddingRight: spacing.sm,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendSubject: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },

  legendValue: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
});
