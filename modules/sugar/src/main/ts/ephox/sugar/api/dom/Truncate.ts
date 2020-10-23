import { Html, Replication, SugarElement } from '@ephox/sugar';

const getHtml = (element: SugarElement<any>): string => {
  const clone = Replication.shallow(element);
  return Html.getOuter(clone);
};

export {
  getHtml
};
