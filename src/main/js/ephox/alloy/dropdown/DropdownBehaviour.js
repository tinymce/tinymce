define(
  'ephox.alloy.dropdown.DropdownBehaviour',

  [
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Representing, Behaviour, DomModification, FieldPresence, FieldSchema, ValueSchema, Fun) {
    return function (displayUid) {
      return Behaviour.contract({
        name: Fun.constant('dropdown.button.api'),
        exhibit: function () { return DomModification.nu({ }); },
        handlers: Fun.constant({ }),
        apis: function (info) {
          return {
            showValue: function (component, value) {
              var displayer = component.getSystem().getByUid(displayUid).getOrDie();
              Representing.setValue(displayer, value);
            }
          };
        },
        schema: Fun.constant(FieldSchema.option('dropdown.api'))
      });
    };
  }
);