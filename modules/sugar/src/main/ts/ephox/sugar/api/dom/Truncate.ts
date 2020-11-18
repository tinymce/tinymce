import { SugarElement } from '../node/SugarElement';
import * as Html from '../properties/Html';
import * as Replication from './Replication';

const getHtml = (element: SugarElement<any>): string => {
  const clone = Replication.shallow(element);
  return Html.getOuter(clone);
};

export {
  getHtml
};
