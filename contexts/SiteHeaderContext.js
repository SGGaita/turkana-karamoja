import { createContext, useContext } from 'react';
import { fallbackSiteHeader } from '../lib/fallback-data';

export const SiteHeaderContext = createContext(fallbackSiteHeader);

export function useSiteHeader() {
  return useContext(SiteHeaderContext);
}
