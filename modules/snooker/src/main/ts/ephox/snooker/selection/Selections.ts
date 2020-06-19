import { TableSelection } from '@ephox/darwin';
import { Element } from '@ephox/sugar';
import { SelectionType, SelectionTypes } from './SelectionTypes';
import { getSelectionStartCellOrCaption } from './TableSelection';
import { Node, Element as DomElement } from '@ephox/dom-globals';

export interface Selections {
  get: () => SelectionType;
}

// tslint:disable-next-line:variable-name
export const Selections = (root: Element<DomElement>, getStart: () => Element<Node>, selectedSelector: string) => {
  const get = () => TableSelection.retrieve(root, selectedSelector).fold(
    () => getSelectionStartCellOrCaption(getStart()).map(SelectionTypes.single).getOr(SelectionTypes.none()),
    (cells: Element<DomElement>[]) => SelectionTypes.multiple(cells)
  );

  return {
    get
  };
};