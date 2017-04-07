define(
  'ephox.alloy.demo.docs.DocToptabs',

  [
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.api.ui.TabSection'
  ],

  function (Tabbar, TabSection) {
    var make = function (tabs) {
      return TabSection.sketch({
        dom: {
          tag: 'div',
          styles: {
            display: 'flex',
            'flex-direction': 'column'
          }
        },
        components: [
          TabSection.parts().tabbar(),
          TabSection.parts().tabview()
        ],

        tabs: tabs,
        parts: {
          tabbar: {
            
            dom: {
              tag: 'div',
              styles: {
                width: '100%',
                display: 'flex',
                border: '2px solid black',
                'margin-bottom': '10px'
              }
            },
            components: [
              Tabbar.parts().tabs()
            ],
            members: {
              tab: {
                munge: function (tSpec) {
                  return {
                    view: tSpec.view,
                    value: tSpec.value,
                    dom: {
                      tag: 'span',
                      innerHtml: tSpec.value,
                      styles: {
                        display: 'flex',
                        padding: '10px',
                        'justify-content': 'center',
                        'flex-grow': '1',
                        cursor: 'pointer'
                      }
                    }
                  };
                }
              }
            },
            markers: {
              tabClass: 'tab-item',
              selectedClass: 'selected-tab-item'
            },
            parts: {
              tabs: { }
            }
          },
          tabview: {
            dom: { }
          }
        }
      });
    };

    return {
      make: make
    }; 
  }
);