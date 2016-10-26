define(
  'ephox.alloy.spec.TypeaheadSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dropdown.Beta',
    'ephox.alloy.dropdown.Gamma',
    'ephox.alloy.menu.logic.ViewTypes',
    'ephox.alloy.spec.InputSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Value',
    'ephox.sugar.api.Width',
    'global!document'
  ],

  function (SystemEvents, EventHandler, Beta, Gamma, ViewTypes, InputSpec, SpecSchema, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Merger, Fun, Option, Result, Value, Width, document) {
    var schema = [
      FieldSchema.strict('sink'),
      FieldSchema.strict('fetch'),
      FieldSchema.strict('dom'),
      FieldSchema.option('sink'),
      FieldSchema.defaulted('minChars', 5),
      ViewTypes.schema(),
      FieldSchema.defaulted('onOpen', Fun.noop),
      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.defaulted('matchWidth', true),
      FieldSchema.defaulted('toggleClass', 'alloy-selected-button')
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('typeahead.spec', schema, Merger.deepMerge(
        spec,
        { view: ViewTypes.useList(spec) }
      ), Gamma.parts());

      var fetch = function (comp, sandbox) {
        var fetcher = detail.fetch();
        return fetcher(comp).map(detail.view().preprocess());
      };

      var openPopup = function (comp, sandbox) {
        var futureData = fetch(comp, sandbox);
        sandbox.apis().openSandbox(futureData).get(function () { });
      };

      var showPreview = function (comp, sandbox) {
        if (sandbox.apis().isShowing()) sandbox.apis().closeSandbox();
        var futureData = fetch(comp, sandbox);
        sandbox.apis().showSandbox(futureData).get(function () { });
      };
      var moveToPopup = function (comp) {
        var sandbox = comp.apis().getCoupled('sandbox');
        if (sandbox.apis().isShowing()) {
          sandbox.apis().gotoSandbox();
        } else {
          openPopup(comp, sandbox);
        }
        return Option.some(true);
      };
      
      return Merger.deepMerge(
        InputSpec.make(spec),
        {
          // streaming: {
          //   stream: {
          //     mode: 'throttle',
          //     delay: 1000
          //   },
          //   onStream: function (component, simulatedEvent) {
          //     var sandbox = component.apis().getCoupled('sandbox');
          //     var focusInInput = component.apis().isFocused();
          //     // You don't want it to change when something else has triggered the change.
          //     if (focusInInput) {
          //       if (sandbox.apis().isShowing()) sandbox.apis().closeSandbox();
          //       if (Value.get(component.element()).length >= detail.minChars()) {
          //         showPreview(component, sandbox);
          //       }
          //     }
          //   }
          // },

          events: Objects.wrapAll([
            {
              key: SystemEvents.execute(),
              value: EventHandler.nu({
                run: function (comp) {
                  Beta.togglePopup(detail, comp);
                }
              })
            }
          ]),

          toggling: {
            toggleClass: 'menu-open',
            aria: {
              'aria-expanded-attr': 'aria-expanded'
            }
          },
          // keying: {
          //   mode: 'execution',
          //   useSpace: false,
          //   useEnter: true,
          //   useDown: true
          // },
          keying: {
            mode: 'special',
            onDown: moveToPopup,
            onEscape: function (comp) {
              return Beta.escapePopup(detail, comp);
            }
          },
          dom: {
            classes: [ 'typeahead' ]
          },
          focusing: true,
          tabstopping: true,
          coupling: {
            others: {
              sandbox: function (hotspot) {
                return Beta.makeSandbox(detail, hotspot);
              }
            }
          }
        }
      );
    };

    return {
      make: make
    };
  }
);