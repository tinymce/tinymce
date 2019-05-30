import * as Arr from '../api/Arr';
import * as Type from '../api/Type';

export const sort = function <T> (arr: T[]) {
  return arr.slice(0).sort();
};

export const reqMessage = function (required: string[], keys: string[]) {
  throw new Error('All required keys (' + sort(required).join(', ') + ') were not specified. Specified keys were: ' + sort(keys).join(', ') + '.');
};

export const unsuppMessage = function (unsupported: string[]) {
  throw new Error('Unsupported keys for object: ' + sort(unsupported).join(', '));
};

export const validateStrArr = function (label: string, array: any) {
  if (!Type.isArray(array)) throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
  Arr.each(array, function (a) {
    if (!Type.isString(a)) throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
  });
};

export const invalidTypeMessage = function (incorrect: string[], type: string) {
  throw new Error('All values need to be of type: ' + type + '. Keys (' + sort(incorrect).join(', ') + ') were not.');
};

export const checkDupes = function (everything: string[]) {
  const sorted = sort(everything);
  const dupe = Arr.find(sorted, function (s, i) {
    return i < sorted.length -1 && s === sorted[i + 1];
  });

  dupe.each(function (d) {
    throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
  });
};
