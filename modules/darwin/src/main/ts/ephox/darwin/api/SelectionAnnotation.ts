import { Arr } from '@ephox/katamari';
import { Attr, Class, OnNode, SelectorFilter, Element } from '@ephox/sugar';
import { Ephemera } from './Ephemera';

export interface SelectionAnnotation {
  clear: (container: Element) => void;
  selectRange: (container: Element, cells: Element[], start: Element, finish: Element) => void;
  selectedSelector: () => string;
  firstSelectedSelector: () => string;
  lastSelectedSelector: () => string;
}

const byClass = function (ephemera: Ephemera): SelectionAnnotation {
  const addSelectionClass = OnNode.addClass(ephemera.selected());
  const removeSelectionClasses = OnNode.removeClasses([ ephemera.selected(), ephemera.lastSelected(), ephemera.firstSelected() ]);

  const clear = function (container: Element) {
    const sels = SelectorFilter.descendants(container, ephemera.selectedSelector());
    Arr.each(sels, removeSelectionClasses);
  };

  const selectRange = function (container: Element, cells: Element[], start: Element, finish: Element) {
    clear(container);
    Arr.each(cells, addSelectionClass);
    Class.add(start, ephemera.firstSelected());
    Class.add(finish, ephemera.lastSelected());
  };

  return {
    clear,
    selectRange,
    selectedSelector: ephemera.selectedSelector,
    firstSelectedSelector: ephemera.firstSelectedSelector,
    lastSelectedSelector: ephemera.lastSelectedSelector
  };
};

const byAttr = function (ephemera: Ephemera): SelectionAnnotation {
  const removeSelectionAttributes = function (element: Element) {
    Attr.remove(element, ephemera.selected());
    Attr.remove(element, ephemera.firstSelected());
    Attr.remove(element, ephemera.lastSelected());
  };

  const addSelectionAttribute = function (element: Element) {
    Attr.set(element, ephemera.selected(), '1');
  };

  const clear = function (container: Element) {
    const sels = SelectorFilter.descendants(container, ephemera.selectedSelector());
    Arr.each(sels, removeSelectionAttributes);
  };

  const selectRange = function (container: Element, cells: Element[], start: Element, finish: Element) {
    clear(container);
    Arr.each(cells, addSelectionAttribute);
    Attr.set(start, ephemera.firstSelected(), '1');
    Attr.set(finish, ephemera.lastSelected(), '1');
  };
  return {
    clear,
    selectRange,
    selectedSelector: ephemera.selectedSelector,
    firstSelectedSelector: ephemera.firstSelectedSelector,
    lastSelectedSelector: ephemera.lastSelectedSelector
  };
};

export const SelectionAnnotation = {
  byClass,
  byAttr
};