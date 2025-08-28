import { Arr } from '@ephox/katamari';
import { Attribute, Class, OnNode, SelectorFilter, SugarElement } from '@ephox/sugar';

import { Ephemera } from './Ephemera';

export interface SelectionAnnotation {
  clearBeforeUpdate: (container: SugarElement<Node>) => void;
  clear: (container: SugarElement<Node>) => void;
  selectRange: (container: SugarElement<Node>, cells: SugarElement<HTMLTableCellElement>[], start: SugarElement<HTMLTableCellElement>, finish: SugarElement<HTMLTableCellElement>) => void;
  selectedSelector: string;
  firstSelectedSelector: string;
  lastSelectedSelector: string;
}

const byClass = (ephemera: Ephemera): SelectionAnnotation => {
  const addSelectionClass = OnNode.addClass(ephemera.selected);
  const removeSelectionClasses = OnNode.removeClasses([ ephemera.selected, ephemera.lastSelected, ephemera.firstSelected ]);

  const clear = (container: SugarElement<Node>) => {
    const sels = SelectorFilter.descendants(container, ephemera.selectedSelector);
    Arr.each(sels, removeSelectionClasses);
  };

  const selectRange = (container: SugarElement<Node>, cells: SugarElement<HTMLTableCellElement>[], start: SugarElement<HTMLTableCellElement>, finish: SugarElement<HTMLTableCellElement>) => {
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

const byAttr = (ephemera: Ephemera, onSelection: (cells: SugarElement<HTMLTableCellElement>[], start: SugarElement<HTMLTableCellElement>, finish: SugarElement<HTMLTableCellElement>) => void, onClear: () => void): SelectionAnnotation => {
  const removeSelectionAttributes = (element: SugarElement<HTMLTableCellElement>) => {
    Attribute.remove(element, ephemera.selected);
    Attribute.remove(element, ephemera.firstSelected);
    Attribute.remove(element, ephemera.lastSelected);
  };

  const addSelectionAttribute = (element: SugarElement<HTMLTableCellElement>) => {
    Attribute.set(element, ephemera.selected, '1');
  };

  const clear = (container: SugarElement<Node>) => {
    clearBeforeUpdate(container);
    onClear();
  };

  const clearBeforeUpdate = (container: SugarElement<Node>) => {
    const sels = SelectorFilter.descendants<HTMLTableCellElement>(container, `${ephemera.selectedSelector},${ephemera.firstSelectedSelector},${ephemera.lastSelectedSelector}`);
    Arr.each(sels, removeSelectionAttributes);
  };

  const selectRange = (container: SugarElement<Node>, cells: SugarElement<HTMLTableCellElement>[], start: SugarElement<HTMLTableCellElement>, finish: SugarElement<HTMLTableCellElement>) => {
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
