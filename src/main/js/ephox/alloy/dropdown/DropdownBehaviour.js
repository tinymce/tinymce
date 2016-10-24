define(
  'ephox.alloy.dropdown.DropdownBehaviour',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, DomModification, FieldPresence, FieldSchema, ValueSchema, Fun) {
    return function (rawDetail) {
      return Behaviour.contract({
        name: Fun.constant('dropdown.button.api'),
        exhibit: function () { return DomModification.nu({ }); },
        handlers: Fun.constant({ }),
        apis: function (info) {
          return {
            showValue: function (component, value) {
              var displayer = component.getSystem().getByUid(rawDetail.uid + '-dropdown.display').getOrDie();
              displayer.apis().setValue(value);
            }
          };
        },
        schema: Fun.constant(FieldSchema.field(
          'dropdown.api',
          'dropdown.api',
          FieldPresence.asOption(),
          ValueSchema.anyValue()
        ))
      });
    };
  }
);