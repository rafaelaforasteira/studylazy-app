import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  contentStyle?: ViewStyle;
  bottomPadding?: boolean;
};

export default function AppScreen({
  children,
  scroll = true,
  keyboard = false,
  contentStyle,
  bottomPadding = true,
}: AppScreenProps) {
  const insets = useSafeAreaInsets();

  const paddingStyle = {
    paddingTop: Math.max(insets.top, spacing.screenTop),
    paddingBottom: bottomPadding
      ? Math.max(insets.bottom, spacing.screenBottom)
      : insets.bottom,
    paddingHorizontal: spacing.screenHorizontal,
  };

  const content = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, paddingStyle, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, paddingStyle, contentStyle]}>
      {children}
    </View>
  );

  if (keyboard) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  flex: {
    flex: 1,
  },

  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
  },

  staticContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
