define(
  'tinymce.themes.mobile.touch.view.TapToEditMenuParts',

  [
    'ephox.alloy.api.ui.Menu'
  ],

  function (Menu) {
    var menu = function () {
      return {
        dom: {
          tag: 'div'
        },
        components: [
          Menu.parts().items()
        ],
        value: 'touch-menu-1',
        markers: {
          item: 'alloy-orb',
          selectedItem: 'alloy-selected-orb'
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
                  styles: {
                    display: 'flex',
                    'justify-content': 'center'
                  },
                  classes: [ 'alloy-orb' ]
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
