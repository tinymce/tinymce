define(
  'ephox.alloy.spec.SplitDropdownSpec',

  [
    'ephox.alloy.menu.grid.GridView',
    'ephox.alloy.menu.layered.LayeredView',
    'ephox.alloy.menu.widget.WidgetView',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Remove'
  ],

  function (GridView, LayeredView, WidgetView, SpecSchema, FieldPresence, FieldSchema, ValueSchema, Merger, Fun, Remove) {
    var schema = [
      FieldSchema.strict('actionButton'),
      FieldSchema.strict('toggleClass'),
      FieldSchema.strict('fetch'),
      FieldSchema.strict('onExecute'),
      FieldSchema.strict('sink'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      // FieldSchema.defaulted('onClose', Fun.noop),

      FieldSchema.field(
        'view',
        'view',
        FieldPresence.strict(),
        ValueSchema.choose(
          'style',
          {
            layered: LayeredView,
            grid: GridView,
            widget: WidgetView
          }
        )
      )
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('split-dropdown.spec', schema, spec);

      var open = function (component, sandbox) {
        var fetcher = detail.fetch();
        var futureData = fetcher();
        // Resolve the future to open the dropdown
        sandbox.apis().openSandbox(futureData).get(function () { });
      };

      var close = function (component, sandbox) {
        sandbox.apis().closeSandbox();
        // INVESTIGATE: Not sure if this is needed. 
        Remove.remove(sandbox.element());
      };

      var togglePopup = function (dropdown) {
        var sandbox = dropdown.apis().getCoupled('sandbox');
        var action = dropdown.apis().isSelected() ? open : close;
        action(dropdown, sandbox);
      };

      var makeSandbox = function (dropdown) {
        // Hotspot should be button, not dropdown
        var hotspot = dropdown.getSystem().getByUid(detail.uid()).getOrDie();
        var onOpen = function (component, menu) {
          detail.onOpen()(dropdown, component, menu);
        };

        var onClose = function (component, menu) {
          dropdown.apis().deselect();
        };

        var interactions = {
          onOpen: onOpen,
          onClose: onClose,
          onExecute: detail.onExecute(),
          sink: detail.sink()
        };


        return detail.view().sandbox().spawn(hotspot, detail, interactions);

      };

      return {
        uid: detail.uid(),
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        tabstopping: true,
        components: [
          Merger.deepMerge(
            {
              focusing: undefined


            },
            detail.actionButton()
          ),

          {
            uiType: 'button',
            action: togglePopup,
            dom: {
              tag: 'button',
              innerHtml: 'v'
            },
            toggling: {
              toggleClass: detail.toggleClass(),
              aria: {
                'aria-expanded-attr': 'aria-expanded'
              }
            },
            eventOrder: {
              // Order, the button state is toggled first, so assumed !selected means close.
              'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
            },
            coupling: {
              others: {
                sandbox: makeSandbox
              }
            },
            tabstopping: undefined,
            focusing: undefined
          }
        ]

      };
    };

    return {
      make: make
    };
  }
);