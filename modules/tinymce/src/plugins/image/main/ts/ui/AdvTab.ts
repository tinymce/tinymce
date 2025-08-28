import { Dialog } from 'tinymce/core/api/ui/Ui';

import { ImageDialogInfo } from './DialogTypes';

const makeTab = (_info: ImageDialogInfo): Dialog.TabSpec => ({
  title: 'Advanced',
  name: 'advanced',
  items: [
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
          type: 'listbox',
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
    }
  ]
});

export const AdvTab = {
  makeTab
};
