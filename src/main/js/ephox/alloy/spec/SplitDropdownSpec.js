define(
  'ephox.alloy.spec.SplitDropdownSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.grid.GridView',
    'ephox.alloy.menu.layered.LayeredView',
    'ephox.alloy.menu.widget.WidgetView',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Remove'
  ],

  function (SystemEvents, EventHandler, GridView, LayeredView, WidgetView, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, Objects, ValueSchema, Obj, Merger, Fun, Option, Remove) {
    var schema = [
      FieldSchema.strict('toggleClass'),
      FieldSchema.strict('fetch'),
      FieldSchema.strict('onExecute'),
      FieldSchema.strict('sink'),
      FieldSchema.strict('dom'),
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

      var togglePopup = function (hotspot) {
        var sandbox = hotspot.apis().getCoupled('sandbox');
        var action = hotspot.apis().isSelected() ? open : close;
        action(hotspot, sandbox);
      };

      var makeSandbox = function (hotspot) {
        var onOpen = function (component, menu) {
          detail.onOpen()(hotspot, component, menu);
        };

        var onClose = function (component, menu) {
          hotspot.apis().deselect();
        };

        var interactions = {
          onOpen: onOpen,
          onClose: onClose,
          onExecute: detail.onExecute(),
          sink: detail.sink()
        };


        return detail.view().sandbox().spawn(hotspot, detail, interactions);

      };

      // Need to make the substitutions for "button" and "arrow"
      var components = UiSubstitutes.substitutePlaces(Option.some('split-dropdown'), detail, detail.components(), {
        '<alloy.split-dropdown.button>': UiSubstitutes.single(
          Merger.deepMerge(
            {
              focusing: undefined


            },
            detail.parts().button(),
            {
              uid: detail.partUids().button
            }
          )
        ),

        '<alloy.split-dropdown.arrow>': UiSubstitutes.single(
          Merger.deepMerge({
            uiType: 'button',
            
            
            
            
            tabstopping: undefined,
            focusing: undefined
          }, detail.parts().arrow(), {
            uid: detail.partUids().arrow,
            action: function (arrow) {
              var hotspot = arrow.getSystem().getByUid(detail.uid()).getOrDie();
              hotspot.getSystem().triggerEvent(SystemEvents.execute(), hotspot.element(), { });
            }
          })
        )
      });

      return {
        uid: detail.uid(),
        uiType: 'custom',
        dom: detail.dom(),
        tabstopping: true,
        events: Objects.wrapAll([
          {
            key: SystemEvents.execute(),
            value: EventHandler.nu({
              run: function (component) {
                togglePopup(component);
              }
            })
          }

        ]),
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
        keying: {
          mode: 'execution',
          useSpace: true
        },
        focusing: true,
        components: components
      };
    };

    return {
      make: make
    };
  }
);