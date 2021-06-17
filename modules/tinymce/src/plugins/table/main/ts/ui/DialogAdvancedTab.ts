/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import { getTableBorderStyles } from '../api/Settings';

interface ClassListValue {
  title?: string;
  text?: string;
  value: string;
}

interface ClassListGroup {
  title?: string;
  text?: string;
  menu: ClassListItem[];
}

type ClassListItem = ClassListValue | ClassListGroup;

const getAdvancedTab = (editor: Editor, dialogName: 'table' | 'row' | 'cell') => {
  const advTabItems: Dialog.BodyComponentSpec[] = [
    {
      name: 'borderstyle',
      type: 'listbox',
      label: 'Border style',
      items: [
        { text: 'Select...', value: '' },
      ].concat(getTableBorderStyles(editor))
    },
    {
      name: 'bordercolor',
      type: 'colorinput',
      label: 'Border color'
    },
    {
      name: 'backgroundcolor',
      type: 'colorinput',
      label: 'Background color'
    }
  ];

  const borderWidth: Dialog.InputSpec = {
    name: 'borderwidth',
    type: 'input',
    label: 'Border width'
  };

  const items = dialogName === 'cell' ? ([ borderWidth ] as Dialog.BodyComponentSpec[]).concat(advTabItems) : advTabItems;

  return {
    title: 'Advanced',
    name: 'advanced',
    items
  };
};

export {
  getAdvancedTab
};
