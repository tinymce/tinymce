define(
  'ephox.alloy.docs.DocSidetabs',

  [
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.api.ui.TabSection',
    'ephox.compass.Arr'
  ],

  function (Tabbar, TabSection, Arr) {
    var make = function (definitions) {
      return TabSection.sketch({
        dom: {
          tag: 'div',
          styles: {
            display: 'flex',
            'flex-direction': 'row'
          }
        },
        components: [
          TabSection.parts().tabbar(),
          TabSection.parts().tabview()
        ],

        tabs: Arr.map(definitions, function (defn) {
          return {
            value: defn.value,
            view: function () {
              return [ defn.wrapper ];
            }
          };
        }),
        parts: {
          tabbar: {
            
            dom: {
              tag: 'ul',
              styles: {
                'list-style-type': 'none',
                'margin-right': '10px'
              }
            },
            components: [
              Tabbar.parts().tabs()
            ],
            members: {
              tab: {
                munge: function (tSpec) {
                  return {
                    value: tSpec.value,
                    dom: {
                      tag: 'li',
                      styles: {
                        margin: '2px',
                        padding: '2px',
                        border: '1px solid grey',
                        cursor: 'pointer'
                      },
                      innerHtml: tSpec.value
                    }
                  };
                }
              }
            },
            markers: {
              tabClass: 'tab-item',
              selectedClass: 'selected-tab-item'
            }
          },
          tabview: { }
        }
      });
    };

    return {
      make: make
    }; 
  }
);