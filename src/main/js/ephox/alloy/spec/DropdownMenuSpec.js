define(
  'ephox.alloy.spec.DropdownMenuSpec',

  [
    'ephox.alloy.spec.ButtonSpec',
    'ephox.alloy.spec.MenuSandboxSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.epithet.Id',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Remove'
  ],

  function (ButtonSpec, MenuSandboxSpec, SpecSchema, FieldSchema, ValueSchema, Arr, Id, Merger, Fun, Option, Remove) {
    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('dropdown.button', [
        FieldSchema.strict('fetch'),
        FieldSchema.defaulted('onOpen', Fun.noop),
        FieldSchema.defaulted('onExecute', Option.none),
        FieldSchema.defaulted('toggleClass', 'alloy-selected-button'),
        FieldSchema.strict('dom'),
        FieldSchema.option('sink')
      ], spec, { });

      var components = detail.components();

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
          return dropdown.getSystem().getByUid(dropdownUid + '-internal-sink').getOrDie();
        });

        return MenuSandboxSpec.make({
          lazyHotspot: Fun.constant(dropdown),
          sink: sink,
          onOpen: onOpen,
          onClose: onClose,
          uid: detail.uid() + '-sandbox',
          onExecute: detail.onExecute()
        });
      };

      var togglePopup = function (dropdown) {
        var sandbox = dropdown.apis().getCoupled('sandbox');
        var action = dropdown.apis().isSelected() ? open : close;
        action(dropdown, sandbox);
      };
        
      var dropdownUid = Id.generate('dropdown');

      console.log('dropdown.menu.spec', spec);


      var base = Merger.deepMerge(
        spec,
        ButtonSpec.make({
          action: togglePopup,
          toggling: {
            toggleClass: detail.toggleClass(),
            aria: {
              'aria-expanded-attr': 'aria-expanded'
            }
          },
          dom: detail.dom(),
          components: components,
          keying: {
            useDown: true
          },   
          eventOrder: {
            // Order, the button state is toggled first, so assumed !selected means close.
            'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
          },
          uid: detail.uid() + '-button',
          coupling: {
            others: {
              sandbox: makeSandbox
            }
          }
        })
      );

      var xx = detail.sink().fold(function () {
        // The sink will be inline.
        return {
          uiType: 'custom',
          dom: {
            tag: 'div',
            styles: {
              display: 'inline-block'
            }
          },
          uid: detail.uid(),
          components: [
            base,
            {
              uiType: 'custom',
              dom: { tag: 'div' },
              uid: dropdownUid + '-internal-sink',
              positioning: {
                useFixed: false
              }
            }
          ]
        };
      }, Fun.constant(base));

      console.log('xx', xx);

      return xx;
    };

    return {
      make: make
    };
  }
);