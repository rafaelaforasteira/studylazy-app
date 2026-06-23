import { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import type { EvolutionPoint } from '../../utils/profileAnalytics';

type EvolutionLineChartProps = {
  points: EvolutionPoint[];
  comparisonLabel: string;
  comparisonValue: string;
  totalLabel: string;
  bestLabel: string;
};

export default function EvolutionLineChart({
  points,
  comparisonLabel,
  comparisonValue,
  totalLabel,
  bestLabel,
}: EvolutionLineChartProps) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - spacing.screenHorizontal * 2, 420);
  const chartHeight = 180;
  const padding = 20;

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
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.progress} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={colors.progress} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <Path d={areaPath} fill="url(#areaGradient)" />
        <Path
          d={linePath}
          stroke={colors.progress}
          strokeWidth={3}
          fill="none"
        />

        {plottedPoints.map((item) => (
          <Circle
            key={item.point.key}
            cx={item.x}
            cy={item.y}
            r={4}
            fill={colors.progress}
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

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{totalLabel}</Text>
        <Text style={styles.meta}>{bestLabel}</Text>
      </View>

      <Text style={styles.comparison}>
        {comparisonLabel}: {comparisonValue}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },

  axisLabel: {
    flex: 1,
    color: colors.text.muted,
    fontSize: 11,
    textAlign: 'center',
  },

  metaRow: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },

  meta: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },

  comparison: {
    color: colors.primarySoft,
    ...typography.bodySmall,
    fontWeight: '700',
    marginTop: spacing.sm,
  },

  empty: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  emptyText: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
  },
});
