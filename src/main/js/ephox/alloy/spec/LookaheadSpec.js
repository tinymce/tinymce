define(
  'ephox.alloy.spec.LookaheadSpec',

  [
    'ephox.alloy.spec.InputSpec',
    'ephox.alloy.spec.MenuSandboxSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.knoch.future.Future',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Value',
    'ephox.sugar.api.Width',
    'global!document'
  ],

  function (InputSpec, MenuSandboxSpec, FieldSchema, Objects, ValueSchema, Arr, Merger, Future, Option, Attr, Value, Width, document) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('sink'),
      FieldSchema.strict('fetchItems'),
      FieldSchema.strict('desc')
    ]);

    var make = function (spec) {
      var detail = ValueSchema.asStructOrDie('lookahead.spec', schema, spec);

      var fetch = function (comp, sandbox) {
        var fetcher = detail.fetchItems();
        // TODO: Move "representing" behaviour across.
        var typed = Value.get(comp.element());

        return Future.nu(function (callback) {
          fetcher(typed, function (rawItems) {
            var items = Arr.map(rawItems, function (item) {
              return Merger.deepMerge({
                type: 'item'
              }, item);
            });

            var primary = detail.desc() + '-dropdown';
            var expansions = {};
            var menus = Objects.wrap(primary, items);

            callback({
              primary: primary,
              menus: menus,
              expansions: expansions
            });
          });  
        });     
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
      
      return Merger.deepMerge(InputSpec.make(spec), {
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
              if (Value.get(component.element()).length > 3) {
                showPreview(component, sandbox);
              }
            }
          }
        },
        toggling: {
          toggleClass: 'menu-open',
          aria: {
            'aria-expanded-attr': 'aria-expanded'
          }
        },
        keying: {
          mode: 'special',
          onDown: moveToPopup
        },
        dom: {
          classes: [ 'dropdown-button' ]
        },
        focusing: true,
        tabstopping: true,
        coupling: {
          others: {
            sandbox: function (owner) {
              return MenuSandboxSpec.make({
                lazyHotspot: function () {
                  return owner;
                },
                sink: detail.sink(),
                onClose: function (sandbox) {
                  owner.apis().deselect();
                },
                onOpen: function (sandbox, menu) {
                  var inputWidth = Width.get(owner.element());
                  Width.set(menu.element(), inputWidth);
                },
                onExecute: function (sandbox, target) {
                  var input = owner.element();
                  Value.set(input, Attr.get(target, 'data-item-text'));
                  sandbox.apis().closeSandbox(Option.none());
                  owner.apis().focus();
                }
              });
            }
          }
        }
      });
    };

    return {
      make: make
    };
  }
);