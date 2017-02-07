define(
  'ephox.alloy.docs.DocToptabs',

  [
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.api.ui.TabSection',
    'ephox.compass.Arr'
  ],

  function (Tabbar, TabSection, Arr) {
    var make = function (tabs) {
      return TabSection.build({
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
                      tag: 'span',
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