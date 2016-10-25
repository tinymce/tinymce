define(
  'ephox.alloy.spec.SplitDropdownSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dropdown.Beta',
    'ephox.alloy.menu.grid.GridView',
    'ephox.alloy.menu.layered.LayeredView',
    'ephox.alloy.menu.logic.ViewTypes',
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
    'ephox.perhaps.Result',
    'ephox.sugar.api.Remove',
    'global!Error'
  ],

  function (SystemEvents, EventHandler, Beta, GridView, LayeredView, ViewTypes, WidgetView, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, Objects, ValueSchema, Obj, Merger, Fun, Option, Result, Remove, Error) {
    var schema = [
      FieldSchema.strict('toggleClass'),
      FieldSchema.strict('fetch'),
      FieldSchema.strict('onExecute'),
      FieldSchema.option('sink'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      // FieldSchema.defaulted('onClose', Fun.noop),
      
      FieldSchema.field(
        'parts',
        'parts',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('button'),
          FieldSchema.strict('arrow')
        ])
      ),

      ViewTypes.schema(),

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

      var beta = Beta(detail);

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
      }, {
        '<alloy.sink>': beta.makeSink
      });

      return {
        uid: detail.uid(),
        uiType: 'custom',
        dom: detail.dom(),
        events: Objects.wrapAll([
          {
            key: SystemEvents.execute(),
            value: EventHandler.nu({
              run: function (component) {
                beta.togglePopup(component);
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
            sandbox: beta.makeSandbox
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