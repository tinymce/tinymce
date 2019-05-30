import { Arr } from '@ephox/katamari';
import Element from '../../api/node/Element';
import * as Node from '../../api/node/Node';
import * as SelectorFilter from '../../api/search/SelectorFilter';
import * as Selectors from '../../api/search/Selectors';
import * as NativeRange from '../core/NativeRange';
import * as SelectionDirection from '../core/SelectionDirection';
import { Window } from '@ephox/dom-globals';

const withinContainer = function (win: Window, ancestor, outerRange, selector) {
  const innerRange = NativeRange.create(win);
  const self = Selectors.is(ancestor, selector) ? [ ancestor ] : [];
  const elements = self.concat(SelectorFilter.descendants(ancestor, selector));
  return Arr.filter(elements, function (elem) {
    // Mutate the selection to save creating new ranges each time
    NativeRange.selectNodeContentsUsing(innerRange, elem);
    return NativeRange.isWithin(outerRange, innerRange);
  });
};

const find = function (win: Window, selection, selector) {
  // Reverse the selection if it is RTL when doing the comparison
  const outerRange = SelectionDirection.asLtrRange(win, selection);
  const ancestor = Element.fromDom(outerRange.commonAncestorContainer);
  // Note, this might need to change when we have to start looking for non elements.
  return Node.isElement(ancestor) ?
    withinContainer(win, ancestor, outerRange, selector) : [];
};

export {
  find
};