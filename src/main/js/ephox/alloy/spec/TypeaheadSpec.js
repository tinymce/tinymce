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
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Value',
    'global!document'
  ],

  function (SystemEvents, EventHandler, Beta, Gamma, ViewTypes, InputSpec, SpecSchema, FieldSchema, Objects, Merger, Fun, Option, Value, document) {
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
        { view: ViewTypes.useList(spec) },
        {
          view: {
            focusClass: 'alloy-selected-item'
          }
        }
      ), Gamma.parts());

      return Merger.deepMerge(
        InputSpec.make(spec),
        {
          streaming: {
            stream: {
              mode: 'throttle',
              delay: 1000
            },
            onStream: function (component, simulatedEvent) {
              var sandbox = component.apis().getCoupled('sandbox');
              var focusInInput = component.apis().isFocused();
              // You don't want it to change when something else has triggered the change.
              if (focusInInput) {
                if (sandbox.apis().isShowing()) sandbox.apis().closeSandbox();
                if (Value.get(component.element()).length >= detail.minChars()) {
                  Beta.enterPopup(detail, component);
                }
              }
            }
          },

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
          keying: {
            mode: 'special',
            onDown: function (comp, simulatedEvent) {
              var sandbox = comp.apis().getCoupled('sandbox');
              if (sandbox.apis().isShowing()) {
                sandbox.getSystem().triggerEvent('keydown', sandbox.element(), simulatedEvent.event());
                return Option.some(true);
              } else {
                return Beta.enterPopup(detail, comp);
              }              
            },
            onEscape: function (comp) {
              return Beta.escapePopup(detail, comp);
            },
            onUp: function (comp, simulatedEvent) {
              var sandbox = comp.apis().getCoupled('sandbox');
              sandbox.getSystem().triggerEvent('keydown', sandbox.element(), simulatedEvent.event());
              return Option.some(true);
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