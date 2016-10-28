define(
  'ephox.alloy.toolbar.MoreToolbar',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.alloy.toolbar.MoreOverflow',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (SpecSchema, UiSubstitutes, MoreOverflow, FieldSchema, Arr, Merger, Option) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('overflowButton'),
      FieldSchema.strict('initGroups')
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

      // Dupe with toolbar spec. Not ideal. Find a better way, but just checking the concept. HERE.
      var buildGroups = function (groups) {
        return Arr.map(groups, function (grp) {
          return Merger.deepMerge(
            detail.parts().primary().members.group.munge(grp),
            {
              uiType: 'toolbar-group'
            }
          );
        });
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('more.toolbar'),
        detail,
        detail.components(),
        {
          '<alloy.toolbar.primary>': UiSubstitutes.single(
            Merger.deepMerge(
              detail.parts().primary(),
              {
                uiType: 'toolbar',
                uid: detail.partUids().primary,
                initGroups: detail.initGroups(),
                replacing: { }
              }
            )
          ),

          '<alloy.toolbar.more>': UiSubstitutes.single(
            Merger.deepMerge(
              detail.parts().more(),
              {
                uiType: 'toolbar',
                uid: detail.partUids().more,
                initGroups: [ ],
                sliding: {
                  mode: 'height',
                  // FIX: hard-coded demo styles
                  closedStyle: 'ephox-chameleon-toolbar-more-closed',
                  openStyle: 'ephox-chameleon-toolbar-more-open',
                  shrinkingStyle: 'ephox-chameleon-toolbar-more-hide',
                  growingStyle: 'ephox-chameleon-toolbar-more-show'
                },
                replacing: { }
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
          initGroups: buildGroups(detail.initGroups()),
          drawerUid: detail.partUids().more,
          primaryUid: detail.partUids().primary,
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