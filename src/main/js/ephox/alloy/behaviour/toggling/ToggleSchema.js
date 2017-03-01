define(
  'ephox.alloy.behaviour.toggling.ToggleSchema',

  [
    'ephox.alloy.behaviour.toggling.ToggleModes',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun'
  ],

  function (ToggleModes, FieldSchema, ValueSchema, Fun) {
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
            FieldSchema.state('update', Fun.constant(ToggleModes.updatePressed))
          ],
          'checked': [
            FieldSchema.state('update', Fun.constant(ToggleModes.updateChecked))
          ],
          'expanded': [
            FieldSchema.state('update', Fun.constant(ToggleModes.updateExpanded))
          ],
          'selected': [
            FieldSchema.state('update', Fun.constant(ToggleModes.updateSelected))
          ],
          'none': [
            FieldSchema.state('update', Fun.constant(Fun.noop))
          ]
        }
      ))
    ];
  }
);