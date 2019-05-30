import { Element, Html, Replication } from '@ephox/sugar';

const getHtml = function (element: Element): string {
  const clone = Replication.shallow(element);
  return Html.getOuter(clone);
};

export {
  getHtml
};