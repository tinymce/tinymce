define(
  'ephox.alloy.test.dropdown.TestDropdownMenu',

  [
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.ItemWidget',
    'ephox.alloy.api.ui.Menu'
  ],

  function (Representing, ItemWidget, Menu) {
    return function (store) {
      return {
        members: {
          menu: {
            munge: function (menuSpec) {
              return {
                dom: {
                  tag: 'div',
                  classes: [ 'menu' ],
                  attributes: menuSpec.text !== undefined ? {
                    'aria-label': menuSpec.text
                  } : { }
                },
                components: [
                  Menu.parts().items()
                ]
              };
            }
          },
          item: {
            munge: function (itemSpec) {
              return itemSpec.type === 'widget' ? {
                dom: { 
                  tag: 'li',
                  classes: [ 'item', 'item-widget' ]
                },
                components: [
                  ItemWidget.parts().widget()
                ]
              } : {
                dom: {
                  tag: 'li',
                  classes: [ 'item' ],
                  innerHtml: itemSpec.data.text
                },
                components: [ ]
              };
            }
          }
        },
        markers: {
          item: 'item',
          selectedItem: 'selected-item',
          menu: 'menu',
          selectedMenu: 'selected-menu',
          'backgroundMenu': 'background-menu'
        },
        onExecute: function (dropdown, item) {
          var v = Representing.getValue(item);
          return store.adderH('dropdown.menu.execute: ' + v.value)();
        }
      };
    };
  }
);