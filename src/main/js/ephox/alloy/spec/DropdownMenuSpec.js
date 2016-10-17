define(
  'ephox.alloy.spec.DropdownMenuSpec',

  [
    'ephox.alloy.spec.ButtonSpec',
    'ephox.alloy.spec.MenuSandboxSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.epithet.Id',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Remove'
  ],

  function (ButtonSpec, MenuSandboxSpec, FieldSchema, ValueSchema, Id, Fun, Option, Remove) {
    var make = function (spec) {
      var detail = ValueSchema.asStructOrDie('dropdown.spec', ValueSchema.objOf([
        // Returns a Future{ primary, expansions, menus } object asynchronously
        FieldSchema.strict('fetch'),
        FieldSchema.strict('text'),
        FieldSchema.defaulted('onOpen', Fun.noop),
        FieldSchema.defaulted('onExecute', Option.none),
        FieldSchema.option('sink'),
        FieldSchema.option('uid')
      ]), spec);

      var open = function (component, sandbox) {
        var fetcher = detail.fetch();

        var futureData = fetcher();
        // Resolve the future to open the dropdown
        sandbox.apis().openSandbox(futureData).get(function () { });
      };

      var close = function (component, sandbox) {
        sandbox.apis().closeSandbox();
        Remove.remove(sandbox.element());
      };

      var makeSandbox = function (dropdown) {
        var onOpen = function (component, menu) {
          detail.onOpen()(dropdown, component, menu);
        };

        var onClose = function (component, menu) {
          dropdown.apis().deselect();
        };

        var sink = detail.sink().getOrThunk(function () {
          return dropdown.getSystem().getByUid(dropdownUid + '-sandbox').getOrDie();
        });

        return MenuSandboxSpec.make({
          lazyHotspot: Fun.constant(dropdown),
          sink: sink,
          onOpen: onOpen,
          onClose: onClose,
          onExecute: detail.onExecute()
        });
      };

      var togglePopup = function (dropdown) {
        var sandbox = dropdown.apis().getCoupled('sandbox');
        var action = dropdown.apis().isSelected() ? open : close;
        action(dropdown, sandbox);
      };
        
      var dropdownUid = Id.generate('dropdown');

      var base = ButtonSpec.make({
        action: togglePopup,
        toggling: {
          toggleClass: 'menu-open',
          aria: {
            'aria-expanded-attr': 'aria-expanded'
          }
        },
        keying: {
          useDown: true
        },   
        eventOrder: {
          // Order, the button state is toggled first, so assumed !selected means close.
          'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
        },
        uid: detail.uid().getOr(undefined),
        text: detail.text(),
        coupling: {
          others: {
            sandbox: makeSandbox
          }
        }
      });

      return detail.sink().fold(function () {
        // The sink will be inline.
        return {
          uiType: 'custom',
          dom: {
            tag: 'div',
            styles: {
              display: 'inline-block'
            }
          },
          components: [
            base,
            {
              uiType: 'custom',
              dom: { tag: 'div' },
              uid: dropdownUid + '-sandbox',
              positioning: {
                useFixed: false
              }
            }
          ]
        };
      }, Fun.constant(base));
    };

    return {
      make: make
    };
  }
);