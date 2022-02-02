import { Arr } from '@ephox/katamari';

import { SugarElement } from '../../api/node/SugarElement';
import * as Node from '../../api/node/SugarNode';
import * as SelectorFilter from '../../api/search/SelectorFilter';
import * as Selectors from '../../api/search/Selectors';
import { SimSelection } from '../../api/selection/SimSelection';
import * as NativeRange from '../core/NativeRange';
import * as SelectionDirection from '../core/SelectionDirection';

const withinContainer = <T extends Element>(win: Window, ancestor: SugarElement<Element>, outerRange: Range, selector: string): SugarElement<T>[] => {
  const innerRange = NativeRange.create(win);
  const self = Selectors.is<T>(ancestor, selector) ? [ ancestor ] : [];
  const elements = self.concat(SelectorFilter.descendants<T>(ancestor, selector));
  return Arr.filter(elements, (elem) => {
    // Mutate the selection to save creating new ranges each time
    NativeRange.selectNodeContentsUsing(innerRange, elem);
    return NativeRange.isWithin(outerRange, innerRange);
  });
};

const find = <T extends Element>(win: Window, selection: SimSelection, selector: string): SugarElement<T>[] => {
  // Reverse the selection if it is RTL when doing the comparison
  const outerRange = SelectionDirection.asLtrRange(win, selection);
  const ancestor = SugarElement.fromDom(outerRange.commonAncestorContainer);
  // Note, this might need to change when we have to start looking for non elements.
  return Node.isElement(ancestor) ?
    withinContainer(win, ancestor, outerRange, selector) : [];
};

export {
  find
};
