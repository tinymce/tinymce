define(
  'ephox.alloy.positioning.ModalAnchor',

  [
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.positioning.Anchoring',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.repartee.api.Bubble',
    'ephox.sugar.api.Insert'
  ],

  function (GuiTypes, Anchoring, FieldSchema, Fun, Option, Bubble, Insert) {
    var placement = function (component, posInfo, anchorInfo, origin) {

      var placer = function (component, origin, anchoring, posInfo, placee) {
        console.log('placee', placee.element().dom().cloneNode(true));
        var modal = component.getSystem().build({
          dom: {
            tag: 'div',
            styles: {
              'position': 'fixed',
              'left': '0px',
              'top': '0px',
              'right': '0px',
              'bottom': '0px',
              'background-color': 'rgba(20,20,20,0.5)',
              'z-index': '100000000'
            },
            // FIX: Remove hard-coding
            classes: [ 'ephox-gel-centered-dialog', 'ephox-gel-modal' ]
          },
          components: [
            GuiTypes.premade(placee)
          ]
        });

        console.log('modal', modal.element().dom());

        Insert.append(component.element(), modal.element());
      };

      return Option.some(
        Anchoring({
          // Unnecessary
          anchorBox: Fun.constant({ }),
          bubble: Fun.constant(Bubble(0, 0)),
          // maxHeightFunction: Fun.constant(MaxHeight.available()),
          overrides: Fun.constant({ }),
          layouts: Fun.constant([ ]),
          placer: Fun.constant(Option.some(placer))
        })
      );
    };

    return [
      FieldSchema.state('placement', function () {
        return placement;
      })
    ];
  }
);