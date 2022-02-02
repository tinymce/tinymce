import { Arr, Result } from '@ephox/katamari';

const sortKeys = <T extends Record<string, any>, K extends keyof T>(label: string, keyName: K, array: T[], order: string[]): Result<T[], Error[]> => {
  try {
    const sorted = Arr.sort(array, (a, b) => {
      const aKey: string = a[keyName];
      const bKey: string = b[keyName];
      const aIndex = order.indexOf(aKey);
      const bIndex = order.indexOf(bKey);
      if (aIndex === -1) {
        throw new Error('The ordering for ' + label + ' does not have an entry for ' + aKey +
          '.\nOrder specified: ' + JSON.stringify(order, null, 2));
      }
      if (bIndex === -1) {
        throw new Error('The ordering for ' + label + ' does not have an entry for ' + bKey +
          '.\nOrder specified: ' + JSON.stringify(order, null, 2));
      }
      if (aIndex < bIndex) {
        return -1;
      } else if (bIndex < aIndex) {
        return 1;
      } else {
        return 0;
      }
    });
    return Result.value(sorted);
  } catch (err) {
    return Result.error([ err as Error ]);
  }
};

export {
  sortKeys
};
