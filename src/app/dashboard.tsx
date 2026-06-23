import { Redirect } from 'expo-router';

import { ROUTES } from '../constants/routes';

export default function DashboardScreen() {
  return <Redirect href={ROUTES.tabsAtividade} />;
}
