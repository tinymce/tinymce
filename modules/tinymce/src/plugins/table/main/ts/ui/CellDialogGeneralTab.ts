/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import { getCellClassList } from '../api/Settings';
import * as Helpers from './Helpers';

const getClassList = (editor: Editor): Optional<Dialog.ListBoxSpec> => {
  const classes = Helpers.buildListItems(getCellClassList(editor));
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
    items: [
      { text: 'None', value: '' },
      { text: 'Top', value: 'top' },
      { text: 'Middle', value: 'middle' },
      { text: 'Bottom', value: 'bottom' }
    ]
  }
];

const getItems = (editor: Editor): Dialog.BodyComponentSpec[] => children.concat(getClassList(editor).toArray());

export {
  getItems
};
