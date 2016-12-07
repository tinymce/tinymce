define(
  'ephox.alloy.api.ui.SplitDropdown',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.SplitDropdownSpec',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (SystemEvents, Tagger, SpecSchema, SplitDropdownSpec, UiSubstitutes, FieldSchema, Obj, Merger, Fun, Option) {
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

      
      // UiSubstitutes.single(
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
            return function () {
              return UiSubstitutes.single(Merger.deepMerge(
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
              ));
            };
          }
        }),
        button: Fun.constant({
          placeholder: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.button>' }),
          build: function (spec) {
            return function () {
              return UiSubstitutes.single(Merger.deepMerge(
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
              ));
            };
          }
        }),
        menu: Fun.constant({
          placeholder: Fun.die('The part menu should not appear in components'),
          build: function (spec) {
            return spec;
          }
        })
      };

      // var components = UiSubstitutes.substitutePlaces(Option.some('split-dropdown'), detail, detail.components(), {
      //   '<alloy.split-dropdown.button>': UiSubstitutes.single(
      //     Merger.deepMerge(
      //       {
      //         behaviours: {
      //           focusing: undefined
      //         }
      //       },
      //       detail.parts()['button'](),
      //       {
      //         uid: detail.partUids()['button'],
      //         uiType: 'button',
      //         action: detail.onExecute()
      //       }
      //     )
      //   ),

      //   '<alloy.split-dropdown.arrow>': UiSubstitutes.single(
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
      //   )
      // }, Gamma.sink());

      var spec = f(parts);
      var userSpec = Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, spec);


      var detail = SpecSchema.asStructOrDie('split-dropdown.build', schema, userSpec, Obj.keys(parts));

      var components = UiSubstitutes.substitutePlaces(Option.some('split-dropdown'), detail, detail.components(), {
        '<alloy.split-dropdown.button>': detail.parts().button()(),
        '<alloy.split-dropdown.arrow>': detail.parts().arrow()()
      });

      debugger;

      return SplitDropdownSpec.make(detail, components);
    };

    return {
      build: build
    };
  }
);