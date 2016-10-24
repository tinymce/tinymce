define(
  'ephox.alloy.spec.DropdownMenuSpec',

  [
    'ephox.alloy.dropdown.Dropdown',
    'ephox.alloy.menu.grid.GridView',
    'ephox.alloy.menu.layered.LayeredView',
    'ephox.alloy.spec.ButtonSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.epithet.Id',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Remove'
  ],

  function (Dropdown, GridView, LayeredView, ButtonSpec, SpecSchema, FieldPresence, FieldSchema, ValueSchema, Id, Merger, Fun, Option, Remove) {
    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('dropdownmenu', [
        FieldSchema.strict('fetch'),
        FieldSchema.defaulted('onOpen', Fun.noop),
        FieldSchema.defaulted('onExecute', Option.none),
        FieldSchema.defaulted('toggleClass', 'alloy-selected-button'),
        FieldSchema.defaulted('processData', Fun.identity),
        FieldSchema.strict('dom'),
        FieldSchema.option('sink')
      ], spec, { });

      return Dropdown.make(
        Merger.deepMerge({
          view: {
            style: 'layered',
            members: spec.members,
            markers: spec.markers
          }
        }, spec)
      );

      var components = detail.components();

      var open = function (component, sandbox) {
        var fetcher = detail.fetch();
        
        var futureData = fetcher().map(detail.processData());
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

        var interactions = {
          onOpen: onOpen,
          onClose: onClose,
          onExecute: detail.onExecute(),
          sink: sink
        };

        return detail.view().sandbox().spawn(dropdown, detail, interactions);
      };

      var togglePopup = function (dropdown) {
        var sandbox = dropdown.apis().getCoupled('sandbox');
        var action = dropdown.apis().isSelected() ? open : close;
        action(dropdown, sandbox);
      };
        
      var dropdownUid = Id.generate('dropdown');

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
          uid: detail.uid(),
          components: [
            base,
            {
              uiType: 'custom',
              dom: { tag: 'div', classes: [ 'ephox-chameleon-popup-container' ] },
              uid: dropdownUid + '-internal-sink',
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