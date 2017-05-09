define(
  'tinymce.themes.mobile.touch.view.TapToEditMenuParts',

  [
    'ephox.alloy.api.ui.Menu',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Menu, Styles) {
    var menu = function () {
      return {
        dom: {
          tag: 'div'
        },
        components: [
          Menu.parts().items()
        ],
        // TODO: Default this to a random value.
        value: 'touch-menu-1',
        markers: {
          item: Styles.resolve('mask-menu-item'),
          selectedItem: Styles.resolve('mask-menu-item-selected')
        },
        members: {
          item: {
            munge: function (itemSpec) {
              return {
                dom: {
                  tag: 'div',
                  attributes: {
                    'data-value': itemSpec.data.value
                  },
                  classes: [ Styles.resolve('mask-menu-item') ]
                },
                components: [
                  {
                    dom: {
                      tag: 'span',
                      innerHtml: itemSpec.data.text
                    }
                  }
                ]
              };
            }
          }
        }
      };
    };

    var view = function () {
      return {
        dom: {
          tag: 'div',
          classes: [ 'tap-button-view' ]
        }
      };
    };

    return {
      menu: menu,
      view: view
    };
  }
);
