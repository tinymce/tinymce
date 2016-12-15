define(
  'ephox.alloy.test.dropdown.TestDropdownMenu',

  [
    'ephox.alloy.api.behaviour.Representing'
  ],

  function (Representing) {
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
                  // FIX: Expose through API
                  { uiType: 'placeholder', name: '<alloy.menu.items>', owner: 'menu' }
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
                  // FIX: Expose through API
                  { uiType: 'placeholder', owner: 'item-widget', name: '<alloy.item.widget>' }
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