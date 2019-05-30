/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { getCellClassList } from '../api/Settings';
import Helpers from './Helpers';
import { Option } from '@ephox/katamari';
import { Types } from '@ephox/bridge';

const getClassList = (editor: Editor) => {
  const rowClassList = getCellClassList(editor);

  const classes: Types.SelectBox.ExternalSelectBoxItem[] = Helpers.buildListItems(
    rowClassList,
    (item) => {
      if (item.value) {
        item.textStyle = () => {
          return editor.formatter.getCssText({ block: 'tr', classes: [item.value] });
        };
      }
    }
  );

  if (rowClassList.length > 0) {
    return Option.some<Types.Dialog.BodyComponentApi>({
      name: 'class',
      type: 'selectbox',
      label: 'Class',
      items: classes
    });
  }
  return Option.none<Types.Dialog.BodyComponentApi>();
};

const children: Types.Dialog.BodyComponentApi[] = [
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
    type: 'selectbox',
    label: 'Cell type',
    items: [
      { text: 'Cell', value: 'td' },
      { text: 'Header cell', value: 'th' }
    ]
  },
  {
    name: 'scope',
    type: 'selectbox',
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
    type: 'selectbox',
    label: 'H Align',
    items: [
      { text: 'None', value: '' },
      { text: 'Left', value: 'left' },
      { text: 'Center', value: 'center' },
      { text: 'Right', value: 'right' }
    ]
  },
  {
    name: 'valign',
    type: 'selectbox',
    label: 'V Align',
    items: [
      { text: 'None', value: '' },
      { text: 'Top', value: 'top' },
      { text: 'Middle', value: 'middle' },
      { text: 'Bottom', value: 'bottom' }
    ]
  }
];

const getItems = (editor: Editor): Types.Dialog.BodyComponentApi[] => {

  return getClassList(editor).fold(
    () => children,
    (classlist) => children.concat(classlist)
  );

};

export default {
  getItems
};