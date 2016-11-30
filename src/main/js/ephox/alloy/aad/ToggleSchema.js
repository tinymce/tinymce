define(
  'ephox.alloy.aad.ToggleSchema',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.boulder.api.FieldSchema'
  ],

  function (Behaviour, FieldSchema) {
    return Behaviour.schema('toggling', [
      FieldSchema.defaulted('selected', false),
      FieldSchema.defaulted('toggleClass', 'selected'),
      FieldSchema.defaulted('toggleOnExecute', true),

      FieldSchema.defaultedObjOf('aria', { }, [
        FieldSchema.defaulted('aria-pressed-attr', 'aria-pressed'),
        // TODO: Do this based on presence of aria-haspopup ?
        FieldSchema.option('aria-expanded-attr')
      ])
    ]);
  }
);