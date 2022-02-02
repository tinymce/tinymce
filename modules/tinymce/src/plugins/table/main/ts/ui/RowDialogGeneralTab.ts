/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import { getRowClassList } from '../api/Settings';
import * as UiUtils from './UiUtils';

const getClassList = (editor: Editor): Optional<Dialog.ListBoxSpec> => {
  const classes = UiUtils.buildListItems(getRowClassList(editor));
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

const formChildren: Dialog.BodyComponentSpec[] = [
  {
    type: 'listbox',
    name: 'type',
    label: 'Row type',
    items: [
      { text: 'Header', value: 'header' },
      { text: 'Body', value: 'body' },
      { text: 'Footer', value: 'footer' }
    ]
  },
  {
    type: 'listbox',
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

const getItems = (editor: Editor): Dialog.BodyComponentSpec[] =>
  formChildren.concat(getClassList(editor).toArray());

export {
  getItems
};
