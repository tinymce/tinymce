define(
  'ephox.alloy.toolbar.MoreToolbar',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.toolbar.MoreOverflow',
    'ephox.alloy.toolbar.Overflowing',
    'ephox.alloy.toolbar.ToolbarSpecs',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (SpecSchema, MoreOverflow, Overflowing, ToolbarSpecs, FieldSchema, ValueSchema, Arr, Merger, Fun) {
    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('more.toolbar.spec', 
        [
          FieldSchema.strict('overflowButton')
        ].concat(ToolbarSpecs.toolbarSchema()), 
      spec, [ ]);


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
          mode: 'cyclic',
          visibilitySelector: '.ephox-chameleon-toolbar'
        },
        components: [
          {
            uiType: 'container',
            components: groups,
            dom: {
              styles: {
                // display: 'flex',
                // background: '#333'
              },
              classes: [ 'ephox-chameleon-toolbar', 'ephox-chameleon-toolbar-primary' ]
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
                // background: 'white',
                // color: 'black',
                // display: 'flex',
                // 'flex-wrap': 'wrap'
              },
              classes: [ 'ephox-chameleon-toolbar-more', 'ephox-chameleon-toolbar' ]
            },
            sliding: {
              mode: 'height',
              // FIX: hard-coded demo styles
              closedStyle: 'ephox-chameleon-toolbar-more-closed',
              openStyle: 'ephox-chameleon-toolbar-more-open',
              shrinkingStyle: 'ephox-chameleon-toolbar-more-hide',
              growingStyle: 'ephox-chameleon-toolbar-more-show'
            }
          },
          button: Merger.deepMerge(
            detail.overflowButton(),
            {
              action: function (drawer) {
                drawer.apis().toggleGrow();
              }
            }
          )
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