import { TableSelection } from '@ephox/darwin';
import { Element } from '@ephox/sugar';
import { SelectionType, SelectionTypes } from './SelectionTypes';
import { getSelectionStartCellOrCaption } from './TableSelection';
import { Node } from '@ephox/dom-globals';

export interface Selections {
  get: () => SelectionType;
}

// tslint:disable-next-line:variable-name
export const Selections = (bodyElm: Element<any>, start: () => Element<Node>, selectedSelector: string) => {
  const get = () => TableSelection.retrieve(bodyElm, selectedSelector).fold(
      () => getSelectionStartCellOrCaption(start()).map(SelectionTypes.single).getOr(SelectionTypes.none()),
      (cells) => SelectionTypes.multiple(cells)
    );

  return {
    get
  };
};