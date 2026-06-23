import { useMemo } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { colors } from '../../constants/colors';
import { layout, spacing } from '../../constants/spacing';

import type { EvolutionPoint } from '../../utils/profileAnalytics';

type EvolutionLineChartProps = {
  points: EvolutionPoint[];
  bestMinutes: number;
  growthLabel: string;
  growthPositive?: boolean;
};

export default function EvolutionLineChart({
  points,
  bestMinutes,
  growthLabel,
  growthPositive = false,
}: EvolutionLineChartProps) {
  const { width } = useWindowDimensions();
  const maxChartWidth =
    Platform.OS === 'web'
      ? layout.webMaxWidth - spacing.screenHorizontal * 2
      : width - spacing.screenHorizontal * 2;
  const chartWidth = Math.min(maxChartWidth, 420);
  const chartHeight = 190;
  const padding = 22;

  const { linePath, areaPath, plottedPoints } = useMemo(() => {
    if (points.length === 0) {
      return { linePath: '', areaPath: '', plottedPoints: [] };
    }

    const maxValue = Math.max(...points.map((point) => point.minutes), 1);
    const stepX =
      points.length > 1
        ? (chartWidth - padding * 2) / (points.length - 1)
        : 0;

    const plotted = points.map((point, index) => {
      const x = padding + stepX * index;
      const y =
        chartHeight -
        padding -
        (point.minutes / maxValue) * (chartHeight - padding * 2);

      return { x, y, point };
    });

    const line = plotted
      .map((item, index) => `${index === 0 ? 'M' : 'L'} ${item.x} ${item.y}`)
      .join(' ');

    const area = `${line} L ${plotted[plotted.length - 1]?.x ?? padding} ${
      chartHeight - padding
    } L ${padding} ${chartHeight - padding} Z`;

    return {
      linePath: line,
      areaPath: area,
      plottedPoints: plotted,
    };
  }, [chartHeight, chartWidth, padding, points]);

  if (points.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Conclua algumas sessões para visualizar sua evolução.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>Minutos estudados ao longo do período</Text>

      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.12" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <Path d={areaPath} fill="url(#areaGradient)" />
        <Path
          d={linePath}
          stroke={colors.progress}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {plottedPoints.map((item) => (
          <Circle
            key={item.point.key}
            cx={item.x}
            cy={item.y}
            r={6}
            fill={colors.background}
            stroke={colors.progress}
            strokeWidth={3}
          />
        ))}
      </Svg>

      <View style={styles.labelsRow}>
        {points.map((point) => (
          <Text key={point.key} style={styles.axisLabel} numberOfLines={1}>
            {point.label}
          </Text>
        ))}
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>MELHOR RESULTADO</Text>
          <Text style={styles.summaryValue}>{bestMinutes} min</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>CRESCIMENTO</Text>
          <Text
            style={[
              styles.summaryValue,
              growthPositive && styles.summaryPositive,
            ]}
          >
            {growthLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },

  chartTitle: {
    color: colors.text.secondary,
    fontSize: 11,
    marginBottom: spacing.sm,
  },

  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },

  axisLabel: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: 10,
    textAlign: 'center',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },

  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },

  summaryLabel: {
    color: colors.text.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  summaryValue: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },

  summaryPositive: {
    color: colors.success,
  },

  divider: {
    width: 1,
    height: 42,
    backgroundColor: colors.border.default,
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
