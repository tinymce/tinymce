define(
  'ephox.alloy.demo.DemoMenus',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    var list = {
      members: {
        menu: {
          munge: function (spec) {
            return {
              dom: {
                tag: 'ol',
                attributes: {
                  'aria-label': spec.text
                },
                classes: [ 'demo-alloy-menu' ]
              },
              shell: true,
              components: [ ]
            };
          }
        },
        item: {
          munge: function (spec) {
            return spec.type === 'separator' ? {
              dom: {
                tag: 'div',
                classes: [  ],
                innerHtml: spec.text
              },
              components: [

              ]
            } : {
              dom: {
                tag: 'li',
                classes: spec.type === 'item' ? [ 'alloy-item' ] : [ ],
                innerHtml: spec.data.html
              },
              components: [

              ]
            };
          }
        }
      },
      markers: {
        item: 'alloy-item',
        selectedItem: 'alloy-selected-item',
        menu: 'alloy-menu',
        selectedMenu: 'alloy-selected-menu',
        'backgroundMenu': 'alloy-background-menu'
      }
    };

    return {
      list: Fun.constant(list)
    };
  }
);