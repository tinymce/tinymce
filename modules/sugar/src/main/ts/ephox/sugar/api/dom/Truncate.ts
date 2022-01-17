import { SugarElement } from '../node/SugarElement';
import * as SugarShadowDom from '../node/SugarShadowDom';
import * as Html from '../properties/Html';
import * as Replication from './Replication';

const getHtml = (element: SugarElement<Node>): string => {
  if (SugarShadowDom.isShadowRoot(element)) {
    return '#shadow-root';
  } else {
    const clone = Replication.shallow(element);
    return Html.getOuter(clone);
  }
};

export {
  getHtml
};
