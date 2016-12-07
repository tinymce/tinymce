define(
  'ephox.alloy.api.ui.SplitDropdown',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.SplitDropdownSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (SystemEvents, EventHandler, PartType, Tagger, SpecSchema, SplitDropdownSpec, FieldSchema, Merger, Fun, Error) {
    var schema = [
      FieldSchema.strict('toggleClass'),
      FieldSchema.strict('fetch'),
      FieldSchema.strict('onExecute'),
      FieldSchema.option('lazySink'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      // FieldSchema.defaulted('onClose', Fun.noop),

      FieldSchema.defaulted('matchWidth', false)
    ];

    var arrowPart = PartType.internal(
      'arrow',
      '<alloy.split-dropdown.arrow>',
      function (detail) {
        return {
          // FIX: new style.
          uiType: 'button',
          behaviours: {
            // FIX undefined
            tabstopping: undefined,
            focusing: undefined
          }
        };
      },
      function (detail) {
        return {
          action: function (arrow) {
            var hotspot = arrow.getSystem().getByUid(detail.uid()).getOrDie();
            hotspot.getSystem().triggerEvent(SystemEvents.execute(), hotspot.element(), { });
          },
          behaviours: {
            toggling: {
              toggleOnExecute: false
            }
          }
        };
      }
    );

    var buttonPart = PartType.internal(
      'button',
      '<alloy.split-dropdown.button>',
      function (detail) {
        return {
          behaviours: {
          // FIX: Undefined false
            focusing: undefined
          }
        };
      },
      function (detail) {
        return {
          uiType: 'button',
          action: detail.onExecute()
        };
      }
    );

    var sinkPart = PartType.optional(
      'sink',
      '<alloy.sink>',
      Fun.constant({ }),
      Fun.constant({
        dom: {
          tag: 'div'
        },
        uiType: 'custom',
        behaviours: {
          positioning: {
            // FIX: configurable
            useFixed: true
          }
        },
        events: {
          // Probably a behaviour: cut mania
          'keydown': EventHandler.nu({
            run: function (component, simulatedEvent) {
              // Sinks should not let keydown or click propagate
              simulatedEvent.cut();
            }
          }),
          'mousedown': EventHandler.nu({
            run: function (component, simulatedEvent) {
              // Sinks should not let keydown or click propagate or mousedown
              simulatedEvent.cut();
            }
          }),
          'click': EventHandler.nu({
            run: function (component, simulatedEvent) {
              // Sinks should not let keydown or click propagate
              simulatedEvent.cut();
            }
          })
        }
      })
    );

    var partTypes = [
      arrowPart,
      buttonPart,
      PartType.external('menu'),
      sinkPart
    ];

    var build = function (f) {

      var parts = PartType.generate('split-dropdown', partTypes);
      // {
      //   arrow: Fun.constant({
      //     placeholder: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.arrow>' }),
      //     build: function (spec) {
      //       return UiSubstitutes.single(true,  function () {
      //         return Merger.deepMerge(
      //           {
      //             // FIX: new style.
      //             uiType: 'button',
      //             behaviours: {
      //               // FIX undefined
      //               tabstopping: undefined,
      //               focusing: undefined
      //             }
      //           },
      //           spec,
      //           {
      //             uid: detail.partUids()['arrow'],
      //             action: function (arrow) {
      //               var hotspot = arrow.getSystem().getByUid(detail.uid()).getOrDie();
      //               hotspot.getSystem().triggerEvent(SystemEvents.execute(), hotspot.element(), { });
      //             },
      //             behaviours: {
      //               toggling: {
      //                 toggleOnExecute: false
      //               }
      //             }
      //           }
      //         );
      //       });
      //     }
      //   }),
      //   button: Fun.constant({
      //     placeholder: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.button>' }),
      //     build: function (spec) {
      //       return UiSubstitutes.single(true,  function () {
      //         return Merger.deepMerge(
      //           {
      //             behaviours: {
      //               // FIX: Undefined false
      //               focusing: undefined
      //             }
      //           },
      //           spec,
      //           {
      //             uid: detail.partUids()['button'],
      //             uiType: 'button',
      //             action: detail.onExecute()
      //           }
      //         );
      //       });
      //     }
      //   }),
      //   menu: Fun.constant({
      //     placeholder: Fun.die('The part menu should not appear in components'),
      //     build: function (spec) {
      //       return spec;
      //     }
      //   }),

      //   sink: Fun.constant(InternalSink)
      // };


      var spec = f(parts);
      var userSpec = Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, spec);

      var schemas = PartType.schemas(partTypes);

      var detail = SpecSchema.asStructOrDie('split-dropdown.build', schema, userSpec, schemas.required(), schemas.optional());

      var components = PartType.components('split-dropdown', detail, partTypes);

      // var components = UiSubstitutes.substitutePlaces(Option.some('split-dropdown'), detail, detail.components(), {
      //   '<alloy.split-dropdown.button>': detail.parts().button(),
      //   '<alloy.split-dropdown.arrow>': detail.parts().arrow(),
      //   '<alloy.sink>': detail.parts().sink()
      // });

      debugger;

      return Merger.deepMerge(
        spec,
        SplitDropdownSpec.make(detail, components)
      );
    };

    return {
      build: build
    };
  }
);