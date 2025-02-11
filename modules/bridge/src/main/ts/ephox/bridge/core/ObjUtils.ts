import { Arr, Obj, Type } from '@ephox/katamari';

// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
export const getAllObjects = (obj: any): Array<Object> => {
  if (Type.isObject(obj)) {
    return [ obj ].concat(Arr.bind(Obj.values(obj), getAllObjects));
  } else if (Type.isArray(obj)) {
    return Arr.bind(obj, getAllObjects);
  } else {
    return [];
  }
};
