/* tslint:disable:no-console */
import { console } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';

export default {
  setup: (ed: Editor) => {
    ed.ui.registry.addButton('basic-button-1', {
      text: 'basic-button-1',
      onAction() {
        console.log('basic-button-1 click');
      }
    });

    ed.ui.registry.addButton('basic-button-2', {
      icon: 'basic-icon',
      text: 'aria-label-icon-button',
      onAction() {
        console.log('basic-button-2 click, basic-icon');
      }
    });

    // ed.addButton('panel-button-1', {
    //   type: 'panelbutton',
    //   text: 'panel-button-1'
    //   },
    //   panel: {
    //     type: 'grid',
    //     columns: 2,
    //     items: [
    //       {
    //         // TODO: Not going through bridge yet
    //         type: 'input',
    //         name: 'panel-label-1',
    //         label: Option.none(),

    //       }
    //     ]
    //   }
    // });

    ed.ui.registry.addButton('dialog-button', {
      type: 'button',
      text: 'Launch Dialog',
      onAction() {
        ed.windowManager.open({
          title: 'Dialog title',
          body: {
            type: 'panel',
            items: [
              {
                name: 'preview',
                type: 'iframe'
              }
            ]
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
          initialData: {
            preview: 'some html url'
          },
          onSubmit: (_api) => { console.log('Preview Demo Submit'); },
          onClose: () => { console.log('Preview Demo Close'); }
        });
      }
    });

    ed.ui.registry.addMenuButton('menu-button-1', {
      text: 'menu',
      fetch: (callback) => callback('menu-button-item-1 menu-button-item-2')
    });

    ed.ui.registry.addMenuItem('menu-button-item-1', {
      text: 'menu-button-item-1',
      onAction() {
        console.log('menu-button-item-1 click');
      }
    });

    ed.ui.registry.addNestedMenuItem('menu-button-item-2', {
      text: 'menu-button-item-2',
      getSubmenuItems() {
        return [
          {
            type: 'menuitem',
            text: 'submenu-1',
            onAction() {
              console.log('submenu1');
            }
          },
          {
            type: 'menuitem',
            text: 'submenu-2',
            getSubmenuItems() {
              return [
                {
                  type: 'menuitem',
                  text: 'submenu-2-a',
                  onAction() {
                    console.log('submenu2a');
                  }
                }
              ];
            }
          }
        ];
      }
    });
  }
};
