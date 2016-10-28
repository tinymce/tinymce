define(
  'ephox.alloy.toolbar.MoreToolbar',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.alloy.toolbar.MoreOverflow',
    'ephox.alloy.toolbar.ToolbarSpecs',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger'
  ],

  function (SpecSchema, UiSubstitutes, MoreOverflow, ToolbarSpecs, FieldPresence, FieldSchema, ValueSchema, Arr, Merger) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('overflowButton'),
      FieldSchema.strict('groups'),

      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('group')
        ])
      )
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie(
        'more.toolbar.spec', 
        schema.concat([ ]),
        spec, [ ]
      );

      var components = UiSubstitutes.substitutePlaces(
        Option.some('more.toolbar'),
        detail,
        detail.components(),
        {
          '<alloy.toolbar.groups>': UiSubstitutes.multiple(
            Arr.map(detail.groups(), function (grp) {
              return Merger.deepMerge(
                detail.members().group().munge(grp),
                {
                  uiType: 'toolbar-group'
                }
              );
            })
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