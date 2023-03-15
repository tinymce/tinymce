import { Dialog } from '@ephox/bridge';
import { Id } from '@ephox/katamari';

import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

interface Data {
  search: string;
  expandedKeys: string[];
}

export default (): void => {
  tinymce.init({
    selector: 'textarea.tinymce',
    toolbar: 'tree',
    height: 600,
    setup: (ed) => {
      ed.ui.registry.addButton('tree', {
        text: 'Tree',
        onAction: () => {
          const fullTree: Dialog.TreeItemSpec [] = [
            {
              type: 'directory',
              id: 'dirempty',
              title: 'Dir Empty',
              menu: {
                type: 'menubutton',
                icon: 'image-options',
                fetch: (success) => success([
                  {
                    type: 'menuitem',
                    text: 'menuitem',
                    onAction: () => {
                      // eslint-disable-next-line
                        console.log('clicked action');
                    }
                  }
                ])
              },
              children: []
            },
            {
              type: 'directory',
              id: 'dir',
              title: 'Dir',
              menu: {
                type: 'menubutton',
                icon: 'image-options',
                fetch: (success) => success([
                  {
                    type: 'menuitem',
                    text: 'menuitem',
                    onAction: () => {
                      // eslint-disable-next-line
                        console.log('clicked action');
                    }
                  }
                ])
              },
              children: [
                {
                  type: 'directory',
                  id: 'subdir',
                  title: 'Sub dir',
                  children: [
                    {
                      type: 'leaf',
                      title: 'File 1',
                      id: '1',
                    },
                    {
                      type: 'leaf',
                      title: 'File 2',
                      id: '2',
                    },
                  ]
                },
                {
                  type: 'leaf',
                  title: 'File 3',
                  id: '3',
                },
                {
                  type: 'leaf',
                  title: 'File 4',
                  id: '4',
                  menu: {
                    type: 'menubutton',
                    icon: 'image-options',
                    fetch: (success) => success([
                      {
                        type: 'menuitem',
                        text: 'menuitem',
                        onAction: () => {
                        // eslint-disable-next-line
                        console.log('clicked action');
                        }
                      }
                    ])
                  }
                },
              ]
            },
            {
              type: 'leaf',
              title: 'File 5',
              id: '5',
            },
            {
              type: 'leaf',
              title: 'File 6',
              id: '6',
            }];
          const getTree = (search: string) => {
            if (search.length > 2) {
              return fullTree.slice(1);
            } else {
              return fullTree;
            }
          };
          const getDialogSpec = (tree: Dialog.TreeItemSpec[], initialData: Data ): Dialog.DialogSpec<Data> => {
            let expandedKeys = initialData.expandedKeys;
            return ({
              size: 'large',
              initialData,
              onChange: (api) => {
                api.redial(getDialogSpec(getTree(''), { search: api.getData().search, expandedKeys }));
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
                    name: 'search'
                  },
                  {
                    type: 'bar',
                    items: [
                      {
                        type: 'panel',
                        items: [
                          {
                            type: 'tree',
                            onLeafAction: (id) => {
                            // eslint-disable-next-line
                            console.log('clicked on item with id', id);
                            },
                            onExpand: (newExpandedKeys) => {
                              expandedKeys = newExpandedKeys;
                            },
                            defaultExpandedKeys: initialData.expandedKeys,
                            items: tree
                          }]
                      },
                    ]
                  }
                ]
              }
            });
          };
          const initialData: Data = { search: '', expandedKeys: [] };
          ed.windowManager.open(getDialogSpec(getTree(initialData.search), initialData));
        }
      });
    }
  });
};

export {};
