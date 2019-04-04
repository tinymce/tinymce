import { Fun } from '@ephox/katamari';
import { Replication, Element } from '@ephox/sugar';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface DragnDropImageClone {
  element: () => Element;
  x: () => number;
  y: () => number;
}

const getImageClone = (comp: AlloyComponent): DragnDropImageClone => {
  return {
    element () {
      return Replication.deep(comp.element());
    },
    x: Fun.constant(0),
    y: Fun.constant(0)
  };
};

export {
  getImageClone
};