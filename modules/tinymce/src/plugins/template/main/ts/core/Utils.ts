import { Arr, Obj } from '@ephox/katamari';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

const entitiesAttr: Record<string, string> = {
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '\'': '&#039;'
};

const htmlEscape = (html: string): string =>
  html.replace(/["'<>&]/g, (match) => Obj.get(entitiesAttr, match).getOr(match));

const hasAnyClasses = (dom: DOMUtils, n: Element, classes: string): boolean =>
  Arr.exists(classes.split(/\s+/), (c) => dom.hasClass(n, c));

export {
  hasAnyClasses,
  htmlEscape
};
