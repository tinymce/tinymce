define(
  'ephox.alloy.test.dropdown.TestDropdownMenu',

  [
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.ItemWidget',
    'ephox.alloy.api.ui.Menu',
    'ephox.katamari.api.Fun'
  ],

  function (Representing, ItemWidget, Menu, Fun) {
    var renderMenu = function (spec) {
      return {
        dom: {
          tag: 'ol',
          classes: [ 'menu' ],
          attributes: spec.text !== undefined ? {
            'aria-label': spec.text
          } : { }
        },
        items: spec.items,
        components: [
          Menu.parts().items({ })
        ]
      };
    };

    var renderItem = function (spec) {
      return spec.type === 'widget' ? {
        type: 'widget',
        data: spec.data,
        dom: {
          tag: 'li',
          attributes: {
            'data-value': spec.data.value
          },
          classes: [ 'item-widget' ]
        },
        components: [
          ItemWidget.parts().widget(spec.widget)
        ]
      } : {
        type: spec.type,
        data: spec.data,
        dom: {
          tag: 'li',
          attributes: {
            'data-value': spec.data.value
          },
          classes: [ ],
          innerHtml: spec.data.text
        },
        components: [ ]
      };
    };

    var part = function (store) {
      return {
        dom: {
          tag: 'div'
        },
        markers: markers,
        onExecute: function (dropdown, item) {
          var v = Representing.getValue(item);
          return store.adderH('dropdown.menu.execute: ' + v.value)();
        }
      };
    };

    var markers = {
      item: 'item',
      selectedItem: 'selected-item',
      menu: 'menu',
      selectedMenu: 'selected-menu',
      'backgroundMenu': 'background-menu'
    };

    return {
      renderItem: renderItem,
      renderMenu: renderMenu,
      part: part,
      markers: Fun.constant(markers)
    };
  }
);