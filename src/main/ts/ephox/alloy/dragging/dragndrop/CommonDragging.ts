import { Fun } from '@ephox/katamari';
import { Replication } from '@ephox/sugar';
import { AlloyComponent } from '../../api/component/ComponentApi';

const getImageClone = (comp: AlloyComponent) => {
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