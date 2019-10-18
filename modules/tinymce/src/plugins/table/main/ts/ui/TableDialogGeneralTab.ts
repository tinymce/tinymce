import { Types } from '@ephox/bridge';
import Helpers from './Helpers';
import { getTableClassList, hasAppearanceOptions } from '../api/Settings';
import Editor from 'tinymce/core/api/Editor';

const getItems = (editor: Editor, hasClasses: boolean, insertNewTable: boolean) => {
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

  const classListItem: Types.Dialog.BodyComponentApi[] = hasClasses ? [
    {
      type: 'selectbox',
      name: 'class',
      label: 'Class',
      items: Helpers.buildListItems(
        getTableClassList(editor),
        (item) => {
          if (item.value) {
            item.textStyle = () => {
              return editor.formatter.getCssText({ block: 'table', classes: [item.value] });
            };
          }
        }
      )
    }
  ] : [];

  return rowColCountItems.concat(alwaysItems).concat(appearanceItems).concat(alignmentItem).concat(classListItem);
};

export default {
  getItems
};
