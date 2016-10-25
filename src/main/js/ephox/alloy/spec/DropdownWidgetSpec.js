define(
  'ephox.alloy.spec.DropdownWidgetSpec',

  [
    'ephox.alloy.dropdown.Beta',
    'ephox.alloy.dropdown.Dropdown',
    'ephox.alloy.dropdown.DropdownBehaviour',
    'ephox.alloy.menu.logic.ViewTypes',
    'ephox.alloy.spec.ButtonSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Width'
  ],

  function (Beta, Dropdown, DropdownBehaviour, ViewTypes, ButtonSpec, SpecSchema, UiSubstitutes, FieldSchema, Merger, Fun, Option, Width) {
    // DUPE:
    var schema = [
      FieldSchema.strict('fetch'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.defaulted('toggleClass', 'alloy-selected-button'),
      FieldSchema.strict('dom'),
      FieldSchema.option('sink'),
      ViewTypes.schema()
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('dropdown.widget', schema, Merger.deepMerge(spec, {
        view: ViewTypes.useWidget(spec)
      }));

      var beta = Beta(detail);

      var factories = {
        '<alloy.sink>': beta.makeSink
      };

      var components = UiSubstitutes.substitutePlaces(Option.none(), detail, detail.components(), { }, factories);

      return Merger.deepMerge(
        ButtonSpec.make({
          uid: detail.uid(),
          action: function (button) {
            beta.togglePopup(button)
          }
        }), {
        uid: detail.uid(),
          uiType: 'button',
          dom: detail.dom(),
          components: components,
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
          focusing: true
        }
      );
      // SpecSchema.extend(Dropdown.make, spec, {
      //   fetch: detail.fetchWidget,
      //   sink: detail.sink.getOr(undefined),
      //   onOpen: function (button, sandbox, container) {
      //     var buttonWidth = Width.get(button.element());
      //     Width.set(container.element(), buttonWidth);
      //     detail.onOpen(button, sandbox, container);
      //   },
      //   onExecute: detail.onExecute,
      //   components: components,
      //   behaviours: [
      //     DropdownBehaviour(detail)
      //   ],
      //   view: ViewTypes.useWidget(spec)
      // }, factories);
    };

    return {
      make: make
    };
  }
);