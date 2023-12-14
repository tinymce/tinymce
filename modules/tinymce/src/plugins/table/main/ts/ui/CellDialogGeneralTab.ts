import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Options from '../api/Options';
import { verticalAlignValues } from './CellAlignValues';
import type * as Helpers from './Helpers';
import * as UiUtils from './UiUtils';

const getClassList = (editor: Editor, data: Helpers.UnionTableData): Optional<Dialog.ListBoxSpec> => {
  const classes = UiUtils.buildClassList(Options.getCellClassList(editor), data);
  if (classes.length > 0) {
    return Optional.some({
      name: 'class',
      type: 'listbox',
      label: 'Class',
      items: classes
    });
  }
  return Optional.none();
};

const children: Dialog.BodyComponentSpec[] = [
  {
    name: 'width',
    type: 'input',
    label: 'Width'
  },
  {
    name: 'height',
    type: 'input',
    label: 'Height'
  },
  {
    name: 'celltype',
    type: 'listbox',
    label: 'Cell type',
    items: [
      { text: 'Cell', value: 'td' },
      { text: 'Header cell', value: 'th' }
    ]
  },
  {
    name: 'scope',
    type: 'listbox',
    label: 'Scope',
    items: [
      { text: 'None', value: '' },
      { text: 'Row', value: 'row' },
      { text: 'Column', value: 'col' },
      { text: 'Row group', value: 'rowgroup' },
      { text: 'Column group', value: 'colgroup' }
    ]
  },
  {
    name: 'halign',
    type: 'listbox',
    label: 'Horizontal align',
    items: [
      { text: 'None', value: '' },
      { text: 'Left', value: 'left' },
      { text: 'Center', value: 'center' },
      { text: 'Right', value: 'right' }
    ]
  },
  {
    name: 'valign',
    type: 'listbox',
    label: 'Vertical align',
    items: verticalAlignValues
  }
];

const getItems = (editor: Editor, data: Helpers.UnionTableData): Dialog.BodyComponentSpec[] =>
  children.concat(getClassList(editor, data).toArray());

export {
  getItems
};
