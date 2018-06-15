import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarElement } from '../../alien/TypeDefinitions';
import { Option } from '@ephox/katamari';

const toElem = (component: AlloyComponent): SugarElement => {
  return component.element();
};

const getByUid = (component: AlloyComponent, uid: any): Option<AlloyComponent> => {
  return component.getSystem().getByUid(uid).toOption();
};

export {
  toElem,
  getByUid
};