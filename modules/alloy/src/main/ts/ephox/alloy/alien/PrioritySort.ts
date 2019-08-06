import { Result } from '@ephox/katamari';

const sortKeys = (label: string, keyName: string, array: Array<Record<string, () => string>>, order: string[]): Result<Array<Record<string, () => string>>, Error[]> => {
  const sliced = array.slice(0);
  try {
    const sorted = sliced.sort((a, b) => {
      const aKey = a[keyName]();
      const bKey = b[keyName]();
      const aIndex = order.indexOf(aKey);
      const bIndex = order.indexOf(bKey);
      if (aIndex === -1) { throw new Error('The ordering for ' + label + ' does not have an entry for ' + aKey +
        '.\nOrder specified: ' + JSON.stringify(order, null, 2));
      }
      if (bIndex === -1) { throw new Error('The ordering for ' + label + ' does not have an entry for ' + bKey +
        '.\nOrder specified: ' + JSON.stringify(order, null, 2));
      }
      if (aIndex < bIndex) { return -1; } else if (bIndex < aIndex) { return 1; } else { return 0; }
    });
    return Result.value(sorted);
  } catch (err) {
    return Result.error([ err ]);
  }
};

export {
  sortKeys
};