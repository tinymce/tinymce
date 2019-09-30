/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { ImageDialogInfo } from './DialogTypes';

const makeTab = (info: ImageDialogInfo) => {
  return {
    title: 'Advanced',
    name: 'advanced',
    items: [
      {
        type: 'input',
        label: 'Style',
        name: 'style'
      },
      {
        type: 'grid',
        columns: 2,
        items: [
          {
            type: 'input',
            label: 'Vertical space',
            name: 'vspace',
            inputMode: 'numeric'
          },
          {
            type: 'input',
            label: 'Horizontal space',
            name: 'hspace',
            inputMode: 'numeric'
          },
          {
            type: 'input',
            label: 'Border width',
            name: 'border',
            inputMode: 'numeric'
          },
          {
            type: 'selectbox',
            name: 'borderstyle',
            label: 'Border style',
            items: [
              { text: 'Select...', value: '' },
              { text: 'Solid', value: 'solid' },
              { text: 'Dotted', value: 'dotted' },
              { text: 'Dashed', value: 'dashed' },
              { text: 'Double', value: 'double' },
              { text: 'Groove', value: 'groove' },
              { text: 'Ridge', value: 'ridge' },
              { text: 'Inset', value: 'inset' },
              { text: 'Outset', value: 'outset' },
              { text: 'None', value: 'none' },
              { text: 'Hidden', value: 'hidden' }
            ]
          }
        ]
      },
    ]
  };
};

export const AdvTab = {
  makeTab
};
