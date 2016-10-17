define(
  'ephox.alloy.toolbar.MoreToolbar',

  [
    'ephox.alloy.toolbar.Overflowing',
    'ephox.alloy.toolbar.ToolbarSpecs',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (Overflowing, ToolbarSpecs, ValueSchema, Arr, Merger, Fun) {
    var make = function (spec) {
      var detail = ValueSchema.asStructOrDie('toolbar.spec', ToolbarSpecs.toolbarSchema(), spec);


      var groups = Arr.map(detail.groups(), ToolbarSpecs.buildGroup);

      var postprocess = function () {

      };

     // Maybe default some arguments here
      return Merger.deepMerge(spec, {
        dom: {
          tag: 'div',
          styles: {
            // display: 'flex'
          }
        },
        keying: {
          mode: 'cyclic'
        },
        components: [
          {
            uiType: 'container',
            components: groups.concat([
         
            ]),
            dom: {
              styles: {
                display: 'flex'
              }
            }
          }
        ],
        coupling: {
          others: {
            'more-drawer': {
              uiType: 'container',
              uid: 'more-drawer-slider',
              components: [
                {
                  uiType: 'container',
                  dom: {
                    styles: {
                      height: '100px',
                      display: 'block',

                      'background-color': 'black'
                    }
                  }
                }
              ],
              replacing: { },
              sliding: {
                mode: 'height',
                // FIX: hard-coded demo styles
                closedStyle: 'demo-sliding-closed',
                openStyle: 'demo-sliding-open',
                shrinkingStyle: 'demo-sliding-height-shrinking',
                growingStyle: 'demo-sliding-height-growing'
              }
            },
            'more-button': ToolbarSpecs.buildGroup(
              ValueSchema.asStructOrDie('overflow.goru', ToolbarSpecs.groupSchema(), {
                label: 'more-button-group',
                components: [
                  { type: 'button', text: 'Toggle' }
                ]
              })
            )
          }
        },
        behaviours: [
          Overflowing
        ],
        postprocess: postprocess
      }, spec, {
        uiType: 'custom'
      });
    };

    return {
      make: make
    };
  }
);