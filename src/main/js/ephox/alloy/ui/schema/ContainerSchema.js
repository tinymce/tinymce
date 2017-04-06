define(
  'ephox.alloy.ui.schema.ContainerSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (FieldSchema, Fun) {
    return {
      name: Fun.constant('Container'),
      schema: Fun.constant([
        FieldSchema.defaulted('components', [ ]),
        FieldSchema.defaulted('containerBehaviours', { }),
        FieldSchema.defaulted('events', { }),
        FieldSchema.defaulted('domModification', { }),
        FieldSchema.defaulted('eventOrder', { }),
        FieldSchema.defaulted('customBehaviours', [ ])
      ]),
      parts: Fun.constant([ ])
    };
  }
);