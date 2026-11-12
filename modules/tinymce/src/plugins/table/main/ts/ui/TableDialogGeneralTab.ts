import type Editor from 'tinymce/core/api/Editor';
import type { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Options from '../api/Options';

const getItems = (editor: Editor, classes: Dialog.ListBoxItemSpec[], insertNewTable: boolean): Dialog.BodyComponentSpec[] => {
  const rowColCountItems: Dialog.BodyComponentSpec[] = !insertNewTable ? [] : [
    {
      type: 'input',
      name: 'cols',
      label: 'Cols',
      inputMode: 'numeric'
    },
    {
      type: 'input',
      name: 'rows',
      label: 'Rows',
      inputMode: 'numeric'
    }
  ];

  const alwaysItems: Dialog.BodyComponentSpec[] = [
    {
      type: 'input',
      name: 'width',
      label: 'Width'
    },
    {
      type: 'input',
      name: 'height',
      label: 'Height'
    }
  ];

  const appearanceOptions = Options.getAppearanceOptions(editor);
  const appearanceItem = (field: Options.AppearanceField, spec: Dialog.BodyComponentSpec): Dialog.BodyComponentSpec[] =>
    appearanceOptions[field] ? [ spec ] : [];

  const appearanceItems: Dialog.BodyComponentSpec[] = [
    ...appearanceItem('cellspacing', {
      type: 'input',
      name: 'cellspacing',
      label: 'Cell spacing',
      inputMode: 'numeric'
    }),
    ...appearanceItem('cellpadding', {
      type: 'input',
      name: 'cellpadding',
      label: 'Cell padding',
      inputMode: 'numeric'
    }),
    ...appearanceItem('borderwidth', {
      type: 'input',
      name: 'border',
      label: 'Border width'
    }),
    ...appearanceItem('caption', {
      type: 'label',
      label: 'Caption',
      items: [
        {
          type: 'checkbox',
          name: 'caption',
          label: 'Show caption'
        }
      ]
    })
  ];

  const alignmentItem: Dialog.ListBoxSpec[] = [
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
    }
  ];

  const classListItem: Dialog.ListBoxSpec[] = classes.length > 0 ? [
    {
      name: 'class',
      type: 'listbox',
      label: 'Class',
      items: classes
    }
  ] : [];

  return rowColCountItems.concat(alwaysItems).concat(appearanceItems).concat(alignmentItem).concat(classListItem);
};

export { getItems };
