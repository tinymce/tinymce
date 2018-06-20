import { AlloyComponent } from '../../api/component/ComponentApi';
import { Element } from '@ephox/sugar';
import { Option } from '@ephox/katamari';

const toElem = (component: AlloyComponent): Element => {
  return component.element();
};

const getByUid = (component: AlloyComponent, uid: string): Option<AlloyComponent> => {
  return component.getSystem().getByUid(uid).toOption();
};

export {
  toElem,
  getByUid
};