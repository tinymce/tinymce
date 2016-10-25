define(
  'ephox.alloy.spec.SplitDropdownSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.grid.GridView',
    'ephox.alloy.menu.layered.LayeredView',
    'ephox.alloy.menu.widget.WidgetView',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Remove'
  ],

  function (SystemEvents, EventHandler, GridView, LayeredView, WidgetView, Tagger, SpecSchema, FieldPresence, FieldSchema, Objects, ValueSchema, Obj, Merger, Fun, Cell, Remove) {
    var schema = [
      FieldSchema.strict('toggleClass'),
      FieldSchema.strict('fetch'),
      FieldSchema.strict('onExecute'),
      FieldSchema.strict('sink'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      
      FieldSchema.field(
        'parts',
        'parts',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('button'),
          FieldSchema.strict('arrow')
        ])
      ),

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
      ),


      FieldSchema.state(
        'partUids',
        function (spec) {
          var uids = Obj.map(spec.parts, function (v, k) {
            return Objects.readOptFrom(v, 'uid').getOrThunk(function () {
              return spec.uid + '-' + k;
            });
          });
          return uids;
        }
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

      var togglePopup = function (arrow) {
        var sandbox = arrow.apis().getCoupled('sandbox');
        var action = arrow.apis().isSelected() ? open : close;
        action(arrow, sandbox);
      };

      var makeSandbox = function (arrow) {
        // Hotspot should be button, not arrow
        var hotspot = arrow.getSystem().getByUid(detail.uid()).getOrDie();

        var onOpen = function (component, menu) {
          detail.onOpen()(arrow, component, menu);
        };

        var onClose = function (component, menu) {
          arrow.apis().deselect();
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
        events: Objects.wrapAll([
          {
            key: SystemEvents.execute(),
            value: EventHandler.nu({
              run: function (component) {
                var arrow = component.getSystem().getByUid(detail.partUids().arrow).getOrDie();
                component.getSystem().triggerEvent(SystemEvents.execute(), arrow.element(), { });
              }
            })
          }

        ]),
        keying: {
          mode: 'execution',
          useSpace: true
        },
        focusing: true,
        components: [
          Merger.deepMerge(
            {
              focusing: undefined


            },
            detail.parts().button(),
            {
              uid: detail.partUids().button
            }
          ),

          Merger.deepMerge({
            uiType: 'button',
            
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
          }, detail.parts().arrow(), {
            uid: detail.partUids().arrow,
            action: togglePopup
          })
        ]

      };
    };

    return {
      make: make
    };
  }
);