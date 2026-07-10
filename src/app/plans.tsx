import { Redirect } from 'expo-router';

import { ROUTES } from '../constants/routes';

/** Mantido por compatibilidade — redireciona para a tela Pro atual. */
export default function PlansRedirectScreen() {
  return <Redirect href={ROUTES.pro} />;
}
