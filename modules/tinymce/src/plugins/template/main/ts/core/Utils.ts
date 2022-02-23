import { Obj } from '@ephox/katamari';

const entitiesAttr: Record<string, string> = {
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '\'': '&#039;'
};

const htmlEscape = (html: string): string =>
  html.replace(/["'<>&]/g, (match) => Obj.get(entitiesAttr, match).getOr(match));

export {
  htmlEscape
};
