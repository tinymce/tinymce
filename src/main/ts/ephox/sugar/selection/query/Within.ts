import { Arr } from '@ephox/katamari';
import Element from '../../api/node/Element';
import Node from '../../api/node/Node';
import SelectorFilter from '../../api/search/SelectorFilter';
import Selectors from '../../api/search/Selectors';
import NativeRange from '../core/NativeRange';
import SelectionDirection from '../core/SelectionDirection';

var withinContainer = function (win, ancestor, outerRange, selector) {
  var innerRange = NativeRange.create(win);
  var self = Selectors.is(ancestor, selector) ? [ ancestor ] : [];
  var elements = self.concat(SelectorFilter.descendants(ancestor, selector));
  return Arr.filter(elements, function (elem) {
    // Mutate the selection to save creating new ranges each time
    NativeRange.selectNodeContentsUsing(innerRange, elem);
    return NativeRange.isWithin(outerRange, innerRange);
  });
};

var find = function (win, selection, selector) {
  // Reverse the selection if it is RTL when doing the comparison
  var outerRange = SelectionDirection.asLtrRange(win, selection);
  var ancestor = Element.fromDom(outerRange.commonAncestorContainer);
  // Note, this might need to change when we have to start looking for non elements.
  return Node.isElement(ancestor) ? 
    withinContainer(win, ancestor, outerRange, selector) : [];
};

export default <any> {
  find: find
};