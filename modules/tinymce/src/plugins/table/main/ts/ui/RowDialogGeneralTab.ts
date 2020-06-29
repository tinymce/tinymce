/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { getRowClassList } from '../api/Settings';
import * as Helpers from './Helpers';

const getClassList = (editor: Editor) => {
  const classes = Helpers.buildListItems(getRowClassList(editor));
  if (classes.length > 0) {
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
      { text: 'Header', value: 'header' },
      { text: 'Body', value: 'body' },
      { text: 'Footer', value: 'footer' }
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
  }
];

const getItems = (editor: Editor) => getClassList(editor).fold(
  () => formChildren,
  (classes) => formChildren.concat(classes)
);

export {
  getItems
};
