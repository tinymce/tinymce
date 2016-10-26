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
    'ephox.scullion.Cell',
    'ephox.sugar.api.Value',
    'ephox.violin.Strings',
    'global!document'
  ],

  function (SystemEvents, EventHandler, Beta, Gamma, ViewTypes, InputSpec, SpecSchema, FieldSchema, Objects, Merger, Fun, Option, Cell, Value, Strings, document) {
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
      FieldSchema.defaulted('toggleClass', 'alloy-selected-button'),
      FieldSchema.state('previewing', function () {
        return Cell(true);
      })
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('typeahead.spec', schema, Merger.deepMerge(
        spec,
        { view: ViewTypes.useList(spec) },
        {
          view: {
            fakeFocus: true,
            onHighlight: function (menu, item) {
              if (! detail.previewing().get()) {
                menu.getSystem().getByUid(detail.uid()).each(function (input) {
                  input.apis().setValue(item.apis().getValue());
                });
              } else {
                // Highlight the rest of the text so that the user types over it.
                menu.getSystem().getByUid(detail.uid()).each(function (input) {
                  var currentValue = input.apis().getValue();
                  var nextValue = item.apis().getValue();
                  if (Strings.startsWith(nextValue, currentValue)) {
                    input.apis().setValue(nextValue);
                    input.element().dom().setSelectionRange(currentValue.length, nextValue.length);
                  }
                  
                });
              }
              detail.previewing().set(false);
            }
          }
        },

        // Find a nice way of doing this.
        {
          onExecute: function (sandbox, item) {
            sandbox.apis().closeSandbox();
            var currentValue = item.apis().getValue();
            return item.getSystem().getByUid(detail.uid()).bind(function (input) {
              input.element().dom().setSelectionRange(currentValue.length, currentValue.length);
              // Should probably streamline this one.
              var other = spec.onExecute !== undefined ? spec.onExecute : Fun.noop;
              other(sandbox, input);
              return Option.some(true);
            });
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
                  detail.previewing().set(true);
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
            },
            onEnter: function (comp, simulatedEvent) {
              var sandbox = comp.apis().getCoupled('sandbox');
              detail.onExecute()(sandbox, comp);
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