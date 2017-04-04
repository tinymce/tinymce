define(
  'ephox.alloy.ui.composite.TypeaheadSpec',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dropdown.DropdownUtils',
    'ephox.alloy.ui.common.InputBase',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Value',
    'global!console',
    'global!document'
  ],

  function (Composing, Coupling, Focusing, Highlighting, Representing, Sandboxing, SystemEvents, EventHandler, DropdownUtils, InputBase, Objects, Merger, Fun, Option, Value, console, document) {
    var make = function (detail, components, spec, externals) {
      var navigateList = function (comp, simulatedEvent, highlighter) {
        var sandbox = Coupling.getCoupled(comp, 'sandbox');
        if (Sandboxing.isOpen(sandbox)) {
          Composing.getCurrent(sandbox).each(function (menu) {
            Highlighting.getHighlighted(menu).fold(function () {
              highlighter(menu);
            }, function () {
              sandbox.getSystem().triggerEvent('keydown', menu.element(), simulatedEvent.event());  
            });
          });
        } else {
          DropdownUtils.open(detail, { anchor: 'hotspot', hotspot: comp }, comp, sandbox, externals).get(function () {
            Composing.getCurrent(sandbox).each(highlighter);
          });
        } 
      };


      
      
      var behaviours = {
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
              if (Value.get(component.element()).length >= detail.minChars()) {
                detail.previewing().set(true);
                DropdownUtils.open(detail, {
                  anchor: 'hotspot',
                  hotspot: component
                }, component, sandbox, externals).get(function () {
                  Composing.getCurrent(sandbox).each(Highlighting.highlightFirst);
                });
              }
            }
          }
        },

        keying: {
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
            // FIX: Need to get typeahead working again.
            comp.element().dom().setSelectionRange(currentValue.text.length, currentValue.text.length);
            return Option.some(true);
          }
        },

        toggling: {
          toggleClass: detail.markers().openClass(),
          aria: {
            // TODO: Maybe this should just be expanded?
            mode: 'pressed',
            syncWithExpanded: true
          }
        },

        focusing: true,
        tabstopping: true,
        coupling: {
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
        }
      };

      return Merger.deepMerge(
        {
          behaviours: InputBase.behaviours(detail)
        },
        {
          uid: detail.uid(),
          dom: InputBase.dom(detail),
          behaviours: behaviours,
          events: Objects.wrapAll([
            {
              key: SystemEvents.execute(),
              value: EventHandler.nu({
                run: function (comp) {
                  DropdownUtils.togglePopup(detail, {
                    anchor: 'hotspot',
                    hotspot: comp
                  }, comp, externals);
                }
              })
            },
            {
              key: SystemEvents.postBlur(),
              value: EventHandler.nu({
                run: function (typeahead) {
                  var sandbox = Coupling.getCoupled(typeahead, 'sandbox');
                  Sandboxing.close(sandbox);
                }
              })
            }
          ])
        }
      );
    };

    return {
      make: make
    };
  }
);