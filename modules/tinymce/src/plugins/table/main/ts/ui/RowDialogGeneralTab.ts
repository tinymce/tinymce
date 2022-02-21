import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Options from '../api/Options';
import * as UiUtils from './UiUtils';

const getClassList = (editor: Editor): Optional<Dialog.ListBoxSpec> => {
  const classes = UiUtils.buildListItems(Options.getRowClassList(editor));
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
