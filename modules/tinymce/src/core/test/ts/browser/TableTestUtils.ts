import { Cursors } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Attribute, SelectorFilter } from '@ephox/sugar';
import { TinyDom } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const selectCells = (editor: Editor, tablePath: number[], cells: [number, number][]): void => {
  const path = Cursors.calculate(TinyDom.body(editor), Cursors.path({
    startPath: tablePath,
    soffset: 0,
    finishPath: tablePath,
    foffset: 0
  }));

  const rows = SelectorFilter.descendants(path.start, 'tr');
  Arr.each(cells, (cellPos: [number, number]) => {
    const tableCells = SelectorFilter.descendants(rows[cellPos[1]], 'td, th');
    Attribute.set(tableCells[cellPos[0]], 'data-mce-selected', '1');
  });
};

export {
  selectCells
};
