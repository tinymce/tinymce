import { Arr } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import { OnNode } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';

var byClass = function (ephemera) {
  var addSelectionClass = OnNode.addClass(ephemera.selected());
  var removeSelectionClasses = OnNode.removeClasses([ ephemera.selected(), ephemera.lastSelected(), ephemera.firstSelected() ]);

  var clear = function (container) {
    var sels = SelectorFilter.descendants(container, ephemera.selectedSelector());
    Arr.each(sels, removeSelectionClasses);
  };

  var selectRange = function (container, cells, start, finish) {
    clear(container);
    Arr.each(cells, addSelectionClass);
    Class.add(start, ephemera.firstSelected());
    Class.add(finish, ephemera.lastSelected());
  };

  return {
    clear: clear,
    selectRange: selectRange,
    selectedSelector: ephemera.selectedSelector,
    firstSelectedSelector: ephemera.firstSelectedSelector,
    lastSelectedSelector: ephemera.lastSelectedSelector
  };
};

var byAttr = function (ephemera) {
  var removeSelectionAttributes = function (element) {
    Attr.remove(element, ephemera.selected());
    Attr.remove(element, ephemera.firstSelected());
    Attr.remove(element, ephemera.lastSelected());
  };

  var addSelectionAttribute = function (element) {
    Attr.set(element, ephemera.selected(), '1');
  };

  var clear = function (container) {
    var sels = SelectorFilter.descendants(container, ephemera.selectedSelector());
    Arr.each(sels, removeSelectionAttributes);
  };

  var selectRange = function (container, cells, start, finish) {
    clear(container);
    Arr.each(cells, addSelectionAttribute);
    Attr.set(start, ephemera.firstSelected(), '1');
    Attr.set(finish, ephemera.lastSelected(), '1');
  };
  return {
    clear: clear,
    selectRange: selectRange,
    selectedSelector: ephemera.selectedSelector,
    firstSelectedSelector: ephemera.firstSelectedSelector,
    lastSelectedSelector: ephemera.lastSelectedSelector
  };
};

export default <any> {
  byClass: byClass,
  byAttr: byAttr
};