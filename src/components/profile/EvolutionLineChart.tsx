import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

import type { EvolutionPoint } from '../../utils/profileAnalytics';

type EvolutionLineChartProps = {
  points: EvolutionPoint[];
  bestMinutes: number;
  growthLabel: string;
  growthPositive?: boolean;
};

const CHART_HEIGHT = 190;
const PLOT_PADDING_TOP = 18;
const PLOT_PADDING_BOTTOM = 12;
const POINT_RADIUS = 6;
const STROKE_WIDTH = 4;

function getVisibleLabelIndices(total: number, maxLabels: number) {
  if (total <= maxLabels) {
    return Array.from({ length: total }, (_, index) => index);
  }

  const indices = new Set<number>([0, total - 1]);
  const innerSlots = maxLabels - 2;

  for (let slot = 1; slot <= innerSlots; slot += 1) {
    indices.add(Math.round((slot / (innerSlots + 1)) * (total - 1)));
  }

  return [...indices].sort((a, b) => a - b);
}

export default function EvolutionLineChart({
  points,
  bestMinutes,
  growthLabel,
  growthPositive = false,
}: EvolutionLineChartProps) {
  const [chartWidth, setChartWidth] = useState(0);

  const plotWidth = Math.max(chartWidth, 0);
  const plotHeight = CHART_HEIGHT - PLOT_PADDING_TOP - PLOT_PADDING_BOTTOM;
  const horizontalMargin = POINT_RADIUS + STROKE_WIDTH;

  const { linePath, areaPath, plottedPoints, labelIndices } = useMemo(() => {
    if (points.length === 0 || plotWidth <= 0) {
      return {
        linePath: '',
        areaPath: '',
        plottedPoints: [],
        labelIndices: [] as number[],
      };
    }

    const maxValue = Math.max(...points.map((point) => point.minutes), 1);
    const innerWidth = Math.max(plotWidth - horizontalMargin * 2, 1);
    const stepX =
      points.length > 1 ? innerWidth / (points.length - 1) : 0;

    const plotted = points.map((point, index) => {
      const x = horizontalMargin + stepX * index;
      const ratio = point.minutes / maxValue;
      const y =
        PLOT_PADDING_TOP +
        (1 - ratio) * Math.max(plotHeight - POINT_RADIUS * 2, 1) +
        POINT_RADIUS;

      return {
        x: Number.isFinite(x) ? x : horizontalMargin,
        y: Number.isFinite(y) ? y : PLOT_PADDING_TOP + plotHeight,
        point,
      };
    });

    const line = plotted
      .map((item, index) => `${index === 0 ? 'M' : 'L'} ${item.x} ${item.y}`)
      .join(' ');

    const lastX = plotted[plotted.length - 1]?.x ?? horizontalMargin;
    const baseY = PLOT_PADDING_TOP + plotHeight;
    const area = `${line} L ${lastX} ${baseY} L ${plotted[0]?.x ?? horizontalMargin} ${baseY} Z`;

    const maxLabels = points.length <= 7 ? points.length : 5;

    return {
      linePath: line,
      areaPath: area,
      plottedPoints: plotted,
      labelIndices: getVisibleLabelIndices(points.length, maxLabels),
    };
  }, [horizontalMargin, plotHeight, plotWidth, points]);

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

      <View
        style={styles.chartClip}
        onLayout={(event) => {
          const nextWidth = Math.floor(event.nativeEvent.layout.width);

          if (nextWidth > 0 && nextWidth !== chartWidth) {
            setChartWidth(nextWidth);
          }
        }}
      >
        {plotWidth > 0 ? (
          <Svg width={plotWidth} height={CHART_HEIGHT}>
            <Defs>
              <LinearGradient id="evolutionAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.28" />
                <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
              </LinearGradient>
              <ClipPath id="evolutionPlotClip">
                <Rect
                  x={0}
                  y={PLOT_PADDING_TOP}
                  width={plotWidth}
                  height={plotHeight}
                />
              </ClipPath>
            </Defs>

            <G clipPath="url(#evolutionPlotClip)">
              <Path d={areaPath} fill="url(#evolutionAreaGradient)" />
              <Path
                d={linePath}
                stroke={colors.progress}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </G>

            {plottedPoints.map((item) => (
              <Circle
                key={item.point.key}
                cx={item.x}
                cy={item.y}
                r={POINT_RADIUS}
                fill={colors.background}
                stroke={colors.progress}
                strokeWidth={3}
              />
            ))}
          </Svg>
        ) : null}
      </View>

      <View style={styles.labelsRow}>
        {points.map((point, index) => {
          const shouldShowLabel = labelIndices.includes(index);

          return (
            <Text
              key={point.key}
              style={[
                styles.axisLabel,
                !shouldShowLabel && styles.axisLabelHidden,
              ]}
              numberOfLines={1}
            >
              {shouldShowLabel ? point.label : ' '}
            </Text>
          );
        })}
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
    overflow: 'hidden',
  },

  chartTitle: {
    color: colors.text.secondary,
    fontSize: 11,
    marginBottom: spacing.sm,
  },

  chartClip: {
    width: '100%',
    height: CHART_HEIGHT,
    overflow: 'hidden',
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

  axisLabelHidden: {
    opacity: 0,
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
