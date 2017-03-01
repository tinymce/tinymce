define(
  'ephox.alloy.behaviour.toggling.ToggleSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.sugar.api.properties.Attr'
  ],

  function (FieldSchema, ValueSchema, Attr) {
    return [
      FieldSchema.defaulted('selected', false),
      FieldSchema.strict('toggleClass'),
      FieldSchema.defaulted('toggleOnExecute', true),

      FieldSchema.defaultedOf('aria', {
        mode: 'pressed'
       }, ValueSchema.choose(
        'mode', {
          'pressed': [
            FieldSchema.defaulted('syncWithExpanded', false),
            FieldSchema.state('update', function () {
              return function (component, ariaInfo, status) {
                Attr.set(component.element(), 'aria-pressed', status);
                if (ariaInfo.syncWithExpanded()) Attr.set(component.element(), 'aria-expanded', status);
              };
            })
          ]
        }
      ))
    ];
  }
);