define(
  'ephox.alloy.ui.composite.TypeaheadSpec',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.behaviour.Streaming',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.dropdown.DropdownUtils',
    'ephox.alloy.ui.common.InputBase',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Value',
    'global!console',
    'global!document'
  ],

  function (
    Behaviour, Composing, Coupling, Focusing, Highlighting, Keying, Representing, Sandboxing, Streaming, Toggling, SketchBehaviours, AlloyEvents, AlloyTriggers,
    SystemEvents, DropdownUtils, InputBase, Fun, Merger, Option, Value, console, document
  ) {
    var make = function (detail, components, spec, externals) {
      var navigateList = function (comp, simulatedEvent, highlighter) {
        var sandbox = Coupling.getCoupled(comp, 'sandbox');
        if (Sandboxing.isOpen(sandbox)) {
          Composing.getCurrent(sandbox).each(function (menu) {
            Highlighting.getHighlighted(menu).fold(function () {
              highlighter(menu);
            }, function () {
              AlloyTriggers.dispatchEvent(sandbox, menu.element(), 'keydown', simulatedEvent);
            });
          });
        } else {
          var anchor = { anchor: 'hotspot', hotspot: comp };
          var onOpenSync = function (sandbox) {
            Composing.getCurrent(sandbox).each(highlighter);
          };
          DropdownUtils.open(detail, anchor, comp, sandbox, externals, onOpenSync).get(Fun.noop);
        }
      };

      // Due to the fact that typeahead probably need to separate value from text, they can't reuse
      // (easily) the same representing logic as input fields.
      var inputBehaviours = InputBase.behaviours(detail);

      var behaviours = Behaviour.derive([
        Focusing.config({ }),
        Representing.config({
          store: {
            mode: 'dataset',
            getDataKey: function (typeahead) {
              return Value.get(typeahead.element());
            },
            initialValue: detail.data().getOr(undefined),
            getFallbackEntry: function (key) {
              return { value: key, text: key };
            },
            setData: function (typeahead, data) {
              Value.set(typeahead.element(), data.text);
            }
          }
        }),
        Streaming.config({
          stream: {
            mode: 'throttle',
            delay: 1000
          },
          onStream: function (component, simulatedEvent) {

            var sandbox = Coupling.getCoupled(component, 'sandbox');
            var focusInInput = Focusing.isFocused(component);
            // You don't want it to change when something else has triggered the change.
            if (focusInInput) {
              if (Value.get(component.element()).length >= detail.minChars()) {

                var previousValue = Composing.getCurrent(sandbox).bind(function (menu) {
                  return Highlighting.getHighlighted(menu).map(Representing.getValue);
                });

                detail.previewing().set(true);

                var onOpenSync = function (_sandbox) {
                  Composing.getCurrent(sandbox).each(function (menu) {
                    previousValue.fold(function () {
                      Highlighting.highlightFirst(menu);
                    }, function (pv) {
                      Highlighting.highlightBy(menu, function (item) {
                        return Representing.getValue(item).value === pv.value;
                      });

                      // Highlight first if could not find it?
                      Highlighting.getHighlighted(menu).orThunk(function () {
                        Highlighting.highlightFirst(menu);
                      });
                    });
                  });
                };
                
                var anchor = { anchor: 'hotspot', hotspot: component };
                DropdownUtils.open(detail, anchor, component, sandbox, externals, onOpenSync).get(Fun.noop);
              }
            }
          }
        }),

        Keying.config({
          mode: 'special',
          onDown: function (comp, simulatedEvent) {
            navigateList(comp, simulatedEvent, Highlighting.highlightFirst);
            return Option.some(true);
          },
          onEscape: function (comp) {
            var sandbox = Coupling.getCoupled(comp, 'sandbox');
            if (Sandboxing.isOpen(sandbox)) Sandboxing.close(sandbox);
            return Option.some(true);
          },
          onUp: function (comp, simulatedEvent) {
            navigateList(comp, simulatedEvent, Highlighting.highlightLast);
            return Option.some(true);
          },
          onEnter: function (comp, simulatedEvent) {
            var sandbox = Coupling.getCoupled(comp, 'sandbox');
            if (Sandboxing.isOpen(sandbox)) Sandboxing.close(sandbox);
            detail.onExecute()(sandbox, comp);
            var currentValue = Representing.getValue(comp);
            comp.element().dom().setSelectionRange(currentValue.text.length, currentValue.text.length);
            return Option.some(true);
          }
        }),

        Toggling.config({
          toggleClass: detail.markers().openClass(),
          aria: {
            // TODO: Maybe this should just be expanded?
            mode: 'pressed',
            syncWithExpanded: true
          }
        }),

        Coupling.config({
          others: {
            sandbox: function (hotspot) {
              return DropdownUtils.makeSandbox(detail, {
                anchor: 'hotspot',
                hotspot: hotspot
              }, hotspot, {
                onOpen: Fun.identity,
                onClose: Fun.identity
              });
            }
          }
        })
      ]);

      return {
        uid: detail.uid(),
        dom: InputBase.dom(detail),
        behaviours: Merger.deepMerge(
          inputBehaviours,
          behaviours,
          SketchBehaviours.get(detail.typeaheadBehaviours())
        ),

        events: AlloyEvents.derive([
          AlloyEvents.runOnExecute(function (comp) {
            var anchor = { anchor: 'hotspot', hotspot: comp };
            var onOpenSync = Fun.noop;
            DropdownUtils.togglePopup(detail, anchor, comp, externals, onOpenSync).get(Fun.noop);
          })
        ].concat(detail.dismissOnBlur() ? [
          AlloyEvents.run(SystemEvents.postBlur(), function (typeahead) {
            var sandbox = Coupling.getCoupled(typeahead, 'sandbox');
            Sandboxing.close(sandbox);
          })
        ] : [ ]))
      };
    };

    return {
      make: make
    };
  }
);