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
import { layout, spacing } from '../../constants/spacing';

type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  contentStyle?: ViewStyle;
  bottomPadding?: boolean;
  hasTabBar?: boolean;
};

export default function AppScreen({
  children,
  scroll = true,
  keyboard = false,
  contentStyle,
  bottomPadding = true,
  hasTabBar = false,
}: AppScreenProps) {
  const insets = useSafeAreaInsets();

  const bottomSpace = hasTabBar
    ? spacing.tabBarInset + insets.bottom
    : bottomPadding
      ? Math.max(insets.bottom, spacing.screenBottom)
      : insets.bottom;

  const paddingStyle = {
    paddingTop: Math.max(insets.top, spacing.screenTop),
    paddingBottom: bottomSpace,
    paddingHorizontal: spacing.screenHorizontal,
  };

  const innerContent = scroll ? (
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

  const content = (
    <View style={styles.webContainer}>{innerContent}</View>
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

  webContainer: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web'
      ? {
          maxWidth: layout.webMaxWidth,
          alignSelf: 'center',
        }
      : {}),
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
