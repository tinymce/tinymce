import { Types } from '@ephox/bridge';
import Editor from 'tinymce/core/api/Editor';
import { hasAppearanceOptions } from '../api/Settings';

const getItems = (editor: Editor, classes: Types.SelectBox.ExternalSelectBoxItem[], insertNewTable: boolean) => {
  const rowColCountItems: Types.Dialog.BodyComponentApi[] = !insertNewTable ? [] : [
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

  const alwaysItems: Types.Dialog.BodyComponentApi[] = [
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

  const appearanceItems: Types.Dialog.BodyComponentApi[] = hasAppearanceOptions(editor) ? [
    {
      type: 'input',
      name: 'cellspacing',
      label: 'Cell spacing',
      inputMode: 'numeric'
    },
    {
      type: 'input',
      name: 'cellpadding',
      label: 'Cell padding',
      inputMode: 'numeric'
    },
    {
      type: 'input',
      name: 'border',
      label: 'Border width'
    },
    {
      type: 'label',
      label: 'Caption',
      items: [
        {
          type: 'checkbox',
          name: 'caption',
          label: 'Show caption'
        }
      ]
    }
  ] : [];

  const alignmentItem: Types.Dialog.BodyComponentApi[] = [
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
    }
  ];

  const classListItem: Types.Dialog.BodyComponentApi[] = classes.length > 0 ? [
    {
      type: 'selectbox',
      name: 'class',
      label: 'Class',
      items: classes
    }
  ] : [];

  return rowColCountItems.concat(alwaysItems).concat(appearanceItems).concat(alignmentItem).concat(classListItem);
};

export { getItems };
