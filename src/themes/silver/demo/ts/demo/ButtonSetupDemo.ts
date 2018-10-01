// import { Option } from '@ephox/katamari';

export default {
  setup: (ed) => {
    ed.addButton('basic-button-1', {
      type: 'textbutton',
      text: 'basic-button-1',
      onAction () {
        console.log('basic-button-1 click');
      }
    });

    ed.addButton('basic-button-2', {
      type: 'iconbutton',
      icon: 'basic-icon',
      ariaLabel: 'aria-label-icon-button',
      onAction () {
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

    ed.addButton('dialog-button', {
      type: 'button',
      text: 'Launch Dialog',
      onAction () {
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
              type: 'submit',
              name: 'ok',
              text: 'Ok',
              primary: true
            },
            {
              type: 'cancel',
              name: 'cancel',
              text: 'Cancel'
            }
          ],
          initialData: {
            preview: 'some html url'
          },
          onSubmit: (api) => { console.log('Preview Demo Submit'); },
          onClose: () => { console.log('Preview Demo Close'); }
        });
      }
    });

    // ed.addButton('menu-button-1', {
    //   type: 'menubutton',
    //   text: 'menu',
    //   items: [ 'menu-item-1', 'menu-item-2' ]
    // });

    // ed.addMenuItem('menu-item-1', {
    //   type: 'item',
    //   text: 'menu-item-1',
    //   onAction () {
    //     console.log('menu-item-1 click');
    //   }
    // });

    // ed.addMenuItem('menu-item-2', {
    //   type: 'menu',
    //   text: 'menu-item-1',
    //   items: [
    //     {
    //       type: 'item',
    //       text: 'submenu-1',
    //       onAction () {
    //         console.log('submenu1');
    //       }
    //     },
    //     {
    //       type: 'menu',
    //       text: 'submenu-2',
    //       items: [
    //         {
    //           type: 'item',
    //           text: 'submenu-2-a',
    //           onAction () {
    //             console.log('submenu2a');
    //           }
    //         }
    //       ]
    //     }
    //   ]
    // });
  }
};