import { Fun } from '@ephox/katamari';
import { SugarElement, TextContent } from '@ephox/sugar';

import { SimpleGenerators } from 'ephox/snooker/api/Generators';

export default (): SimpleGenerators => {
  let cellCounter = 0;
  let colCounter = 0;
  let replaceCounter = 0;

  const cell = () => {
    const r = '?_' + cellCounter;
    cellCounter++;
    return r;
  };

  const col = () => {
    const r = '?_' + colCounter;
    colCounter++;
    return r;
  };

  const replace = (elem: SugarElement<Node> | string | number) => {
    if (typeof elem === 'string' || typeof elem === 'number') {
      const r = `h(${elem})_${replaceCounter}`;
      replaceCounter++;
      return r;
    } else {
      TextContent.set(elem, `h(${TextContent.get(elem)})_${replaceCounter}`);
      replaceCounter++;
      return elem;
    }
  };

  return {
    cell,
    gap: Fun.constant('*'),
    row: Fun.constant('tr'),
    colgroup: Fun.constant('colgroup'),
    col,
    replace
  } as unknown as SimpleGenerators; // fake generator for atomic tests
};
