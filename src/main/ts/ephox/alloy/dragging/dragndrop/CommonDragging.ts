import { Fun } from '@ephox/katamari';
import { Replication } from '@ephox/sugar';

const getImageClone = (comp) => {
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