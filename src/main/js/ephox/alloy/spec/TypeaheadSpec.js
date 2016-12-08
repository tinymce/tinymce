define(
  'ephox.alloy.spec.TypeaheadSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dropdown.Beta',
    'ephox.alloy.spec.InputSpec',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Value',
    'global!document'
  ],

  function (SystemEvents, Coupling, Focusing, Highlighting, Keying, Sandboxing, EventHandler, Beta, InputSpec, Objects, Merger, Fun, Option, Value, document) {
    var make = function (detail, components, spec, externals) {

      var getMenu = function (sandbox) {
        return Sandboxing.getState(sandbox).bind(function (tiers) {
          return Highlighting.getHighlighted(tiers);
        });
      };

      var navigateList = function (comp, simulatedEvent, highlighter) {
        var sandbox = Coupling.getCoupled(comp, 'sandbox');
        if (Sandboxing.isOpen(sandbox)) {
          getMenu(sandbox).each(function (menu) {
            Highlighting.getHighlighted(menu).fold(function () {
              highlighter(menu);
            }, function () {
              sandbox.getSystem().triggerEvent('keydown', menu.element(), simulatedEvent.event());  
            });
          });
        } else {
          Beta.open(detail, { anchor: 'hotspot', hotspot: comp }, comp, sandbox, externals).get(function () {
            getMenu(sandbox).each(highlighter);
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
            console.log('onStream');
            var sandbox = Coupling.getCoupled(component, 'sandbox');
            var focusInInput = Focusing.isFocused(component);
            // You don't want it to change when something else has triggered the change.
            if (focusInInput) {
              console.log('focusInInput');
              /* REM:  if (Sandboxing.isShowing(sandbox)) Sandboxing.closeSandbox(sandbox); 
                This line makes it flicker. I wonder what it was for.
              */
              if (Value.get(component.element()).length >= detail.minChars()) {
                console.log('enough chars');
                detail.previewing().set(true);

                
                Beta.open(detail, {
                  anchor: 'hotspot',
                  hotspot: component
                }, component, sandbox, externals).get(function () {
                  getMenu(sandbox).each(Highlighting.highlightFirst);
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
            return Beta.escapePopup(detail, comp);
          },
          onUp: function (comp, simulatedEvent) {
            navigateList(comp, simulatedEvent, Highlighting.highlightLast);
            return Option.some(true);
          },
          onEnter: function (comp, simulatedEvent) {
            var sandbox = Coupling.getCoupled(comp, 'sandbox');
            if (Sandboxing.isOpen(sandbox)) Sandboxing.close(sandbox);
            detail.onExecute()(sandbox, comp);
            return Option.some(true);
          }
        },

        toggling: {
          toggleClass: 'menu-open',
          aria: {
            'aria-expanded-attr': 'aria-expanded'
          }
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
      };

      return Merger.deepMerge(
        InputSpec.make(spec),
        {
          behaviours: behaviours,
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
          ])
        }
      );
    };

    return {
      make: make
    };
  }
);