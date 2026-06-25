import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import type { QuestionContentBlock } from '../../data/questionTypes';

type QuestionContentBlocksProps = {
  blocks: QuestionContentBlock[];
};

export default function QuestionContentBlocks({
  blocks,
}: QuestionContentBlocksProps) {
  return (
    <View style={styles.container}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === 'paragraph') {
          return (
            <Text key={key} style={styles.proseText}>
              {block.text}
            </Text>
          );
        }

        if (block.type === 'formula') {
          return (
            <Text key={key} style={styles.formulaText}>
              {block.fallbackText}
            </Text>
          );
        }

        if (block.type === 'citation') {
          return (
            <Text key={key} style={styles.citation}>
              {block.text}
            </Text>
          );
        }

        if (block.type === 'list') {
          return (
            <View key={key} style={styles.list}>
              {block.items.map((item) => (
                <Text key={`${key}-${item}`} style={styles.listItem}>
                  • {item}
                </Text>
              ))}
            </View>
          );
        }

        return (
          <View key={key} style={styles.tableWrap}>
            {block.caption ? (
              <Text style={styles.tableCaption}>{block.caption}</Text>
            ) : null}
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={styles.tableRow}>
                  {block.columns.map((column) => (
                    <Text key={`${key}-h-${column}`} style={styles.tableHeader}>
                      {column}
                    </Text>
                  ))}
                </View>
                {block.rows.map((row, rowIndex) => (
                  <View
                    key={`${key}-r-${rowIndex}`}
                    style={styles.tableRow}
                  >
                    {row.map((cell, cellIndex) => (
                      <Text
                        key={`${key}-c-${rowIndex}-${cellIndex}`}
                        style={styles.tableCell}
                      >
                        {cell}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
    gap: spacing.md,
  },
  proseText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 25,
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
  },
  formulaText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 25,
    fontFamily: 'monospace',
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
  },
  citation: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
  },
  list: {
    gap: spacing.xs,
    width: '100%',
    minWidth: 0,
  },
  listItem: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 25,
  },
  tableWrap: {
    width: '100%',
    minWidth: 0,
  },
  tableCaption: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    minWidth: 88,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surfaceSecondary,
  },
  tableCell: {
    minWidth: 88,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
});
