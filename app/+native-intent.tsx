import { parseAuthLink } from '@/utils/authLinks';

/**
 * Auth email links (?code=… or #error=…) are handled by AuthLinkHandler,
 * which owns that navigation. Keep expo-router from also routing to them:
 * on a warm start it pushed a second index (then a second tabs) onto the
 * stack. Cold start begins at '/' as usual; the handler takes it from there.
 */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }): string {
  if (!parseAuthLink(path)) return path;
  return initial ? '/' : ''; // '' = don't navigate (linking only acts on a truthy href)
}
