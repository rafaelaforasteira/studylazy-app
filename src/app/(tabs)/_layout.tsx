import { Tabs } from 'expo-router';

import CustomTabBar, {
  type CustomTabBarProps,
} from '../../components/navigation/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={({ state, navigation }) => (
        <CustomTabBar
          state={state}
          navigation={navigation as CustomTabBarProps['navigation']}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="atividade" options={{ title: 'Atividade' }} />
      <Tabs.Screen name="plano" options={{ title: 'Plano' }} />
      <Tabs.Screen name="estudar" options={{ title: 'Estudar' }} />
      <Tabs.Screen name="revisar" options={{ title: 'Revisar' }} />
      <Tabs.Screen name="voce" options={{ title: 'Você' }} />
    </Tabs>
  );
}
