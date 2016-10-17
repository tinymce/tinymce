define(
  'ephox.alloy.toolbar.MoreToolbar',

  [
    'ephox.alloy.toolbar.MoreOverflow',
    'ephox.alloy.toolbar.Overflowing',
    'ephox.alloy.toolbar.ToolbarSpecs',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (MoreOverflow, Overflowing, ToolbarSpecs, FieldSchema, ValueSchema, Arr, Merger, Fun) {
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
            components: groups,
            dom: {
              styles: {
                display: 'flex',
                background: '#333'
              }
            },
            replacing: { }
          }
        ],
        behaviours: [
          MoreOverflow
        ],
        'more-overflowing': {
          initGroups: groups,
          drawer: {
            uiType: 'container',
            replacing: { },
            dom: {
              styles: {
                background: 'white',
                color: 'black',
                display: 'flex',
                'flex-wrap': 'wrap'
              }
            },
            sliding: {
              mode: 'height',
              // FIX: hard-coded demo styles
              closedStyle: 'demo-sliding-closed',
              openStyle: 'demo-sliding-open',
              shrinkingStyle: 'demo-sliding-height-shrinking',
              growingStyle: 'demo-sliding-height-growing'
            }
          },
          button: {
            // FIX: Structify
            text: 'Toggle',
            action: function (drawer) {
              drawer.apis().toggleGrow();
            }
          }
        },
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