/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { getRowClassList } from '../api/Settings';
import Helpers from './Helpers';
import { Option } from '@ephox/katamari';

const getClassList = (editor): Option<Object> => {
  const rowClassList = getRowClassList(editor);

  const classes = Helpers.buildListItems(
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
    return Option.some({
      name: 'class',
      type: 'selectbox',
      label: 'Class',
      items: classes
    });
  }
  return Option.none();
};

const formChildren: Object[] = [
  {
    type: 'selectbox',
    name: 'type',
    label: 'Row type',
    text: 'Header',
    maxWidth: null,
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
    text: 'None',
    maxWidth: null,
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

const tab = (editor) => {

  const items = getClassList(editor).fold(
    () => formChildren,
    (classes) => formChildren.concat(classes)
  );

  return {
    title: 'General',
    type: 'grid',
    columns: 2,
    items
  };
};

export default {
  tab
};