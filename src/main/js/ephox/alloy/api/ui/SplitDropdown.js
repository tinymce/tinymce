define(
  'ephox.alloy.api.ui.SplitDropdown',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.SplitDropdownSpec',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'global!Error'
  ],

  function (SystemEvents, EventHandler, Tagger, SpecSchema, SplitDropdownSpec, UiSubstitutes, FieldSchema, Obj, Merger, Fun, Option, Error) {
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

    var build = function (f) {

      // FIX: Get sink working.

      
      // UiSubstitutes.single(true,  
      //     Merger.deepMerge({
      //       uiType: 'button',
      //       tabstopping: undefined,
      //       focusing: undefined
      //     }, detail.parts().arrow(), {
      //       uid: detail.partUids().arrow,
      //       action: function (arrow) {
      //         var hotspot = arrow.getSystem().getByUid(detail.uid()).getOrDie();
      //         hotspot.getSystem().triggerEvent(SystemEvents.execute(), hotspot.element(), { });
      //       },

      //       behaviours: {
      //         toggling: {
      //           toggleOnExecute: false
      //         }
      //       }
      //     })



      var parts = {
        arrow: Fun.constant({
          placeholder: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.arrow>' }),
          build: function (spec) {
            return UiSubstitutes.single(true,  function () {
              return Merger.deepMerge(
                {
                  // FIX: new style.
                  uiType: 'button',
                  behaviours: {
                    // FIX undefined
                    tabstopping: undefined,
                    focusing: undefined
                  }
                },
                spec,
                {
                  uid: detail.partUids()['arrow'],
                  action: function (arrow) {
                    var hotspot = arrow.getSystem().getByUid(detail.uid()).getOrDie();
                    hotspot.getSystem().triggerEvent(SystemEvents.execute(), hotspot.element(), { });
                  },
                  behaviours: {
                    toggling: {
                      toggleOnExecute: false
                    }
                  }
                }
              );
            });
          }
        }),
        button: Fun.constant({
          placeholder: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.button>' }),
          build: function (spec) {
            return UiSubstitutes.single(true,  function () {
              return Merger.deepMerge(
                {
                  behaviours: {
                    // FIX: Undefined false
                    focusing: undefined
                  }
                },
                spec,
                {
                  uid: detail.partUids()['button'],
                  uiType: 'button',
                  action: detail.onExecute()
                }
              );
            });
          }
        }),
        menu: Fun.constant({
          placeholder: Fun.die('The part menu should not appear in components'),
          build: function (spec) {
            return UiSubstitutes.single(false, Fun.constant(spec));
          }
        }),

        sink: Fun.constant({
          placeholder: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.sink>' }),
          build: function (spec) {
            return UiSubstitutes.single(false,  function () {
              return Merger.deepMerge(
                spec,
                {
                  uid: detail.uid() + '-internal-sink',
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
                }
              );
            });
          }
        })
      };


      var spec = f(parts);
      var userSpec = Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, spec);


      var detail = SpecSchema.asStructOrDie('split-dropdown.build', schema, userSpec, [ 'button', 'arrow', 'menu' ], [ 'sink' ]);

      var components = UiSubstitutes.substitutePlaces(Option.some('split-dropdown'), detail, detail.components(), {
        '<alloy.split-dropdown.button>': detail.parts().button(),
        '<alloy.split-dropdown.arrow>': detail.parts().arrow(),
        '<alloy.sink>': detail.parts().sink()
      });

      return SplitDropdownSpec.make(detail, components);
    };

    return {
      build: build
    };
  }
);