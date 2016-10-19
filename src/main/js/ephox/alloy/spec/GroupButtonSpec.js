define(
  'ephox.alloy.spec.GroupButtonSpec',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (EventHandler, FieldPresence, FieldSchema, ValueSchema, Arr, Merger, Fun) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('action'),
      FieldSchema.strict('buttonTypes'),
      FieldSchema.strict('buttonClass'),
      FieldSchema.strict('selectedClass'),
      FieldSchema.field(
        'buttons',
        'buttons',
        FieldPresence.strict(),
        ValueSchema.arrOf(
          ValueSchema.objOf([
            FieldSchema.strict('value'),
            FieldSchema.strict('spec'),
            FieldSchema.option('extra')
          ])
        )
      ),
      FieldSchema.option('uid')
    ]);


    var make = function (spec) {
      // Not sure about where these getOrDie statements are
      var detail = ValueSchema.asStructOrDie('gropubutton.spec', schema, spec);


      var actionEvent = 'alloy.groupbutton.value';

      return Merger.deepMerge(spec, {
        type: 'custom',
        dom: {
          tag: 'div',
          styles: {
            display: 'flex'
          },
          classes: [ 'ephox-alloy-toolbar-item' ]
        },
        components: Arr.map(detail.buttons(), function (buttonSpec) {
          return Merger.deepMerge(
            {
              uiType: 'button',
              buttonType: buttonSpec.spec(),
              dom: {
                classes: [ detail.buttonClass() ]
              }
              // toggling: {
              //   toggleClass: detail.toggleClass()
              // }
            }, {
              buttonType: {
                mode: detail.buttonTypes()
              }
            }, buttonSpec.extra().getOr({ }), {
              action: function (button) {
                button.getSystem().triggerEvent(actionEvent, button.element(), {
                  value: buttonSpec.value,
                  button: Fun.constant(button)
                });
              }
            }
          );
        }),
        highlighting: {
          highlightClass: detail.selectedClass(),
          itemClass: detail.buttonClass()
        },
        events: {
          'alloy.groupbutton.value': EventHandler.nu({
            run: function (component, event) {
              component.apis().highlight(event.event().button());
              detail.action()(event.event().value());
            }
          })
        }
      });
    };

    return {
      make: make
    };
  }
);