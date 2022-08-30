import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { parseDetail, parseStartValue } from '../core/ListNumbering';
import { isOlNode } from '../core/NodeType';
import { getParentList } from '../core/Selection';
import { isWithinNonEditableList } from '../core/Util';

const open = (editor: Editor): void => {
  // Find the current list and skip opening if the selection isn't in an ordered list
  const currentList = getParentList(editor);
  if (!isOlNode(currentList) || isWithinNonEditableList(editor, currentList)) {
    return;
  }

  editor.windowManager.open({
    title: 'List Properties',
    body: {
      type: 'panel',
      items: [
        {
          type: 'input',
          name: 'start',
          label: 'Start list at number',
          inputMode: 'numeric'
        }
      ]
    },
    initialData: {
      start: parseDetail({
        start: editor.dom.getAttrib(currentList, 'start', '1'),
        listStyleType: Optional.from(editor.dom.getStyle(currentList, 'list-style-type'))
      })
    },
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    onSubmit: (api) => {
      const data = api.getData();
      parseStartValue(data.start).each((detail) => {
        editor.execCommand('mceListUpdate', false, {
          attrs: {
            start: detail.start === '1' ? '' : detail.start
          },
          styles: {
            'list-style-type': detail.listStyleType.getOr('')
          }
        });
      });
      api.close();
    }
  });
};

export {
  open
};
