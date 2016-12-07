define(
  'ephox.alloy.toolbar.MoreToolbar',

  [
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.data.Fields',
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

  function (Sliding, Behaviour, Fields, SpecSchema, UiSubstitutes, MoreOverflow, FieldPresence, FieldSchema, ValueSchema, Arr, Merger, Fun, Option) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('initGroups'),

      FieldSchema.strict('moreClosedClass'),
      FieldSchema.strict('moreOpenClass'),
      FieldSchema.strict('moreGrowingClass'),
      FieldSchema.strict('moreShrinkingClass'),

      FieldSchema.defaulted('onEscape', Option.none),

      Fields.members([ 'overflow' ])
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
          '<alloy.toolbar.primary>': UiSubstitutes.single(true,  
            Merger.deepMerge(
              detail.parts().primary(),
              {
                uiType: 'toolbar',
                uid: detail.partUids().primary,
                initGroups: detail.initGroups(),
                replacing: { }
              },
              {
                dom: {
                  attributes: {
                    role: 'group'
                  }
                }
              }
            )
          ),

          '<alloy.toolbar.more>': UiSubstitutes.single(true,  
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
              },
              {
                dom: {
                  attributes: {
                    role: 'group'
                  }
                }
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
                component.getSystem().getByUid(detail.partUids().more).each(
                  Sliding.toggleGrow
                );
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
          MoreOverflow,
          Behaviour.exhibition(Option.none(), {
            attributes: {
              'role': 'toolbar'
            }
          })
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