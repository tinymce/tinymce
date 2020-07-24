import { Option } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { AlloyComponent } from './ComponentApi';

const toElem = (component: AlloyComponent): SugarElement => component.element();

const getByUid = (component: AlloyComponent, uid: string): Option<AlloyComponent> => component.getSystem().getByUid(uid).toOption();

export {
  toElem,
  getByUid
};
