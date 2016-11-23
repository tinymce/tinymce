define(
  'ephox.alloy.spec.TypeaheadSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sandboxing',
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

  function (SystemEvents, Coupling, Focusing, Representing, Sandboxing, EventHandler, Beta, Gamma, ViewTypes, InputSpec, SpecSchema, FieldSchema, Objects, Merger, Fun, Option, Cell, Value, Strings, document) {
    var schema = [
      FieldSchema.strict('lazySink'),
      FieldSchema.strict('fetch'),
      FieldSchema.strict('dom'),
      FieldSchema.option('lazySink'),
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
                  console.log('item', item.element().dom());
                  Representing.setValueFrom(input, item);
                });
              } else {
                // Highlight the rest of the text so that the user types over it.
                menu.getSystem().getByUid(detail.uid()).each(function (input) {
                  // FIX: itemData.value
                  var currentValue = Representing.getValue(input).text;
                  var nextValue = Representing.getValue(item);
                  if (Strings.startsWith(nextValue.text, currentValue)) {
                    Representing.setValue(input, nextValue);
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
            Sandboxing.closeSandbox(sandbox);
            var currentValue = Representing.getValue(item);
            return item.getSystem().getByUid(detail.uid()).bind(function (input) {
              // FIX: itemData.text
              input.element().dom().setSelectionRange(currentValue.text.length, currentValue.text.length);
              // Should probably streamline this one.
              var other = spec.onExecute !== undefined ? spec.onExecute : Option.none;
              return other(sandbox, input);
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
              var sandbox = Coupling.getCoupled(component, 'sandbox');
              var focusInInput = Focusing.isFocused(component);
              // You don't want it to change when something else has triggered the change.
              if (focusInInput) {
                /* REM:  if (Sandboxing.isShowing(sandbox)) Sandboxing.closeSandbox(sandbox); 
                  This line makes it flicker. I wonder what it was for.
                */
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
            },
            {
              key: SystemEvents.postBlur(),
              value: EventHandler.nu({
                run: function (typeahead) {
                  var sandbox = Coupling.getCoupled(typeahead, 'sandbox');
                  // Sandboxing.closeSandbox(sandbox);
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
              var sandbox = Coupling.getCoupled(comp, 'sandbox');
              if (Sandboxing.isShowing(sandbox)) {
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
              var sandbox = Coupling.getCoupled(comp, 'sandbox');
              sandbox.getSystem().triggerEvent('keydown', sandbox.element(), simulatedEvent.event());
              return Option.some(true);
            },
            onEnter: function (comp, simulatedEvent) {
              var sandbox = Coupling.getCoupled(comp, 'sandbox');
              return detail.onExecute()(sandbox, comp);
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
                return Beta.makeSandbox(detail, {
                  anchor: 'hotspot',
                  hotspot: hotspot
                }, hotspot, {
                  onOpen: Fun.identity,
                  onClose: Fun.identity
                });
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