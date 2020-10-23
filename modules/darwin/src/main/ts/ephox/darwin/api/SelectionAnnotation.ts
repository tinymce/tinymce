import { Arr } from '@ephox/katamari';
import { Attribute, Class, OnNode, SelectorFilter, SugarElement } from '@ephox/sugar';
import { Ephemera } from './Ephemera';

export interface SelectionAnnotation {
  clearBeforeUpdate: (container: SugarElement) => void;
  clear: (container: SugarElement) => void;
  selectRange: (container: SugarElement, cells: SugarElement[], start: SugarElement, finish: SugarElement) => void;
  selectedSelector: string;
  firstSelectedSelector: string;
  lastSelectedSelector: string;
}

const byClass = function (ephemera: Ephemera): SelectionAnnotation {
  const addSelectionClass = OnNode.addClass(ephemera.selected);
  const removeSelectionClasses = OnNode.removeClasses([ ephemera.selected, ephemera.lastSelected, ephemera.firstSelected ]);

  const clear = function (container: SugarElement) {
    const sels = SelectorFilter.descendants(container, ephemera.selectedSelector);
    Arr.each(sels, removeSelectionClasses);
  };

  const selectRange = function (container: SugarElement, cells: SugarElement[], start: SugarElement, finish: SugarElement) {
    clear(container);
    Arr.each(cells, addSelectionClass);
    Class.add(start, ephemera.firstSelected);
    Class.add(finish, ephemera.lastSelected);
  };

  return {
    clearBeforeUpdate: clear,
    clear,
    selectRange,
    selectedSelector: ephemera.selectedSelector,
    firstSelectedSelector: ephemera.firstSelectedSelector,
    lastSelectedSelector: ephemera.lastSelectedSelector
  };
};

const byAttr = function (ephemera: Ephemera, onSelection: (cells: SugarElement[], start: SugarElement, finish: SugarElement) => void, onClear: () => void): SelectionAnnotation {
  const removeSelectionAttributes = function (element: SugarElement) {
    Attribute.remove(element, ephemera.selected);
    Attribute.remove(element, ephemera.firstSelected);
    Attribute.remove(element, ephemera.lastSelected);
  };

  const addSelectionAttribute = function (element: SugarElement) {
    Attribute.set(element, ephemera.selected, '1');
  };

  const clear = (container: SugarElement) => {
    clearBeforeUpdate(container);
    onClear();
  };

  const clearBeforeUpdate = (container: SugarElement) => {
    const sels = SelectorFilter.descendants(container, ephemera.selectedSelector);
    Arr.each(sels, removeSelectionAttributes);
  };

  const selectRange = function (container: SugarElement, cells: SugarElement[], start: SugarElement, finish: SugarElement) {
    clear(container);
    Arr.each(cells, addSelectionAttribute);
    Attribute.set(start, ephemera.firstSelected, '1');
    Attribute.set(finish, ephemera.lastSelected, '1');
    onSelection(cells, start, finish);
  };
  return {
    clearBeforeUpdate,
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
