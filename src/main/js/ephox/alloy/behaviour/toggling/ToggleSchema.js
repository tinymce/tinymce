define(
  'ephox.alloy.behaviour.toggling.ToggleSchema',

  [
    'ephox.alloy.behaviour.toggling.ToggleModes',
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun'
  ],

  function (ToggleModes, Fields, FieldSchema, ValueSchema, Fun) {
    return [
      FieldSchema.defaulted('selected', false),
      FieldSchema.strict('toggleClass'),
      FieldSchema.defaulted('toggleOnExecute', true),

      FieldSchema.defaultedOf('aria', {
        mode: 'none'
      }, ValueSchema.choose(
        'mode', {
          'pressed': [
            FieldSchema.defaulted('syncWithExpanded', false),
            Fields.output('update', ToggleModes.updatePressed)
          ],
          'checked': [
            Fields.output('update', ToggleModes.updateChecked)
          ],
          'expanded': [
            Fields.output('update', ToggleModes.updateExpanded)
          ],
          'selected': [
            Fields.output('update', ToggleModes.updateSelected)
          ],
          'none': [
            Fields.output('update', Fun.noop)
          ]
        }
      ))
    ];
  }
);