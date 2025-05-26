import { Fun } from '@ephox/katamari';
import { Compare, SugarElement, Traverse } from '@ephox/sugar';

import Editor from '../../api/Editor';
import { getListMaxDepth } from '../../api/Options';

export const enum ListType {
  OL = 'ol',
  UL = 'ul'
}

const isList = (el: SugarElement<Node>): el is SugarElement<HTMLOListElement | HTMLUListElement> =>
  Compare.is(el, 'OL,UL');

const isListItem = (el: SugarElement<Node>): el is SugarElement<HTMLLIElement> =>
  Compare.is(el, 'LI');

const hasFirstChildList = (el: SugarElement<HTMLElement>): boolean =>
  Traverse.firstChild(el).exists(isList);

const hasLastChildList = (el: SugarElement<HTMLElement>): boolean =>
  Traverse.lastChild(el).exists(isList);

const canIncreaseDepthOfList = (editor: Editor, amount: number): boolean => {
  return getListMaxDepth(editor).fold(
    Fun.always,
    (max: number) => max > amount
  );
};

export {
  canIncreaseDepthOfList,
  hasFirstChildList,
  hasLastChildList,
  isList,
  isListItem
};
