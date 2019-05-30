import { Html, Replication, Element } from '@ephox/sugar';

const getHtml = (element: Element): string => {
  const clone = Replication.shallow(element);
  return Html.getOuter(clone);
};

export {
  getHtml
};