import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';
import { Option } from '@ephox/boulder/node_modules/@ephox/katamari';

const toElem = function (component: AlloyComponent): SugarElement {
  return component.element();
};

const getByUid = function (component: AlloyComponent, uid: any): Option<AlloyComponent> {
  return component.getSystem().getByUid(uid).toOption();
};

export {
  toElem,
  getByUid
};