define(
  'ephox.alloy.spec.DropdownMenuSpec',

  [
    'ephox.alloy.spec.ButtonSpec',
    'ephox.alloy.spec.MenuSandboxSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Remove'
  ],

  function (ButtonSpec, MenuSandboxSpec, FieldSchema, ValueSchema, Fun, Remove) {
    var make = function (spec) {
      var detail = ValueSchema.asStructOrDie('dropdown.spec', ValueSchema.objOf([
        // Returns a Future{ primary, expansions, menus } object asynchronously
        FieldSchema.strict('fetch'),
        FieldSchema.strict('text'),
        FieldSchema.defaulted('onOpen', Fun.noop),
        FieldSchema.strict('sink')
      ]), spec);

      var open = function (component, sandbox) {
        var fetcher = detail.fetch();
        var futureData = fetcher();
        sandbox.apis().openSandbox(futureData);
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

        return MenuSandboxSpec.make({
          lazyHotspot: Fun.constant(dropdown),
          sink: detail.sink(),
          onOpen: onOpen,
          onClose: onClose
        });
      };

      var togglePopup = function (dropdown) {
        var sandbox = dropdown.apis().getCoupled('sandbox');
        var action = dropdown.apis().isSelected() ? open : close;
        action(dropdown, sandbox);
      };
        
      return ButtonSpec.make({
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
        text: detail.text(),
        coupling: {
          others: {
            sandbox: makeSandbox
          }
        }
      });
    };

    return {
      make: make
    };
  }
);