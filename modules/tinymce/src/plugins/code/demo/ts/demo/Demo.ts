import { Dialog } from '@ephox/bridge';
import { Id } from '@ephox/katamari';

import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

interface Data {
  search: string;
}

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'code',
  toolbar: 'code tree',
  height: 600,
  setup: (ed) => {
    ed.ui.registry.addButton('tree', {
      text: 'Tree',
      onAction: () => {
        const fullTree: Dialog.TreeItemSpec [] = [
          {
            type: 'directory',
            id: Id.generate(''),
            title: 'Dir',
            children: [
              {
                type: 'directory',
                id: Id.generate(''),
                title: 'Sub dir',
                children: [
                  {
                    type: 'leaf',
                    title: 'File 1',
                    id: Id.generate(''),
                  },
                  {
                    type: 'leaf',
                    title: 'File 2',
                    id: Id.generate(''),
                  },
                ]
              },
              {
                type: 'leaf',
                title: 'File 3',
                id: Id.generate(''),
              },
              {
                type: 'leaf',
                title: 'File 4',
                id: Id.generate(''),
              },
            ]
          },
          {
            type: 'leaf',
            title: 'File 5',
            id: Id.generate(''),
          },
          {
            type: 'leaf',
            title: 'File 6',
            id: Id.generate(''),
          }];
        const getTree = (search: string) => {
          if (search.length > 2) {
            return fullTree.slice(1);
          } else {
            return fullTree;
          }
        };
        const getDialogSpec = (tree: Dialog.TreeItemSpec[], initialData: Data ): Dialog.DialogSpec<Data> => ({
          initialData,
          onChange: (api) => {
            const { search } = api.getData();
            api.redial(getDialogSpec(getTree(search), api.getData()));
          },
          title: 'Tree',
          buttons: [
            {
              type: 'cancel',
              text: 'Cancel',
            }
          ],
          body: {
            type: 'panel',
            items: [
              {
                type: 'input',
                name: 'search',
                label: 'Search',
              },
              {
                type: 'tree',
                onLeafAction: (id) => {
                  // eslint-disable-next-line
                  console.log('clicked on item with id', id);
                },
                items: tree
              }
            ]
          }
        });
        const initialData = { search: '' };
        ed.windowManager.open(getDialogSpec(getTree(initialData.search), initialData));
      }
    });
  }
});

export {};
