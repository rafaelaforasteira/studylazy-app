import { Href, useRouter } from 'expo-router';

import { ROUTES } from '../constants/routes';

/** Volta com fallback seguro quando não há histórico de navegação. */
export function safeGoBack(
  router: ReturnType<typeof useRouter>,
  fallback: Href = ROUTES.tabsVoce
) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}
