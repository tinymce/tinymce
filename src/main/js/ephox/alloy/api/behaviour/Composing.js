define(
  'ephox.alloy.api.behaviour.Composing',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.composing.ComposeApis',
    'ephox.alloy.behaviour.composing.ComposeSchema'
  ],

  function (Behaviour, ComposeApis, ComposeSchema) {
    return Behaviour.create({
      fields: ComposeSchema,
      name: 'composing',
      apis: ComposeApis
    });
  }
);