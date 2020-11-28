import { Arr, Obj, Type } from '@ephox/katamari';

export const getAllObjects = (obj: any): Array<Object> => {
  if (Type.isObject(obj)) {
    return [ obj ].concat(Arr.bind(Obj.values(obj), getAllObjects));
  } else if (Type.isArray(obj)) {
    return Arr.bind(obj, getAllObjects);
  } else {
    return [];
  }
};
