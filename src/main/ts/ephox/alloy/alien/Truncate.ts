import { Html, Replication } from '@ephox/sugar';
import { SugarElement } from '../api/Main';

const getHtml = (element: SugarElement): string => {
  const clone = Replication.shallow(element);
  return Html.getOuter(clone);
};

export {
  getHtml
};