define(
  'ephox.alloy.toolbar.MoreToolbar',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.alloy.toolbar.MoreOverflow',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (SpecSchema, UiSubstitutes, MoreOverflow, FieldPresence, FieldSchema, ValueSchema, Arr, Merger, Fun, Option) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('initGroups'),

      FieldSchema.strict('moreClosedClass'),
      FieldSchema.strict('moreOpenClass'),
      FieldSchema.strict('moreGrowingClass'),
      FieldSchema.strict('moreShrinkingClass'),

      FieldSchema.defaulted('onEscape', Option.none),

      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('overflow')
        ])
      )
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

      var buildGroup = function (grp) {
        return Merger.deepMerge(
          detail.parts().primary().members.group.munge(grp),
          {
            uiType: 'toolbar-group'
          }
        );
      };

      // Dupe with toolbar spec. Not ideal. Find a better way, but just checking the concept. HERE.
      var buildGroups = function (groups) {
        return Arr.map(groups, buildGroup);
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
                  closedStyle: detail.moreClosedClass(),
                  openStyle: detail.moreOpenClass(),
                  shrinkingStyle: detail.moreShrinkingClass(),
                  growingStyle: detail.moreGrowingClass()
                },
                replacing: { }
              }
            )
          )
        }, 
        {

        }
      );

      var overflowGroup = {
        label: '',
        items: [
          Merger.deepMerge(
            detail.members().overflow().munge({ }),
            {
              uiType: 'button',
              action: function (component) {
                component.getSystem().getByUid(detail.partUids().more).each(function (drawer) {
                  drawer.apis().toggleGrow();
                });
              }
            }
          )
        ]
      };

     // Maybe default some arguments here
      return Merger.deepMerge(spec, {
        dom: detail.dom(),
        keying: {
          mode: 'cyclic',
          visibilitySelector: '.ephox-chameleon-toolbar',
          onEscape: detail.onEscape()
        },
        components: components,
        behaviours: [
          MoreOverflow
        ],
        'more-overflowing': {
          initGroups: buildGroups(detail.initGroups()),
          drawerUid: detail.partUids().more,
          primaryUid: detail.partUids().primary,
          overflowGroup: buildGroup(overflowGroup),
          buildGroups: buildGroups
        },
        postprocess: function () { }
      });
    };

    return {
      make: make
    };
  }
);