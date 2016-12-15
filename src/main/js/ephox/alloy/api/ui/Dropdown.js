define(
  'ephox.alloy.api.ui.Dropdown',

  [
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.dropdown.Beta',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Focusing, Toggling, UiBuilder, Beta, InternalSink, PartType, ButtonBase, FieldSchema, Merger, Fun, Option) {
    var schema = [
      FieldSchema.strict('fetch'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      FieldSchema.defaulted('onExecute', Option.none),
      // FIX: Remove defaulted toggleClass
      FieldSchema.defaulted('toggleClass', 'alloy-selected-button'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('displayer', Fun.identity),
      FieldSchema.option('lazySink'),
      FieldSchema.defaulted('matchWidth', false)
    ];

    var partTypes = [
      PartType.external(
        { build: Fun.identity },
        'menu', 
        function (detail) {
          return {
            onExecute: detail.onExecute()
          };
        },
        Fun.constant({ })
      ),
      InternalSink
    ];

    var make = function (detail, components, spec, externals) {
      return Merger.deepMerge(
        {
          events: ButtonBase.events(
            Option.some(function (component) {
              Beta.togglePopup(detail, {
                anchor: 'hotspot',
                hotspot: component
              }, component, externals).get(function (sandbox) {

              });
            })
          )
        },
        {
          uid: detail.uid(),
          uiType: 'custom',
          dom: detail.dom(),
          components: components,
          behaviours: {
            toggling: {
              toggleClass: detail.toggleClass(),
              aria: {
                'aria-expanded-attr': 'aria-expanded'
              }
            },
            coupling: {
              others: {
                sandbox: function (hotspot) {
                  return Beta.makeSandbox(detail, {
                    anchor: 'hotspot',
                    hotspot: hotspot
                  }, hotspot, {
                    onOpen: function () { Toggling.select(hotspot); },
                    onClose: function () { Toggling.deselect(hotspot); }
                  });
                }
              }
            },
            keying: {
              mode: 'execution',
              useSpace: true
            },
            focusing: true
          },

          eventOrder: {
            // Order, the button state is toggled first, so assumed !selected means close.
            'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
          }
        }
      );
    };

    var build = function (spec) {
      return UiBuilder.composite('dropdown', schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate('dropdown', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);