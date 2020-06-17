import { TableSelection } from '@ephox/darwin';
import { Element } from '@ephox/sugar';
import { SelectionTypes } from './SelectionTypes';

export interface Selections {
  get: () => SelectionTypes;
}

// tslint:disable-next-line:variable-name
export const Selections = (editor: any, selectedSelector: string) => {
  const get = function () {
    const body = Element.fromDom(editor.getBody());

    return TableSelection.retrieve(body, selectedSelector).fold(function () {
      if (editor.selection.getStart() === undefined) {
        return SelectionTypes.none();
      } else {
        return SelectionTypes.single(editor.selection);
      }
    }, function (cells) {
      return SelectionTypes.multiple(cells);
    });
  };

  return {
    get
  };
};