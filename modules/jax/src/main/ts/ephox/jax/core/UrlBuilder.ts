import { Obj, Optional, Strings } from '@ephox/katamari';

export const buildUrl = (url: string, queryParams: Optional<Record<string, string>>): string => queryParams.map((query) => {
  const parts = Obj.mapToArray(query, (v, k) => encodeURIComponent(k) + '=' + encodeURIComponent(v));
  const prefix = Strings.contains(url, '?') ? '&' : '?';

  return parts.length > 0 ? url + prefix + parts.join('&') : url;
}).getOr(url);
