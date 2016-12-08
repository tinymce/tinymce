define(
  'ephox.alloy.test.typeahead.TestTypeaheadList',

  [

  ],

  function () {
    return {
      members: {
        menu: {
          munge: function (spec) {
            return {
              dom: {
                tag: 'ol',
                attributes: {
                  'aria-label': spec.text
                },
                classes: [ 'test-typeahead-menu' ]
              },
              shell: true,
              components: [ ]
            };
          }
        },
        item: {
          munge: function (spec) {

            return spec.type === 'separator' ? {
              uiType: 'container',
              dom: {
                tag: 'div',
                innerHtml: spec.text
              },
              components: [

              ]
            } : {
              dom: {
                tag: 'li',
                classes: spec.type === 'item' ? [ 'test-typeahead-item' ] : [ ],
                attributes: {
                  'data-value': spec.data.value
                },
                innerHtml: spec.data.text
              },
              components: [

              ]
            };
          }
        }
      },
      markers: {
        item: 'test-typeahead-item',
        selectedItem: 'test-typeahead-selected-item',
        menu: 'test-typeahead-menu',
        selectedMenu: 'test-typeahead-selected-menu',
        'backgroundMenu': 'test-typeahead-background-menu'
      }
    };
  }
);