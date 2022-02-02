import { Html, SugarElement, SugarNode } from '@ephox/sugar';

import { SimpleGenerators } from 'ephox/snooker/api/Generators';

export default (): SimpleGenerators => {
  let cellCounter = 0;
  let colCounter = 0;
  let replaceCounter = 0;

  const makeElem: {
    <K extends keyof HTMLElementTagNameMap>(tag: K, content: string): SugarElement<HTMLElementTagNameMap[K]>;
    <T extends HTMLElement>(tag: string, content: string): SugarElement<T>;
  } = (tag: string, content: string) => {
    const elem = SugarElement.fromTag(tag);
    Html.set(elem, content);
    return elem;
  };

  const cell = () => {
    const r = '?_' + cellCounter;
    cellCounter++;
    return makeElem('td', r);
  };

  const col = () => {
    const r = '?_' + colCounter;
    colCounter++;
    return makeElem('col', r);
  };

  const replace = <T extends HTMLElement>(cell: SugarElement<HTMLTableCellElement>): SugarElement<T> => {
    const tag = SugarNode.name(cell);
    const r = 'h(' + tag + ')_' + replaceCounter;
    replaceCounter++;
    return makeElem(tag, r);
  };

  return {
    cell,
    gap: () => makeElem('td', '*'),
    row: () => makeElem('tr', ''),
    colgroup: () => makeElem('colgroup', ''),
    col,
    colGap: col,
    replace
  };
};
