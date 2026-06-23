import { useMemo } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Line, Polygon, Text as SvgText } from 'react-native-svg';

import { colors } from '../../constants/colors';
import { layout, spacing } from '../../constants/spacing';

import type { SubjectPerformance } from '../../utils/profileAnalytics';

type PerformanceRadarChartProps = {
  performance: SubjectPerformance[];
};

export default function PerformanceRadarChart({
  performance,
}: PerformanceRadarChartProps) {
  const { width } = useWindowDimensions();
  const maxSize =
    Platform.OS === 'web'
      ? layout.webMaxWidth - spacing.screenHorizontal * 2
      : width - spacing.screenHorizontal * 2;
  const size = Math.min(maxSize, 320);
  const center = size / 2;
  const radius = size * 0.3;
  const levels = 4;

  const { polygonPoints, labelPositions } = useMemo(() => {
    const count = performance.length;
    const angleStep = (Math.PI * 2) / count;

    const dataPoints = performance.map((item, index) => {
      const angle = -Math.PI / 2 + angleStep * index;
      const value = item.hasData ? item.accuracy / 100 : 0;
      const distance = radius * value;

      return {
        x: center + Math.cos(angle) * distance,
        y: center + Math.sin(angle) * distance,
        labelX: center + Math.cos(angle) * (radius + 28),
        labelY: center + Math.sin(angle) * (radius + 28),
        item,
      };
    });

    return {
      polygonPoints: dataPoints.map((point) => `${point.x},${point.y}`).join(' '),
      labelPositions: dataPoints,
    };
  }, [center, performance, radius]);

  const gridPolygons = useMemo(() => {
    const count = performance.length;
    const angleStep = (Math.PI * 2) / count;

    return Array.from({ length: levels }, (_, levelIndex) => {
      const levelRadius = (radius / levels) * (levelIndex + 1);

      const points = Array.from({ length: count }, (_, index) => {
        const angle = -Math.PI / 2 + angleStep * index;
        const x = center + Math.cos(angle) * levelRadius;
        const y = center + Math.sin(angle) * levelRadius;
        return `${x},${y}`;
      }).join(' ');

      return points;
    });
  }, [center, levels, performance.length, radius]);

  const hasAnyData = performance.some((item) => item.hasData);

  if (!hasAnyData) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Continue estudando para visualizar seu desempenho por matéria.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

        {labelPositions.map((point, index) => (
          <Line
            key={`axis-${index}`}
            x1={center}
            y1={center}
            x2={center + Math.cos(-Math.PI / 2 + ((Math.PI * 2) / performance.length) * index) * radius}
            y2={center + Math.sin(-Math.PI / 2 + ((Math.PI * 2) / performance.length) * index) * radius}
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

        {labelPositions.map((point) => (
          <SvgText
            key={point.item.subject}
            x={point.labelX}
            y={point.labelY}
            fill={colors.text.secondary}
            fontSize="10"
            fontWeight="600"
            textAnchor="middle"
          >
            {point.item.subject.split(' ')[0]}
          </SvgText>
        ))}
      </Svg>

      <View style={styles.legend}>
        {performance.map((item) => (
          <View key={item.subject} style={styles.legendItem}>
            <Text style={styles.legendSubject}>{item.subject}</Text>
            <Text style={styles.legendValue}>
              {item.hasData ? `${item.accuracy}%` : 'Sem dados'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  legend: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.xs,
  },

  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  legendSubject: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },

  legendValue: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '800',
  },

  empty: {
    paddingVertical: spacing.lg,
  },

  emptyText: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
