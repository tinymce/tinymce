import { Element, Html, Replication } from '@ephox/sugar';

const getHtml = (element: Element<any>): string => {
  const clone = Replication.shallow(element);
  return Html.getOuter(clone);
};

export {
  getHtml
};
