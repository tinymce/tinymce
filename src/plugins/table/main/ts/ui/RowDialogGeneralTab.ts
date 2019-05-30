/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { getRowClassList } from '../api/Settings';
import Helpers from './Helpers';
import { Option } from '@ephox/katamari';
import { Types } from '@ephox/bridge';

const getClassList = (editor: Editor) => {
  const rowClassList = getRowClassList(editor);

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

const formChildren: Types.Dialog.BodyComponentApi[] = [
  {
    type: 'selectbox',
    name: 'type',
    label: 'Row type',
    items: [
      { text: 'Header', value: 'thead' },
      { text: 'Body', value: 'tbody' },
      { text: 'Footer', value: 'tfoot' }
    ]
  },
  {
    type: 'selectbox',
    name: 'align',
    label: 'Alignment',
    items: [
      { text: 'None', value: '' },
      { text: 'Left', value: 'left' },
      { text: 'Center', value: 'center' },
      { text: 'Right', value: 'right' }
    ]
  },
  {
    label: 'Height',
    name: 'height',
    type: 'input'
  },
];

const getItems = (editor: Editor) => {
  return getClassList(editor).fold(
    () => formChildren,
    (classes) => formChildren.concat(classes)
  );
};

export default {
  getItems
};