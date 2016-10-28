define(
  'ephox.alloy.toolbar.MoreToolbar',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.alloy.toolbar.MoreOverflow',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (SpecSchema, UiSubstitutes, MoreOverflow, FieldSchema, Merger, Option) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('overflowButton'),
      // FieldSchema.strict('groups')
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie(
        'more.toolbar.spec', 
        schema.concat([ ]),
        spec, [
          'primary',
          'more'
        ]
      );

      var components = UiSubstitutes.substitutePlaces(
        Option.some('more.toolbar'),
        detail,
        detail.components(),
        {
          '<alloy.toolbar.primary>': UiSubstitutes.single(
            Merger.deepMerge(
              detail.parts().primary(),
              {
                uiType: 'toolbar'
              }
            )
          ),

          '<alloy.toolbar.more>': UiSubstitutes.multiple(
            Merger.deepMerge(
              detail.parts().more(),
              {
                uiType: 'toolbar'
              }
            )
          )
        }, 
        {

        }
      );

     // Maybe default some arguments here
      return Merger.deepMerge(spec, {
        dom: detail.dom(),
        keying: {
          mode: 'cyclic',
          visibilitySelector: '.ephox-chameleon-toolbar'
        },
        components: components,
        behaviours: [
          MoreOverflow
        ],
        'more-overflowing': {
          initGroups: [ ],
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
        postprocess: function () { }
      });
    };

    return {
      make: make
    };
  }
);