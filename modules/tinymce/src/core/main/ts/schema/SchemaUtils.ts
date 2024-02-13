import { Arr, Obj, Type } from '@ephox/katamari';

import Tools from '../api/util/Tools';
import { ElementRule } from './SchemaTypes';

export const split = (items: string | undefined, delim?: string): string[] => {
  items = Tools.trim(items);
  return items ? items.split(delim || ' ') : [];
};

// Converts a wildcard expression string to a regexp for example *a will become /.*a/.
export const patternToRegExp = (str: string): RegExp => new RegExp('^' + str.replace(/([?+*])/g, '.$1') + '$');

const isRegExp = (obj: any): obj is RegExp => Type.isObject(obj) && obj.source && Object.prototype.toString.call(obj) === '[object RegExp]';

export const deepCloneElementRule = (obj: ElementRule): ElementRule => {
  const helper = (value: unknown): unknown => {
    if (Type.isArray(value)) {
      return Arr.map(value, helper);
    } else if (isRegExp(value)) {
      return new RegExp(value.source, value.flags);
    } else if (Type.isObject(value)) {
      return Obj.map(value, helper);
    } else {
      return value;
    }
  };

  return helper(obj) as ElementRule;
};

