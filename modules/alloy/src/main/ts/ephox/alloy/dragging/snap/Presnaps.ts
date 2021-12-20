import { Optional, Type } from '@ephox/katamari';
import { Attribute, SugarElement, SugarPosition } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { SnapsConfig } from '../common/DraggingTypes';

const parseAttrToInt = (element: SugarElement<Element>, name: string): number => {
  const value = Attribute.get(element, name);
  return Type.isUndefined(value) ? NaN : parseInt(value, 10);
};

// NOTE: Moved from ego with some parameterisation
const get = <E>(component: AlloyComponent, snapsInfo: SnapsConfig<E>): Optional<SugarPosition> => {
  const element = component.element;
  const x = parseAttrToInt(element, snapsInfo.leftAttr);
  const y = parseAttrToInt(element, snapsInfo.topAttr);
  return isNaN(x) || isNaN(y) ? Optional.none() : Optional.some(
    SugarPosition(x, y)
  );
};

const set = <E>(component: AlloyComponent, snapsInfo: SnapsConfig<E>, pt: SugarPosition): void => {
  const element = component.element;
  Attribute.set(element, snapsInfo.leftAttr, pt.left + 'px');
  Attribute.set(element, snapsInfo.topAttr, pt.top + 'px');
};

const clear = <E>(component: AlloyComponent, snapsInfo: SnapsConfig<E>): void => {
  const element = component.element;
  Attribute.remove(element, snapsInfo.leftAttr);
  Attribute.remove(element, snapsInfo.topAttr);
};

export {
  get,
  set,
  clear
};
