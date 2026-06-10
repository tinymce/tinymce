import type { Optional } from '@ephox/katamari';
import type { SugarElement } from '@ephox/sugar';

import type { AlloyComponent } from './ComponentApi';

const toElem = (component: AlloyComponent): SugarElement<any> => component.element;

const getByUid = (component: AlloyComponent, uid: string): Optional<AlloyComponent> => component.getSystem().getByUid(uid).toOptional();

export {
  toElem,
  getByUid
};
