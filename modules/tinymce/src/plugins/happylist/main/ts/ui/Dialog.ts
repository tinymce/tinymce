import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import * as Ui from 'tinymce/core/api/ui/Ui';

import * as Options from '../api/Options';

const open = (editor: Editor): void => {
  const urlMap = Options.getListUrls(editor);

  const getSelectedList = () => {
    const selectedNode = editor.selection.getNode();
    return editor.dom.getParent(selectedNode, 'ul');
  };

  const collectionItems: Ui.Dialog.CollectionItem[] = Arr.map(Object.entries(urlMap), ([ key, value ]) => ({
    type: 'collectionitem',
    text: key,
    icon: `<span>${value}</span>`,
    value
  }));

  const initialState: Ui.Dialog.DialogData = {
    icons: [
      ...collectionItems,
    ]
  };

  const getInitialState = (): Ui.Dialog.DialogSpec<Ui.Dialog.DialogData> => {
    const body: Ui.Dialog.PanelSpec = {
      type: 'panel',
      items: [
        {
          label: 'Search',
          type: 'input',
          name: 'search'
        },
        {
          type: 'collection',
          name: 'icons',
        }
      ]
    };

    return {
      title: 'Icons',
      size: 'normal',
      body,
      initialData: initialState,
      buttons: [
        {
          type: 'submit',
          text: 'Submit',
          primary: true
        },
        {
          type: 'cancel',
          text: 'Close',
          primary: false
        }
      ],
      onAction: (api) => {
        const parentList = getSelectedList();
        const newId = 'custom-id';

        if (parentList && parentList.id) {
          parentList.id = newId;
        }

        // TODO: Replace hardcoded emoji with user selected emoji
        editor.dom.addStyle(`
					ul#${newId} {
						list-style: none; 
						padding: 0;
						margin: 0;
					}
					#${newId} li {
						padding-left: 16px;
					}
					#${newId} li::before {
						content: '😀';
						padding-right: 8px;
					}`
        );

        api.close();
      },
    };
  };

  editor.windowManager.open(getInitialState());
};

export {
  open
};